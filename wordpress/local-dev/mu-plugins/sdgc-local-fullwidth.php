<?php
/**
 * Plugin Name: SDGC local dev — full-bleed page container
 * Description: Local harness only. Gives the shortcode pages the full-width, no-sidebar container the plugin's install notes assume, which the stock block themes don't ship a template for.
 *
 * This is NOT part of the plugin and must not ship with it. On the real site the
 * same job is done by picking a full-width page template in the theme.
 *
 * @package SDGC_Front9_LocalDev
 */

defined( 'ABSPATH' ) || exit;

/**
 * Is the page being rendered one of the plugin's four?
 *
 * @return bool
 */
function sdgc_local_is_shortcode_page() {
	if ( ! is_singular() ) {
		return false;
	}

	$post = get_post();
	if ( ! $post instanceof WP_Post ) {
		return false;
	}

	foreach ( array( 'sdgc_leagues', 'sdgc_league', 'sdgc_event', 'sdgc_rankings', 'sdgc_blog' ) as $tag ) {
		if ( has_shortcode( $post->post_content, $tag ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Marks the page so the CSS below can scope to it, rather than relying on :has().
 *
 * @param array $classes Body classes.
 * @return array
 */
function sdgc_local_body_class( $classes ) {
	if ( sdgc_local_is_shortcode_page() ) {
		$classes[] = 'sdgc-local-fullwidth';
	}
	return $classes;
}
add_filter( 'body_class', 'sdgc_local_body_class' );

/**
 * Unpicks the theme's constrained layout around the shortcode output.
 *
 * Block themes clamp every child of an `is-layout-constrained` container to
 * `--wp--style--global--content-size` (645px in Twenty Twenty-Five) and add
 * global side padding at each level. The plugin's pages handle their own
 * gutters and expect to sit in a full-bleed container, so both come off.
 */
function sdgc_local_fullwidth_css() {
	if ( ! sdgc_local_is_shortcode_page() ) {
		return;
	}

	$css = '
	.sdgc-local-fullwidth .wp-site-blocks > main,
	.sdgc-local-fullwidth main .wp-block-group,
	.sdgc-local-fullwidth main .entry-content {
		max-width: none !important;
		padding-left: 0 !important;
		padding-right: 0 !important;
	}
	.sdgc-local-fullwidth .wp-site-blocks > main {
		margin-top: 0 !important;
		padding-top: 0 !important;
		padding-bottom: 0 !important;
	}
	/*
	 * The theme pulls `.alignfull` children left/right by the root padding, to
	 * cancel it out. That padding is gone above, so the negative margins would
	 * drag the content off the viewport edge.
	 */
	.sdgc-local-fullwidth main .alignfull {
		margin-left: 0 !important;
		margin-right: 0 !important;
	}
	.sdgc-local-fullwidth main .entry-content > .sdgc {
		max-width: none !important;
		width: auto !important;
		margin-left: 0 !important;
		margin-right: 0 !important;
	}
	/* The plugin renders its own hero heading; the theme title duplicates it. */
	.sdgc-local-fullwidth main .wp-block-post-title {
		display: none;
	}';

	wp_register_style( 'sdgc-local-fullwidth', false, array(), null );
	wp_enqueue_style( 'sdgc-local-fullwidth' );
	wp_add_inline_style( 'sdgc-local-fullwidth', $css );
}
add_action( 'wp_enqueue_scripts', 'sdgc_local_fullwidth_css', 100 );

/**
 * Version the plugin's CSS and JS by file modification time.
 *
 * The plugin enqueues its assets at a fixed SDGC_FRONT9_VERSION, which is right
 * for production but means a browser keeps serving the stylesheet it already
 * has while you're editing it — an edit looks like it did nothing until you
 * hard-reload. Locally, stamping the file's mtime makes a normal reload enough.
 *
 * @param string $src Asset URL.
 * @return string
 */
function sdgc_local_bust_asset_cache( $src ) {
	if ( false === strpos( $src, '/plugins/sdgc-front9/' ) ) {
		return $src;
	}

	$path = ABSPATH . ltrim( wp_parse_url( $src, PHP_URL_PATH ), '/' );
	$path = str_replace( ABSPATH . 'wp-content', WP_CONTENT_DIR, $path );

	if ( ! file_exists( $path ) ) {
		return $src;
	}

	return add_query_arg( 'ver', filemtime( $path ), remove_query_arg( 'ver', $src ) );
}
add_filter( 'style_loader_src', 'sdgc_local_bust_asset_cache' );
add_filter( 'script_loader_src', 'sdgc_local_bust_asset_cache' );
