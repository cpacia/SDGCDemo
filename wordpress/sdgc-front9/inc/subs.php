<?php
/**
 * Sub requests: league seats looking for a substitute for one night.
 *
 * A league admin posts one in Front9 when a regular can't make a night. The
 * list here is what golfers browse, and each row's button sends them through
 * the same hosted registration as the league's Register button — with the
 * request id attached, so Front9 puts them in that one seat.
 *
 * @package SDGC_Front9
 */

defined( 'ABSPATH' ) || exit;

/**
 * Open sub requests as view models, soonest night first.
 *
 * @param array|null $league League view model to narrow to one league, or null
 *                           for every league in the org.
 * @return array<int, array>
 */
function sdgc_front9_sub_requests( $league = null ) {
	$rows = sdgc_front9_get_sub_requests( $league ? $league['slug'] : '' );

	// Each row borrows its league's crest colour. One league's page already has
	// it; the org-wide list reads it off the (cached) league list.
	$accents = array();
	if ( $league ) {
		$accents[ $league['slug'] ] = $league['accent'];
	} elseif ( ! empty( $rows ) ) {
		foreach ( sdgc_front9_leagues() as $view ) {
			$accents[ $view['slug'] ] = $view['accent'];
		}
	}

	$requests = array();
	foreach ( $rows as $row ) {
		if ( ! is_array( $row ) || empty( $row['id'] ) || empty( $row['eventSeriesId'] ) ) {
			continue;
		}
		$requests[] = sdgc_front9_sub_request_view( $row, $accents );
	}

	usort(
		$requests,
		static function ( $a, $b ) {
			return strcmp( $a['sort'], $b['sort'] );
		}
	);

	return $requests;
}

/**
 * One request in the shape the list renders.
 *
 * @param array                 $row     Raw payload.
 * @param array<string, string> $accents League slug => accent colour.
 * @return array
 */
function sdgc_front9_sub_request_view( $row, $accents ) {
	$slug = (string) ( $row['eventSeriesSlug'] ?? '' );
	$date = sdgc_front9_date( $row, 'eventDate' );

	// First tee time, once the tee sheet has one. A real instant, so it's shown
	// in the site's timezone rather than the UTC the dates are kept in.
	$start = isset( $row['eventStartTime'] ) ? strtotime( (string) $row['eventStartTime'] ) : false;
	if ( ! $date && $start ) {
		$date = sdgc_front9_date( array( 'd' => wp_date( 'Y-m-d', $start ) ), 'd' );
	}

	return array(
		'id'           => (int) $row['id'],
		'league_name'  => (string) ( $row['eventSeriesName'] ?? '' ),
		'league_slug'  => $slug,
		'accent'       => isset( $accents[ $slug ] ) ? $accents[ $slug ] : sdgc_front9_option( 'accent' ),
		'event_title'  => (string) ( $row['eventTitle'] ?? '' ),
		'team'         => trim( (string) ( $row['teamName'] ?? '' ) ),
		'note'         => trim( (string) ( $row['note'] ?? '' ) ),
		'weekday'      => $date ? $date->format( 'D' ) : '',
		'day'          => $date ? $date->format( 'j' ) : '',
		'month'        => $date ? $date->format( 'M' ) : '',
		'tee_time'     => $start ? wp_date( 'g:i A', $start ) : '',
		'fee_label'    => sdgc_front9_fee_label( (int) ( $row['feeCents'] ?? 0 ) ),
		'free'         => (int) ( $row['feeCents'] ?? 0 ) <= 0,
		'members_only' => ! empty( $row['membersOnly'] ),
		// Undated requests sort last.
		'sort'         => ( $date ? $date->format( 'Y-m-d' ) : '9999-99-99' ) . ( $start ? gmdate( 'H:i', $start ) : '99:99' ),
	);
}

/**
 * "$20", "$22.50" or "Free".
 *
 * @param int $cents Fee in cents.
 * @return string
 */
function sdgc_front9_fee_label( $cents ) {
	if ( $cents <= 0 ) {
		return 'Free';
	}
	return '$' . number_format( $cents / 100, 0 === $cents % 100 ? 0 : 2 );
}

/**
 * The list of open requests, each with its sign-up button.
 *
 * @param array<int, array> $requests    View models.
 * @param bool              $show_league Name each row's league — off on a
 *                                       league's own page, where it's obvious.
 * @return string
 */
function sdgc_front9_sub_list( $requests, $show_league = true ) {
	$return = sdgc_front9_current_url();
	$nonce  = wp_create_nonce( 'sdgc_front9_sub' );

	ob_start();

	// Set by the sign-up handler when a request went between page load and click.
	if ( isset( $_GET['sdgc_sub'] ) && 'filled' === $_GET['sdgc_sub'] ) : // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		?>
		<p class="sdgc-subs__notice" role="status">Sorry — that spot has just been filled. Any other open spots are listed below.</p>
		<?php
	endif;
	?>
	<ul class="sdgc-subs">
		<?php foreach ( $requests as $request ) : ?>
			<li class="sdgc-sub" style="border-left-color:<?php echo esc_attr( $request['accent'] ); ?>">
				<div class="sdgc-sub__date">
					<?php if ( '' !== $request['day'] ) : ?>
						<span class="sdgc-sub__weekday"><?php echo esc_html( $request['weekday'] ); ?></span>
						<span class="sdgc-sub__day"><?php echo esc_html( $request['day'] ); ?></span>
						<span class="sdgc-sub__month"><?php echo esc_html( $request['month'] ); ?></span>
					<?php else : ?>
						<span class="sdgc-sub__weekday">Date</span>
						<span class="sdgc-sub__day">TBD</span>
					<?php endif; ?>
				</div>

				<div class="sdgc-sub__body">
					<?php if ( $show_league && '' !== $request['league_name'] ) : ?>
						<p class="sdgc-sub__league" style="color:<?php echo esc_attr( $request['accent'] ); ?>">
							<?php if ( '' !== $request['league_slug'] ) : ?>
								<a href="<?php echo esc_url( add_query_arg( 'league', rawurlencode( $request['league_slug'] ), sdgc_front9_page_url( 'league_page' ) ) ); ?>"><?php echo esc_html( $request['league_name'] ); ?></a>
							<?php else : ?>
								<?php echo esc_html( $request['league_name'] ); ?>
							<?php endif; ?>
						</p>
					<?php endif; ?>
					<h3 class="sdgc-sub__title"><?php echo esc_html( $request['event_title'] ); ?></h3>
					<p class="sdgc-sub__meta">
						<?php
						$meta = array();
						if ( '' !== $request['team'] ) {
							$meta[] = 'Playing for ' . $request['team'];
						}
						if ( '' !== $request['tee_time'] ) {
							$meta[] = 'First tee ' . $request['tee_time'];
						}
						echo esc_html( implode( ' · ', $meta ) );
						?>
					</p>
					<?php if ( '' !== $request['note'] ) : ?>
						<p class="sdgc-sub__note"><?php echo esc_html( $request['note'] ); ?></p>
					<?php endif; ?>
				</div>

				<div class="sdgc-sub__action">
					<p class="sdgc-sub__terms">
						<span class="sdgc-sub__fee<?php echo $request['free'] ? ' is-free' : ''; ?>"><?php echo esc_html( $request['fee_label'] ); ?></span>
						<?php if ( $request['members_only'] ) : ?>
							<span class="sdgc-sub__tag">Members Only</span>
						<?php endif; ?>
					</p>
					<form class="sdgc-register" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
						<input type="hidden" name="action" value="sdgc_front9_sub" />
						<input type="hidden" name="request" value="<?php echo esc_attr( (string) $request['id'] ); ?>" />
						<input type="hidden" name="league" value="<?php echo esc_attr( $request['league_slug'] ); ?>" />
						<input type="hidden" name="return" value="<?php echo esc_url( $return ); ?>" />
						<input type="hidden" name="sdgc_nonce" value="<?php echo esc_attr( $nonce ); ?>" />
						<button type="submit" class="sdgc-btn sdgc-btn--solid sdgc-btn--small">Sign Up to Sub</button>
					</form>
				</div>
			</li>
		<?php endforeach; ?>
	</ul>
	<?php
	return ob_get_clean();
}
