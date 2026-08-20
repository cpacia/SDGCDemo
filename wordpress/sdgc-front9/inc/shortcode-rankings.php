<?php
/**
 * [sdgc_rankings] — the facility-wide Indoor Golf Rankings page.
 *
 * One standings table for the whole building, with the rules alongside it.
 *
 * @package SDGC_Front9
 */

defined( 'ABSPATH' ) || exit;

/**
 * Renders the rankings page body.
 *
 * @return string
 */
function sdgc_front9_shortcode_rankings() {
	sdgc_front9_enqueue_assets();

	ob_start();
	?>
	<div class="sdgc">
		<section class="sdgc-hero"<?php echo sdgc_front9_hero_style(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<div class="sdgc-hero__scrim"></div>
			<div class="sdgc-hero__inner">
				<?php echo sdgc_front9_back_link( sdgc_front9_page_url( 'leagues_page' ), 'Leagues & Tournaments' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<p class="sdgc-hero__eyebrow sdgc-hero__eyebrow--spaced">Every League &middot; Every Tournament</p>
				<h1 class="sdgc-league__title">Indoor Golf Rankings</h1>
				<p class="sdgc-league__blurb">
					One ranking for the whole building. Every league night, open tournament, and skins
					game we score feeds the same points table, so you always know where your game
					stands against the rest of the center.
				</p>
			</div>
			<span class="sdgc-hero__rule"></span>
		</section>

		<?php echo sdgc_front9_fact_strip( sdgc_front9_ranking_facts() ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>

		<section class="sdgc-section sdgc-section--grey">
			<div class="sdgc-wrap sdgc-rankings">
				<div>
					<?php
					echo sdgc_front9_panel_open( 'Current Ranking', 'Live points table, recalculated after every scored event' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					echo sdgc_front9_embed( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						'standings',
						array(
							'title'  => ' ',
							'series' => sdgc_front9_option( 'rankings_series' ),
							'accent' => sdgc_front9_option( 'accent' ),
						)
					);
					echo sdgc_front9_panel_close(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					?>
				</div>

				<aside class="sdgc-rules">
					<h2 class="sdgc-rules__title">How It Works</h2>
					<div class="sdgc-rules__rule"></div>
					<ol class="sdgc-rules__list">
						<?php foreach ( sdgc_front9_ranking_rules() as $i => $rule ) : ?>
							<li class="sdgc-rules__item">
								<span class="sdgc-rules__number"><?php echo esc_html( $i + 1 ); ?></span>
								<div>
									<h3 class="sdgc-rules__heading"><?php echo esc_html( $rule['title'] ); ?></h3>
									<p class="sdgc-rules__body"><?php echo esc_html( $rule['body'] ); ?></p>
								</div>
							</li>
						<?php endforeach; ?>
					</ol>
					<a class="sdgc-btn sdgc-btn--solid sdgc-btn--block" href="<?php echo esc_url( sdgc_front9_page_url( 'leagues_page' ) . '#leagues' ); ?>">
						Get in a League
					</a>
				</aside>
			</div>
		</section>
	</div>
	<?php
	return sdgc_front9_shortcode_output( ob_get_clean() );
}
add_shortcode( 'sdgc_rankings', 'sdgc_front9_shortcode_rankings' );

/**
 * The "how it works" rules shown beside the table.
 *
 * @return array<int, array{title: string, body: string}>
 */
function sdgc_front9_ranking_rules() {
	return apply_filters(
		'sdgc_front9_ranking_rules',
		array(
			array(
				'title' => 'Every Round Counts',
				'body'  => 'League nights, open tournaments, and skins games all award ranking points. If we scored it on our simulators, it is in the ranking.',
			),
			array(
				'title' => 'Points by Strength of Field',
				'body'  => 'Events are weighted by the size and average handicap of the field, so beating a stacked Friday night field is worth more than a quiet one.',
			),
			array(
				'title' => 'A Rolling 104 Weeks',
				'body'  => 'Points age out one year to the week. Stay sharp through the season and your position holds; sit out and it drifts.',
			),
			array(
				'title' => 'Six-Event Minimum',
				'body'  => 'Players need six counting events before they appear. New players show as unranked until they get there.',
			),
		)
	);
}
