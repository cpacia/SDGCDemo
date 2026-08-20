<?php
/**
 * The pieces every page shares: heroes, section headings, widget panels, and
 * the Front9 embed tag itself.
 *
 * @package SDGC_Front9
 */

defined( 'ABSPATH' ) || exit;

/**
 * Final tidy-up for a shortcode's markup.
 *
 * Templates below are written with blank lines for readability, and wpautop
 * would turn each of those into a stray empty paragraph inside the layout — so
 * they're collapsed on the way out.
 *
 * @param string $html Buffered markup.
 * @return string
 */
function sdgc_front9_shortcode_output( $html ) {
	return trim( preg_replace( "/\n\s*\n+/", "\n", $html ) );
}

/**
 * The Front9 embed snippet for one widget.
 *
 * embed.js reads `document.currentScript` and inserts its iframe as the script
 * tag's next sibling, so the tag has to live exactly where the widget belongs.
 *
 * @param string                $widget  Widget name, e.g. 'schedule'.
 * @param array<string, string> $options data-* options, camelCase keys welcome.
 * @return string
 */
function sdgc_front9_embed( $widget, $options = array() ) {
	$attributes = array(
		'data-org'    => sdgc_front9_option( 'org' ),
		'data-widget' => $widget,
	);

	foreach ( $options as $key => $value ) {
		if ( '' === $value && '0' !== $value ) {
			continue;
		}
		// camelCase to the dashed data-* attribute embed.js expects.
		$name                = 'data-' . strtolower( preg_replace( '/([A-Z])/', '-$1', $key ) );
		$attributes[ $name ] = (string) $value;
	}

	$rendered = '';
	foreach ( $attributes as $name => $value ) {
		$rendered .= ' ' . esc_attr( $name ) . '="' . esc_attr( $value ) . '"';
	}

	return '<div class="sdgc-embed"><script async src="' . esc_url( sdgc_front9_option( 'embed' ) ) . '"' . $rendered . '></script></div>';
}

/**
 * A link template for the widgets that send visitors to one of our pages. The
 * `{slug}` placeholder is filled in by embed.js, so it must survive untouched.
 *
 * @param string $page_key Option key for the destination page.
 * @param string $param    Query parameter the destination page reads.
 * @return string
 */
function sdgc_front9_link_template( $page_key, $param ) {
	$url = sdgc_front9_page_url( $page_key );
	return $url . ( false === strpos( $url, '?' ) ? '?' : '&' ) . $param . '={slug}';
}

/**
 * Reads a slug out of the query string, trying each parameter in turn.
 *
 * @param array<int, string> $keys Parameter names, most preferred first.
 * @return string
 */
function sdgc_front9_query_slug( $keys ) {
	foreach ( $keys as $key ) {
		if ( isset( $_GET[ $key ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$value = sanitize_text_field( wp_unslash( $_GET[ $key ] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			// Front9 slugs are lowercase words joined by hyphens.
			$value = preg_replace( '/[^a-z0-9\-]/', '', strtolower( $value ) );
			if ( '' !== $value ) {
				return $value;
			}
		}
	}
	return '';
}

/**
 * Inline style for a hero's background photo. Kept inline rather than in the
 * stylesheet so the image stays a configurable option.
 *
 * @return string
 */
function sdgc_front9_hero_style() {
	$image = sdgc_front9_option( 'hero_image' );
	return '' === $image ? '' : ' style="background-image:url(' . esc_url( $image ) . ')"';
}

/**
 * The centred eyebrow / title / rule / intro block above a section.
 *
 * @param string $eyebrow Small tracked line above the title.
 * @param string $title   Section title.
 * @param string $intro   Optional paragraph under the rule.
 * @return string
 */
function sdgc_front9_section_heading( $eyebrow, $title, $intro = '' ) {
	$html  = '<div class="sdgc-heading">';
	$html .= '<p class="sdgc-heading__eyebrow">' . esc_html( $eyebrow ) . '</p>';
	$html .= '<h2 class="sdgc-heading__title">' . esc_html( $title ) . '</h2>';
	$html .= '<div class="sdgc-heading__rule"></div>';
	if ( '' !== $intro ) {
		$html .= '<p class="sdgc-heading__intro">' . esc_html( $intro ) . '</p>';
	}
	$html .= '</div>';

	return $html;
}

/**
 * Opens a widget panel: a bordered card with a titled header.
 *
 * The header is painted above the widget and given its own background so the
 * rule under it survives the negative margin that tucks the widget's blank top
 * edge underneath.
 *
 * @param string $title    Panel title.
 * @param string $subtitle Line under it.
 * @return string
 */
function sdgc_front9_panel_open( $title, $subtitle ) {
	$html  = '<div class="sdgc-panel">';
	$html .= '<div class="sdgc-panel__header">';
	$html .= '<div>';
	$html .= '<h3 class="sdgc-panel__title">' . esc_html( $title ) . '</h3>';
	$html .= '<p class="sdgc-panel__subtitle">' . esc_html( $subtitle ) . '</p>';
	$html .= '</div>';
	$html .= '<span class="sdgc-panel__badge">Powered by Front9</span>';
	$html .= '</div>';
	$html .= '<div class="sdgc-panel__body">';

	return $html;
}

/**
 * Closes a widget panel.
 *
 * @return string
 */
function sdgc_front9_panel_close() {
	return '</div></div>';
}

/**
 * A "nothing here yet" card, used wherever a section has no data to show.
 *
 * @param string $title Heading.
 * @param string $body  Paragraph.
 * @return string
 */
function sdgc_front9_empty_state( $title, $body ) {
	return '<div class="sdgc-empty">' .
		'<h3 class="sdgc-empty__title">' . esc_html( $title ) . '</h3>' .
		'<p class="sdgc-empty__body">' . esc_html( $body ) . '</p>' .
		'</div>';
}

/**
 * Inline arrow icons, matching the ones in the original design.
 *
 * @param string $direction 'right' or 'left'.
 * @return string
 */
function sdgc_front9_arrow( $direction = 'right' ) {
	$path = 'right' === $direction
		? 'M5 12h14M13 6l6 6-6 6'
		: 'M19 12H5M11 18l-6-6 6-6';

	return '<svg class="sdgc-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">' .
		'<path d="' . esc_attr( $path ) . '" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
}

/**
 * The "back to…" link that opens every inner page's hero.
 *
 * @param string $url   Destination.
 * @param string $label Link text.
 * @return string
 */
function sdgc_front9_back_link( $url, $label ) {
	return '<a class="sdgc-back" href="' . esc_url( $url ) . '">' . sdgc_front9_arrow( 'left' ) . esc_html( $label ) . '</a>';
}

/**
 * The dark strip of figures under a hero.
 *
 * @param array<int, array{label: string, value: string}> $facts Facts.
 * @param bool                                            $label_first Label above the value.
 * @return string
 */
function sdgc_front9_fact_strip( $facts, $label_first = true ) {
	$html = '<section class="sdgc-facts"><dl class="sdgc-facts__grid">';

	foreach ( $facts as $fact ) {
		$html .= '<div class="sdgc-facts__item">';
		if ( $label_first ) {
			$html .= '<dt class="sdgc-facts__label">' . esc_html( $fact['label'] ) . '</dt>';
			$html .= '<dd class="sdgc-facts__value">' . esc_html( $fact['value'] ) . '</dd>';
		} else {
			$html .= '<dt class="sdgc-facts__label sdgc-sr-only">' . esc_html( $fact['label'] ) . '</dt>';
			$html .= '<dd><span class="sdgc-facts__stat">' . esc_html( $fact['value'] ) . '</span>';
			$html .= '<span class="sdgc-facts__caption">' . esc_html( $fact['label'] ) . '</span></dd>';
		}
		$html .= '</div>';
	}

	return $html . '</dl></section>';
}

/**
 * The facility-wide ranking's headline facts, shared by the leagues page and
 * the rankings page.
 *
 * @return array<int, array{label: string, value: string}>
 */
function sdgc_front9_ranking_facts() {
	return apply_filters(
		'sdgc_front9_ranking_facts',
		array(
			array(
				'label' => 'Ranked Players',
				'value' => '140+',
			),
			array(
				'label' => 'Ranking Period',
				'value' => 'Rolling 104 Weeks',
			),
			array(
				'label' => 'Counting Events',
				'value' => 'Leagues + Opens',
			),
			array(
				'label' => 'Updated',
				'value' => 'Every Monday',
			),
		)
	);
}
