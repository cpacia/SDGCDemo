<?php
/**
 * [sdgc_subs] — every open sub request across the org, on a page of its own.
 *
 * The leagues page and each league page show the same list when there's
 * something on it; this is for a standalone "Subs Needed" page, which always
 * renders — with an empty state when nobody needs a sub.
 *
 * @package SDGC_Front9
 */

defined( 'ABSPATH' ) || exit;

/**
 * Renders the subs-needed page body.
 *
 * @return string
 */
function sdgc_front9_shortcode_subs() {
	sdgc_front9_enqueue_assets();

	ob_start();
	?>
	<div class="sdgc">
		<?php echo sdgc_front9_subs_section( sdgc_front9_sub_requests(), true ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	</div>
	<?php
	return sdgc_front9_shortcode_output( ob_get_clean() );
}
add_shortcode( 'sdgc_subs', 'sdgc_front9_shortcode_subs' );

/**
 * The org-wide "Subs Needed" section: heading, then the list.
 *
 * @param array<int, array> $requests     View models.
 * @param bool              $always_show  Render an empty state rather than
 *                                        nothing when the list is empty.
 * @return string
 */
function sdgc_front9_subs_section( $requests, $always_show = false ) {
	if ( empty( $requests ) && ! $always_show ) {
		return '';
	}

	ob_start();
	?>
	<section class="sdgc-section sdgc-section--grey" id="subs">
		<div class="sdgc-wrap">
			<?php echo sdgc_front9_section_heading( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				'Fill In For A Night',
				'Subs Needed',
				'League regulars who can\'t make a night need someone to take their seat. Sign up to sub for one night — no season commitment — and your round counts for their team.'
			); ?>

			<div class="sdgc-subs-wrap">
				<?php if ( ! empty( $requests ) ) : ?>
					<?php echo sdgc_front9_sub_list( $requests ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?php else : ?>
					<?php echo sdgc_front9_empty_state( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						'No Subs Needed Right Now',
						'Every league seat is covered this week. Check back — openings are posted here as soon as a regular calls out.'
					); ?>
				<?php endif; ?>
			</div>
		</div>
	</section>
	<?php
	return ob_get_clean();
}
