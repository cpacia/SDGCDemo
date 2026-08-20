<?php
/**
 * [sdgc_league] — one league's page.
 *
 * Reads the league from `?league=<slug>`, which is what the cards link with.
 * Pass `slug="..."` instead to pin one league to a fixed page.
 *
 * @package SDGC_Front9
 */

defined( 'ABSPATH' ) || exit;

/**
 * Renders a league page body.
 *
 * @param array $atts Shortcode attributes.
 * @return string
 */
function sdgc_front9_shortcode_league( $atts ) {
	sdgc_front9_enqueue_assets();

	$atts = shortcode_atts( array( 'slug' => '' ), $atts, 'sdgc_league' );
	$slug = '' !== $atts['slug'] ? sanitize_title( $atts['slug'] ) : sdgc_front9_query_slug( array( 'league', 'id' ) );

	$league = '' !== $slug ? sdgc_front9_league( $slug ) : null;

	if ( ! $league ) {
		return sdgc_front9_shortcode_output(
			'<div class="sdgc"><section class="sdgc-section sdgc-section--grey"><div class="sdgc-wrap">' .
			sdgc_front9_empty_state(
				'League Not Found',
				'This page needs a league in the URL, and that league has to be published in Front9. Head back to the league list and pick one.'
			) .
			'<p class="sdgc-empty__action"><a class="sdgc-btn sdgc-btn--solid" href="' . esc_url( sdgc_front9_page_url( 'leagues_page' ) ) . '">All Leagues</a></p>' .
			'</div></section></div>'
		);
	}

	$facts = array(
		array(
			'label' => 'Plays',
			'value' => $league['schedule'],
		),
		array(
			'label' => 'Format',
			'value' => $league['format'],
		),
		array(
			'label' => 'Season',
			'value' => $league['season'],
		),
		array(
			'label' => 'Entry',
			'value' => $league['entry_label'],
		),
	);

	ob_start();
	?>
	<div class="sdgc">
		<section class="sdgc-hero"<?php echo sdgc_front9_hero_style(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<div class="sdgc-hero__scrim"></div>
			<div class="sdgc-hero__inner">
				<?php echo sdgc_front9_back_link( sdgc_front9_page_url( 'leagues_page' ) . '#leagues', 'All Leagues' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>

				<div class="sdgc-league__head">
					<?php if ( '' !== $league['logo'] ) : ?>
						<img class="sdgc-league__crest" src="<?php echo esc_url( $league['logo'] ); ?>" alt="" width="240" height="240" />
					<?php endif; ?>
					<div>
						<p class="sdgc-league__format" style="color:<?php echo esc_attr( $league['accent'] ); ?>"><?php echo esc_html( $league['format'] ); ?></p>
						<h1 class="sdgc-league__title"><?php echo esc_html( $league['name'] ); ?></h1>
						<p class="sdgc-league__blurb"><?php echo esc_html( $league['blurb'] ); ?></p>
					</div>
				</div>

				<div class="sdgc-hero__actions">
					<?php
					/*
					 * Only a league taking sign-ups has somewhere to send you. The rest
					 * — season underway, registration not open yet, season over — are
					 * statements of fact, so they render as text rather than a link that
					 * would drop you on a booking page you can't use. The phone button
					 * beside them is the way to ask about the next season.
					 */
					if ( 'registering' === $league['stage'] ) :
						?>
						<form class="sdgc-register" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
							<input type="hidden" name="action" value="sdgc_front9_register" />
							<input type="hidden" name="slug" value="<?php echo esc_attr( $league['slug'] ); ?>" />
							<input type="hidden" name="return" value="<?php echo esc_url( sdgc_front9_current_url() ); ?>" />
							<?php wp_nonce_field( 'sdgc_front9_register', 'sdgc_nonce' ); ?>
							<button type="submit" class="sdgc-btn <?php echo $league['full'] ? 'sdgc-btn--muted' : 'sdgc-btn--solid'; ?>">
								<?php echo esc_html( sdgc_front9_register_label( $league ) ); ?>
							</button>
						</form>
					<?php else : ?>
						<span class="sdgc-btn sdgc-btn--static"><?php echo esc_html( sdgc_front9_register_label( $league ) ); ?></span>
					<?php endif; ?>

					<a class="sdgc-btn sdgc-btn--ghost" href="<?php echo esc_url( sdgc_front9_option( 'phone_href' ) ); ?>">
						<?php echo esc_html( sdgc_front9_option( 'phone' ) ); ?>
					</a>
				</div>
			</div>
			<span class="sdgc-hero__rule" style="background-color:<?php echo esc_attr( $league['accent'] ); ?>"></span>
		</section>

		<?php echo sdgc_front9_fact_strip( $facts ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>

		<section class="sdgc-section sdgc-section--grey">
			<div class="sdgc-wrap">
				<?php if ( $league['has_schedule'] || $league['has_standings'] ) : ?>
					<div class="sdgc-panels">
						<?php
						/*
						 * Both widgets take the league's own slug: the schedule filters
						 * events by the league they're linked to, and the standings
						 * resolves the table the league feeds. Nothing here has to know
						 * an event tag or a standings-table id.
						 */
						if ( $league['has_schedule'] ) {
							echo sdgc_front9_panel_open( 'Schedule', 'Every week of the season, with course and tee time' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
							echo sdgc_front9_embed( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
								'schedule',
								array(
									'title'      => ' ',
									'filter'     => 'all',
									'actions'    => '1',
									'noregister' => '1',
									'league'     => $league['slug'],
									'accent'     => sdgc_front9_option( 'accent' ),
									'link'       => sdgc_front9_link_template( 'event_page', 'event' ),
								)
							);
							echo sdgc_front9_panel_close(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						}

						if ( $league['has_standings'] ) {
							echo sdgc_front9_panel_open( 'Standings', 'Live season points, updated after every week' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
							echo sdgc_front9_embed( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
								'standings',
								array(
									'title'  => ' ',
									'league' => $league['slug'],
									'accent' => sdgc_front9_option( 'accent' ),
								)
							);
							echo sdgc_front9_panel_close(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						}
						?>
					</div>
				<?php else : ?>
					<?php echo sdgc_front9_empty_state( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						'Schedule &amp; Standings Coming Soon',
						"This league hasn't been set up in Front9 yet. Once it is, the weekly schedule and live standings will appear here automatically."
					); ?>
				<?php endif; ?>
			</div>
		</section>
	</div>
	<?php
	return sdgc_front9_shortcode_output( ob_get_clean() );
}
add_shortcode( 'sdgc_league', 'sdgc_front9_shortcode_league' );

/**
 * The URL of the page being viewed, used to send a failed registration back
 * where it started.
 *
 * Read off the request rather than the $wp global, which isn't set in every
 * context a shortcode can be rendered from (REST previews, for one).
 *
 * @return string
 */
function sdgc_front9_current_url() {
	$uri = isset( $_SERVER['REQUEST_URI'] ) ? esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
	return '' !== $uri ? home_url( $uri ) : home_url( '/' );
}
