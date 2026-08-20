<?php
/**
 * Handles the league page's Register button.
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
