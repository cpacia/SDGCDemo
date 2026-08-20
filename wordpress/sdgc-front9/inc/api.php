<?php
/**
 * The Front9 public API client.
 *
 * Every read is public and unauthenticated, and every response is cached in a
 * transient for a few minutes — these pages are read by anonymous visitors and
 * are frequently served from a page cache anyway, so hitting the API on every
 * request buys nothing.
 *
 * @package SDGC_Front9
 */

defined( 'ABSPATH' ) || exit;

/**
 * Base for the org's public reads, e.g. `{base}/event-series`.
 *
 * @return string
 */
function sdgc_front9_api_base() {
	return untrailingslashit( sdgc_front9_option( 'api' ) ) . '/api/public/v1/orgs/' .
		rawurlencode( sdgc_front9_option( 'org' ) );
}

/**
 * GETs a public endpoint and decodes it, or returns null.
 *
 * Null means "show the empty state": an outage on Front9's side should cost the
 * page its data, not the whole page.
 *
 * @param string $path Path under the org base, e.g. '/event-series'.
 * @return array|null
 */
function sdgc_front9_get( $path ) {
	$url   = sdgc_front9_api_base() . $path;
	$key   = 'sdgc_f9_' . md5( $url );
	$cached = get_transient( $key );

	if ( false !== $cached ) {
		return is_array( $cached ) ? $cached : null;
	}

	$response = wp_remote_get(
		$url,
		array(
			'timeout' => 8,
			'headers' => array( 'Accept' => 'application/json' ),
		)
	);

	if ( is_wp_error( $response ) ) {
		sdgc_front9_log( 'GET ' . $url . ' failed: ' . $response->get_error_message() );
		// Cache the miss briefly so a Front9 outage doesn't mean a slow request
		// for every visitor while it lasts.
		set_transient( $key, 'error', 30 );
		return null;
	}

	$code = wp_remote_retrieve_response_code( $response );
	if ( 200 !== (int) $code ) {
		// A 404 is a real answer — an unknown slug — and worth caching normally.
		set_transient( $key, 'error', 404 === (int) $code ? (int) sdgc_front9_option( 'cache_ttl', 300 ) : 30 );
		return null;
	}

	$data = json_decode( wp_remote_retrieve_body( $response ), true );
	if ( ! is_array( $data ) ) {
		return null;
	}

	set_transient( $key, $data, (int) sdgc_front9_option( 'cache_ttl', 300 ) );
	return $data;
}

/**
 * The org's leagues, newest-relevant first. Draft and private ones never reach
 * us — the API omits them.
 *
 * @return array<int, array>
 */
function sdgc_front9_get_leagues() {
	$data = sdgc_front9_get( '/event-series' );
	return is_array( $data ) ? $data : array();
}

/**
 * One league by slug, or null.
 *
 * @param string $slug League slug.
 * @return array|null
 */
function sdgc_front9_get_league( $slug ) {
	if ( '' === $slug ) {
		return null;
	}
	return sdgc_front9_get( '/event-series/' . rawurlencode( $slug ) );
}

/**
 * One event by slug, or null. The widgets link here with the slug, which is all
 * the page ever holds.
 *
 * @param string $slug Event slug.
 * @return array|null
 */
function sdgc_front9_get_event( $slug ) {
	if ( '' === $slug ) {
		return null;
	}
	return sdgc_front9_get( '/events/' . rawurlencode( $slug ) );
}

/**
 * Starts a league registration and returns the hosted URL to send the golfer to.
 *
 * Payment never flows through this API: the POST mints a URL on Front9's own
 * registration host, which is where the golfer picks a partner and pays. Never
 * cached — the response is per sign-up.
 *
 * @param int $series_id League (event series) id.
 * @return string|null
 */
function sdgc_front9_start_registration( $series_id ) {
	$url = sdgc_front9_api_base() . '/event-series/' . (int) $series_id . '/register/start';

	$response = wp_remote_post(
		$url,
		array(
			'timeout' => 8,
			'headers' => array( 'Accept' => 'application/json' ),
		)
	);

	if ( is_wp_error( $response ) || 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
		sdgc_front9_log( 'POST ' . $url . ' failed' );
		return null;
	}

	$data = json_decode( wp_remote_retrieve_body( $response ), true );
	if ( ! is_array( $data ) || empty( $data['url'] ) ) {
		return null;
	}

	return (string) $data['url'];
}

/**
 * Logs only when WP_DEBUG is on, so a quiet production site stays quiet.
 *
 * @param string $message Message.
 */
function sdgc_front9_log( $message ) {
	if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
		error_log( '[SDGC Front9] ' . $message ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
	}
}
