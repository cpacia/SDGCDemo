<?php
/**
 * [sdgc_event] — one event's page.
 *
 * Reads the event from `?event=<slug>` (or `?id=`, which is what older widget
 * links use). The title comes from the API; the tabs are Front9 widgets.
 *
 * @package SDGC_Front9
 */

defined( 'ABSPATH' ) || exit;

/**
 * The tabs, in order. Each id doubles as the URL hash.
 *
 * @return array<int, array{id: string, label: string, widget: string}>
 */
function sdgc_front9_event_tabs() {
	return array(
		array(
			'id'     => 'details',
			'label'  => 'Details',
			'widget' => 'event-detail',
		),
		array(
			'id'     => 'field',
			'label'  => 'Field',
			'widget' => 'field',
		),
		array(
			'id'     => 'tee-times',
			'label'  => 'Tee Times',
			'widget' => 'tee-times',
		),
		array(
			'id'     => 'leaderboard',
			'label'  => 'Leaderboard',
			'widget' => 'leaderboard',
		),
		array(
			'id'     => 'odds',
			'label'  => 'Odds',
			'widget' => 'odds',
		),
	);
}

/**
 * Renders an event page body.
 *
 * @param array $atts Shortcode attributes.
 * @return string
 */
function sdgc_front9_shortcode_event( $atts ) {
	sdgc_front9_enqueue_assets();
	wp_enqueue_script( 'sdgc-front9-tabs' );

	$atts = shortcode_atts( array( 'slug' => '' ), $atts, 'sdgc_event' );
	$slug = '' !== $atts['slug'] ? sanitize_title( $atts['slug'] ) : sdgc_front9_query_slug( array( 'event', 'id' ) );

	$event = '' !== $slug ? sdgc_front9_get_event( $slug ) : null;
	$title = is_array( $event ) && ! empty( $event['title'] )
		? (string) $event['title']
		: sdgc_front9_title_from_slug( $slug );

	$tabs   = sdgc_front9_event_tabs();
	$accent = sdgc_front9_option( 'accent' );

	ob_start();
	?>
	<div class="sdgc">
		<section class="sdgc-hero sdgc-hero--flat">
			<div class="sdgc-hero__inner">
				<?php echo sdgc_front9_back_link( sdgc_front9_page_url( 'leagues_page' ) . '#schedule', 'All Events' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<p class="sdgc-hero__eyebrow sdgc-hero__eyebrow--spaced">Seth Dichard Golf Centers</p>
				<h1 class="sdgc-event__title"><?php echo esc_html( $title ); ?></h1>
				<?php if ( is_array( $event ) ) : ?>
					<p class="sdgc-event__meta"><?php echo esc_html( sdgc_front9_event_meta( $event ) ); ?></p>
				<?php endif; ?>
			</div>
			<span class="sdgc-hero__rule"></span>
		</section>

		<?php if ( '' !== $slug ) : ?>
			<nav class="sdgc-tabs" aria-label="Event sections">
				<ul class="sdgc-tabs__list">
					<?php foreach ( $tabs as $i => $tab ) : ?>
						<li>
							<a class="sdgc-tabs__link<?php echo 0 === $i ? ' is-active' : ''; ?>"
								href="#<?php echo esc_attr( $tab['id'] ); ?>"
								data-sdgc-tab="<?php echo esc_attr( $tab['id'] ); ?>">
								<?php echo esc_html( $tab['label'] ); ?>
							</a>
						</li>
					<?php endforeach; ?>
				</ul>
			</nav>

			<section class="sdgc-section sdgc-section--grey">
				<div class="sdgc-wrap">
					<div class="sdgc-tabpanels" data-sdgc-tabs>
						<?php foreach ( $tabs as $i => $tab ) : ?>
							<?php
							/*
							 * Only the first tab's widget is printed. The rest carry their
							 * config as data-* and are injected the first time the tab is
							 * opened — five iframes loading at once would be five times the
							 * work for a page where four of them are unseen.
							 */
							?>
							<div class="sdgc-tabpanel<?php echo 0 === $i ? ' is-active' : ''; ?>"
								id="sdgc-panel-<?php echo esc_attr( $tab['id'] ); ?>"
								data-sdgc-panel="<?php echo esc_attr( $tab['id'] ); ?>"
								data-widget="<?php echo esc_attr( $tab['widget'] ); ?>"
								data-org="<?php echo esc_attr( sdgc_front9_option( 'org' ) ); ?>"
								data-embed="<?php echo esc_url( sdgc_front9_option( 'embed' ) ); ?>"
								data-event="<?php echo esc_attr( $slug ); ?>"
								data-accent="<?php echo esc_attr( $accent ); ?>">
								<?php
								if ( 0 === $i ) {
									echo sdgc_front9_embed( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
										$tab['widget'],
										array(
											'event'  => $slug,
											'accent' => $accent,
										)
									);
								}
								?>
							</div>
						<?php endforeach; ?>
					</div>
				</div>
			</section>
		<?php else : ?>
			<section class="sdgc-section sdgc-section--grey">
				<div class="sdgc-wrap">
					<?php echo sdgc_front9_empty_state( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						'No Event Selected',
						'This page needs an event in the URL, for example ?event=2026-the-turkey-day-shootout'
					); ?>
				</div>
			</section>
		<?php endif; ?>
	</div>
	<?php
	return sdgc_front9_shortcode_output( ob_get_clean() );
}
add_shortcode( 'sdgc_event', 'sdgc_front9_shortcode_event' );

/**
 * The date-and-course line under an event's title.
 *
 * @param array $event Raw payload.
 * @return string
 */
function sdgc_front9_event_meta( $event ) {
	$parts = array();

	$start = sdgc_front9_date( $event, 'startDate' );
	$end   = sdgc_front9_date( $event, 'endDate' );
	if ( $start ) {
		$parts[] = ( $end && $end > $start )
			? $start->format( 'M j' ) . ' – ' . $end->format( 'M j, Y' )
			: $start->format( 'l, M j, Y' );
	}

	$course = trim( (string) ( $event['courseListSummary'] ?? '' ) );
	if ( '' !== $course ) {
		$parts[] = $course;
	}

	return implode( '  ·  ', $parts );
}

/**
 * Last resort for the heading when Front9 has no event under this slug. Front9
 * slugs are derived from the title and prefixed with the season year
 * ("2026-the-turkey-day-shootout"), so it reads back close to the real thing.
 *
 * @param string $slug Event slug.
 * @return string
 */
function sdgc_front9_title_from_slug( $slug ) {
	if ( '' === $slug ) {
		return 'Event';
	}

	$words = preg_split( '/-+/', preg_replace( '/^\d{4}-/', '', $slug ) );
	$words = array_filter( is_array( $words ) ? $words : array() );

	return empty( $words ) ? 'Event' : ucwords( implode( ' ', $words ) );
}
