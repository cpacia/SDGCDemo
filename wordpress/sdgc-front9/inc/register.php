<?php
/**
 * Handles the league page's Register button and the sub list's Sign Up buttons.
 *
 * The hosted registration URL is minted per sign-up by the API — it carries the
 * org and the league — so the button posts here and is redirected on, rather
 * than being a link to a URL we could print in advance.
 *
 * @package SDGC_Front9
 */

defined( 'ABSPATH' ) || exit;

/**
 * Sends a golfer into Front9's hosted registration.
 *
 * Takes the league SLUG and resolves it here rather than trusting a posted id,
 * and re-checks the league is genuinely taking sign-ups: this endpoint is
 * reachable directly, not only through the button.
 */
function sdgc_front9_handle_register() {
	check_admin_referer( 'sdgc_front9_register', 'sdgc_nonce' );

	$slug   = isset( $_POST['slug'] ) ? sanitize_title( wp_unslash( $_POST['slug'] ) ) : '';
	$return = isset( $_POST['return'] ) ? esc_url_raw( wp_unslash( $_POST['return'] ) ) : '';

	// Anything unexpected falls back to the booking page — a golfer who clicked
	// Register still lands somewhere they can act, rather than on an error.
	$target = sdgc_front9_option( 'book_now' );
	if ( '' === $target ) {
		$target = '' !== $return ? $return : home_url( '/' );
	}

	$league = '' !== $slug ? sdgc_front9_league( $slug ) : null;
	if ( $league && 'registering' === $league['stage'] ) {
		$hosted = sdgc_front9_start_registration( $league['id'] );
		if ( $hosted && preg_match( '#^https?://#i', $hosted ) ) {
			$target = $hosted;
		}
	}

	// The destination is Front9's registration host, so this is deliberately an
	// off-site redirect: wp_safe_redirect would refuse it.
	wp_redirect( $target ); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect
	exit;
}
add_action( 'admin_post_sdgc_front9_register', 'sdgc_front9_handle_register' );
add_action( 'admin_post_nopriv_sdgc_front9_register', 'sdgc_front9_handle_register' );

/**
 * Sends a golfer into Front9's hosted registration to take one sub request.
 *
 * Takes only the request id and looks the league up from it, so a posted
 * league id is never trusted. A request that's gone — filled, withdrawn, or its
 * night started since the page was cached — sends them back to the list with a
 * note, rather than into a flow that would turn them away.
 */
function sdgc_front9_handle_sub() {
	check_admin_referer( 'sdgc_front9_sub', 'sdgc_nonce' );

	$id     = isset( $_POST['request'] ) ? absint( $_POST['request'] ) : 0;
	$return = isset( $_POST['return'] ) ? esc_url_raw( wp_unslash( $_POST['return'] ) ) : '';
	$return = wp_validate_redirect( $return, sdgc_front9_page_url( 'leagues_page' ) );

	$request = sdgc_front9_get_sub_request( $id );
	if ( $request && ! empty( $request['eventSeriesId'] ) ) {
		$hosted = sdgc_front9_start_registration( (int) $request['eventSeriesId'], array( 'subRequest' => (string) $id ) );
		if ( $hosted && preg_match( '#^https?://#i', $hosted ) ) {
			// Off-site on purpose, as with the Register button.
			wp_redirect( $hosted ); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect
			exit;
		}
	}

	// The cached lists still show it. Forget them so the page we send the golfer
	// back to doesn't offer the same dead button again.
	$league = isset( $_POST['league'] ) ? sanitize_title( wp_unslash( $_POST['league'] ) ) : '';
	sdgc_front9_forget( '/sub-requests/' . $id );
	sdgc_front9_forget( '/sub-requests' );
	if ( '' !== $league ) {
		sdgc_front9_forget( '/event-series/' . rawurlencode( $league ) . '/sub-requests' );
	}

	wp_safe_redirect( add_query_arg( 'sdgc_sub', 'filled', $return ) . '#subs' );
	exit;
}
add_action( 'admin_post_sdgc_front9_sub', 'sdgc_front9_handle_sub' );
add_action( 'admin_post_nopriv_sdgc_front9_sub', 'sdgc_front9_handle_sub' );
