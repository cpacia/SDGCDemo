<?php
/**
 * Plugin Name: SDGC local dev — host theme stress test
 * Description: Local harness only. Adds `?stress=lists` to any page to simulate the list styling Divi (and most classic themes) apply to entry content, so theme-collision bugs can be reproduced on this machine instead of in production.
 *
 * @package SDGC_Front9_LocalDev
 */

defined( 'ABSPATH' ) || exit;

/**
 * Divi-shaped list rules, applied only when ?stress=lists is present.
 *
 * These target `li` directly and outrank a rule that only sets list-style on
 * the ul — which is exactly why production sprouted bullets where Twenty
 * Twenty-Five did not.
 */
function sdgc_local_stress_lists() {
	if ( ! isset( $_GET['stress'] ) || 'lists' !== $_GET['stress'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return;
	}

	// Lifted verbatim from sethdichardgolf.com's inline Divi block, so this
	// reproduces production rather than approximating it.
	$css = '
	#left-area ul, .entry-content ul, .et-l--body ul, .et-l--footer ul, .et-l--header ul {
		list-style-type: disc;
		padding: 0 0 23px 1em;
		line-height: 26px;
	}
	#left-area ol, .entry-content ol, .et-l--body ol, .et-l--footer ol, .et-l--header ol {
		list-style-type: decimal;
		list-style-position: inside;
		padding: 0 0 23px;
		line-height: 26px;
	}
	.et_pb_text ol, .et_pb_text ul {
		padding-bottom: 1em;
	}';

	wp_register_style( 'sdgc-local-stress', false, array(), null );
	wp_enqueue_style( 'sdgc-local-stress' );
	wp_add_inline_style( 'sdgc-local-stress', $css );
}
add_action( 'wp_enqueue_scripts', 'sdgc_local_stress_lists', 200 );
