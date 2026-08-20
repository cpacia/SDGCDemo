<?php
/**
 * [sdgc_leagues] — the leagues home page.
 *
 * Hero, a strip of figures, the league grid, the rankings promo, and the blog +
 * tournament widgets.
 *
 * @package SDGC_Front9
 */

defined( 'ABSPATH' ) || exit;

/**
 * Renders the leagues page body.
 *
 * @return string
 */
function sdgc_front9_shortcode_leagues() {
	sdgc_front9_enqueue_assets();

	$leagues = sdgc_front9_leagues();

	ob_start();
	?>
	<div class="sdgc">
		<section class="sdgc-hero sdgc-hero--tall"<?php echo sdgc_front9_hero_style(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<div class="sdgc-hero__scrim sdgc-hero__scrim--light"></div>
			<div class="sdgc-hero__inner">
				<p class="sdgc-hero__eyebrow">Hudson, NH &middot; Indoor Golf, Year Round</p>
				<h1 class="sdgc-hero__title">Leagues &amp; <span class="sdgc-accent">Tournaments</span></h1>
				<p class="sdgc-hero__lede">
					League play through the week, plus a full tournament calendar. Pick your night,
					pick your format, and keep your swing sharp straight through the winter.
				</p>
				<div class="sdgc-hero__actions">
					<a class="sdgc-btn sdgc-btn--solid" href="#leagues">Browse Leagues</a>
					<a class="sdgc-btn sdgc-btn--ghost" href="#schedule">Tournament Schedule</a>
				</div>
			</div>
			<span class="sdgc-hero__rule"></span>
		</section>

		<?php echo sdgc_front9_fact_strip( sdgc_front9_league_stats( $leagues ), false ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>

		<section class="sdgc-section sdgc-section--white" id="leagues">
			<div class="sdgc-wrap">
				<?php echo sdgc_front9_section_heading( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					'Choose Your Night',
					'Our Leagues',
					'Every league runs on our simulators with live scoring, weekly standings, and full season handicapping. Click any league for schedules, standings, and registration.'
				); ?>

				<?php if ( ! empty( $leagues ) ) : ?>
					<div class="sdgc-cards">
						<?php foreach ( $leagues as $league ) : ?>
							<?php echo sdgc_front9_league_card( $league ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						<?php endforeach; ?>
					</div>
				<?php else : ?>
					<div class="sdgc-cards-empty">
						<?php echo sdgc_front9_empty_state( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
							'No Leagues Running Right Now',
							"Next season's schedule is being set. Call the shop and we'll put you on the list for the next league that opens."
						); ?>
					</div>
				<?php endif; ?>
			</div>
		</section>

		<section class="sdgc-promo"<?php echo sdgc_front9_hero_style(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<div class="sdgc-hero__scrim sdgc-hero__scrim--heavy"></div>
			<div class="sdgc-promo__inner">
				<div>
					<p class="sdgc-promo__eyebrow">Facility-Wide</p>
					<h2 class="sdgc-promo__title">Indoor Golf Rankings</h2>
					<div class="sdgc-promo__rule"></div>
					<p class="sdgc-promo__body">
						Every league night and open tournament we score feeds one points table. It is
						our version of the world ranking, run across the whole center — see where your
						game sits against everyone else who plays here.
					</p>
					<a class="sdgc-btn sdgc-btn--solid sdgc-btn--arrow" href="<?php echo esc_url( sdgc_front9_page_url( 'rankings_page' ) ); ?>">
						View the Rankings <?php echo sdgc_front9_arrow(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					</a>
				</div>
				<dl class="sdgc-glance">
					<?php foreach ( sdgc_front9_ranking_facts() as $fact ) : ?>
						<div class="sdgc-glance__row">
							<dt class="sdgc-glance__label"><?php echo esc_html( $fact['label'] ); ?></dt>
							<dd class="sdgc-glance__value"><?php echo esc_html( $fact['value'] ); ?></dd>
						</div>
					<?php endforeach; ?>
				</dl>
			</div>
			<span class="sdgc-hero__rule"></span>
		</section>

		<section class="sdgc-section sdgc-section--grey" id="schedule">
			<div class="sdgc-wrap">
				<?php echo sdgc_front9_section_heading( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					"What's Happening",
					'News &amp; Events',
					'The latest from the center, plus every non-league tournament on the calendar this season.'
				); ?>

				<div class="sdgc-panels">
					<?php
					echo sdgc_front9_panel_open( 'From the Blog', 'News, recaps, and tips from our staff' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					echo sdgc_front9_embed( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						'blog-feed',
						array(
							'preset' => 'featured-sidebar',
							'posts'  => '15',
						)
					);
					echo sdgc_front9_panel_close(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

					echo sdgc_front9_panel_open( 'Tournament Schedule', 'Open events — no league membership required' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					echo sdgc_front9_embed( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						'schedule',
						array(
							'title'   => ' ',
							'filter'  => 'all',
							'tags'    => 'tournaments',
							'actions' => '1',
							'accent'  => sdgc_front9_option( 'accent' ),
							'link'    => sdgc_front9_link_template( 'event_page', 'event' ),
						)
					);
					echo sdgc_front9_panel_close(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					?>
				</div>
			</div>
		</section>
	</div>
	<?php
	return sdgc_front9_shortcode_output( ob_get_clean() );
}
add_shortcode( 'sdgc_leagues', 'sdgc_front9_shortcode_leagues' );

/**
 * The figures under the hero.
 *
 * "Active" excludes the finished leagues still inside their grace month — a
 * season that ended three weeks ago shouldn't be counted as running.
 *
 * @param array<int, array> $leagues View models.
 * @return array<int, array{label: string, value: string}>
 */
function sdgc_front9_league_stats( $leagues ) {
	$active  = array();
	$players = 0;

	foreach ( $leagues as $league ) {
		if ( 'finished' === $league['stage'] ) {
			continue;
		}
		$active[] = $league;
		$players += (int) $league['members'];
	}

	return apply_filters(
		'sdgc_front9_league_stats',
		array(
			array(
				'label' => count( $active ) === 1 ? 'Active League' : 'Active Leagues',
				'value' => (string) count( $active ),
			),
			array(
				'label' => 'Registered Players',
				// Sum of the league rosters. Falls back to the standing marketing
				// figure when nobody has registered yet (or Front9 is unreachable),
				// because "0 Registered Players" reads as broken rather than as new.
				'value' => $players > 0 ? (string) $players : '140+',
			),
			array(
				'label' => 'Simulator Bays',
				'value' => '7',
			),
			array(
				'label' => 'Days a Year',
				'value' => '365',
			),
		),
		$leagues
	);
}

/**
 * One league card.
 *
 * @param array $league View model.
 * @return string
 */
function sdgc_front9_league_card( $league ) {
	$href = add_query_arg( 'league', rawurlencode( $league['slug'] ), sdgc_front9_page_url( 'league_page' ) );

	ob_start();
	?>
	<a class="sdgc-card" href="<?php echo esc_url( $href ); ?>">
		<span class="sdgc-card__accent" style="background-color:<?php echo esc_attr( $league['accent'] ); ?>"></span>
		<div class="sdgc-card__head">
			<?php if ( '' !== $league['logo'] ) : ?>
				<img class="sdgc-card__crest" src="<?php echo esc_url( $league['logo'] ); ?>" alt="" width="240" height="240" loading="lazy" />
			<?php endif; ?>
			<div class="sdgc-card__headings">
				<h3 class="sdgc-card__title"><?php echo esc_html( $league['name'] ); ?></h3>
				<p class="sdgc-card__schedule"><?php echo esc_html( $league['schedule'] ); ?></p>
			</div>
		</div>
		<p class="sdgc-card__blurb"><?php echo esc_html( $league['blurb'] ); ?></p>
		<dl class="sdgc-card__meta">
			<div class="sdgc-card__row">
				<dt>Format</dt>
				<dd><?php echo esc_html( $league['format'] ); ?></dd>
			</div>
			<div class="sdgc-card__row">
				<dt>Season</dt>
				<dd><?php echo esc_html( $league['season'] ); ?></dd>
			</div>
		</dl>
		<div class="sdgc-card__foot">
			<span class="sdgc-card__status <?php echo $league['status_open'] ? 'is-open' : 'is-closed'; ?>">
				<?php echo esc_html( $league['status_label'] ); ?>
			</span>
			<span class="sdgc-card__view">View <?php echo sdgc_front9_arrow(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
		</div>
	</a>
	<?php
	return ob_get_clean();
}
