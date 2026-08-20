<?php
/**
 * Plugin Name: SDGC Leagues & Rankings (Front9)
 * Description: The leagues, league, event and rankings pages, driven live by the Front9 public API. Four shortcodes, no header or footer — the theme keeps those.
 * Version:     1.0.0
 * Author:      Seth Dichard Golf Centers
 * License:     GPL-2.0-or-later
 *
 * @package SDGC_Front9
 */

defined( 'ABSPATH' ) || exit;

define( 'SDGC_FRONT9_VERSION', '1.0.0' );
define( 'SDGC_FRONT9_PATH', plugin_dir_path( __FILE__ ) );
define( 'SDGC_FRONT9_URL', plugin_dir_url( __FILE__ ) );

require_once SDGC_FRONT9_PATH . 'inc/api.php';
require_once SDGC_FRONT9_PATH . 'inc/accent.php';
require_once SDGC_FRONT9_PATH . 'inc/leagues.php';
require_once SDGC_FRONT9_PATH . 'inc/render.php';
require_once SDGC_FRONT9_PATH . 'inc/shortcode-leagues.php';
require_once SDGC_FRONT9_PATH . 'inc/shortcode-league.php';
require_once SDGC_FRONT9_PATH . 'inc/shortcode-event.php';
require_once SDGC_FRONT9_PATH . 'inc/shortcode-rankings.php';
require_once SDGC_FRONT9_PATH . 'inc/register.php';

/**
 * Everything the pages need to know about this site, in one place.
 *
 * Override any of it from the theme's functions.php:
 *
 *     add_filter( 'sdgc_front9_options', function ( $options ) {
 *         $options['league_page'] = '/indoor-golf-leagues/';
 *         return $options;
 *     } );
 *
 * @return array<string, string>
 */
function sdgc_front9_options() {
	static $options = null;

	if ( null === $options ) {
		$options = apply_filters(
			'sdgc_front9_options',
			array(
				// Front9 organization and API origin.
				'org'           => 'seth-dichard-golf-centers',
				'api'           => 'https://api.front9.com',
				// Where embed.js is served from (the widget host, not the API).
				'embed'         => 'https://front9.com/embed.js',

				// Pages on THIS site. The league cards and the schedule widget
				// link to these, so they have to match where you put the
				// shortcodes. Relative paths are resolved against the site URL.
				'leagues_page'  => '/leagues/',
				'league_page'   => '/league/',
				'event_page'    => '/event/',
				'rankings_page' => '/rankings/',

				// The facility-wide ranking's standings series id.
				'rankings_series' => '14',

				// Contact details for the buttons.
				'phone'         => '(603) 860-9893',
				'phone_href'    => 'tel:+16038609893',
				'book_now'      => 'https://sethdichardgolf.com/book-now/',

				// Hero background. Swap for a media-library URL if you'd rather.
				'hero_image'    => SDGC_FRONT9_URL . 'assets/hero.jpg',

				// Accent used for rules, eyebrows and buttons.
				'accent'        => '#e02b2b',

				// How long API responses are cached, in seconds.
				'cache_ttl'     => 300,
			)
		);
	}

	return $options;
}

/**
 * One option, by key.
 *
 * @param string $key     Option name.
 * @param string $default Fallback when unset.
 * @return string
 */
function sdgc_front9_option( $key, $default = '' ) {
	$options = sdgc_front9_options();
	return isset( $options[ $key ] ) ? $options[ $key ] : $default;
}

/**
 * A page URL from the options, absolute.
 *
 * @param string $key Option key holding a path or URL.
 * @return string
 */
function sdgc_front9_page_url( $key ) {
	$value = sdgc_front9_option( $key );

	if ( '' === $value ) {
		return home_url( '/' );
	}
	if ( preg_match( '#^https?://#i', $value ) ) {
		return $value;
	}

	return home_url( $value );
}

/**
 * Styles and scripts. Registered always, enqueued only on pages that actually
 * carry one of the shortcodes, so the rest of the site is untouched.
 */
function sdgc_front9_register_assets() {
	wp_register_style(
		'sdgc-front9',
		SDGC_FRONT9_URL . 'assets/sdgc-front9.css',
		array(),
		SDGC_FRONT9_VERSION
	);

	wp_register_script(
		'sdgc-front9-tabs',
		SDGC_FRONT9_URL . 'assets/event-tabs.js',
		array(),
		SDGC_FRONT9_VERSION,
		true
	);

	/**
	 * Whether to pull the display fonts from Google. Off if your theme already
	 * loads Oswald and Poppins:
	 *
	 *     add_filter( 'sdgc_front9_load_fonts', '__return_false' );
	 */
	if ( apply_filters( 'sdgc_front9_load_fonts', true ) ) {
		wp_register_style(
			'sdgc-front9-fonts',
			'https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Poppins:wght@500;600;700&family=Open+Sans:wght@400;500;600&display=swap',
			array(),
			null
		);
	}
}
add_action( 'init', 'sdgc_front9_register_assets' );

/**
 * Called by every shortcode before it renders.
 */
function sdgc_front9_enqueue_assets() {
	if ( wp_style_is( 'sdgc-front9-fonts', 'registered' ) ) {
		wp_enqueue_style( 'sdgc-front9-fonts' );
	}
	wp_enqueue_style( 'sdgc-front9' );
}
