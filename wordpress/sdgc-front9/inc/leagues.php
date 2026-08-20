<?php
/**
 * Turns the API's event-series payload into the shape the pages render.
 *
 * A league is an "event series" in the API. Everything here is display logic:
 * which leagues are still worth showing, where each one sits in its own
 * calendar, and the one line of text that says whether you can still join.
 *
 * @package SDGC_Front9
 */

defined( 'ABSPATH' ) || exit;

/** A finished league stays on the site for one month past its end date. */
const SDGC_FRONT9_GRACE_MONTHS = 1;

/**
 * Every league the org is showing right now: still to come, running, or
 * finished within the past month.
 *
 * @return array<int, array> View models, running and upcoming first.
 */
function sdgc_front9_leagues() {
	$today = sdgc_front9_today();
	$rows  = array();

	foreach ( sdgc_front9_get_leagues() as $series ) {
		if ( ! is_array( $series ) || empty( $series['slug'] ) ) {
			continue;
		}
		if ( ! sdgc_front9_still_showing( $series, $today ) ) {
			continue;
		}
		$rows[] = $series;
	}

	usort( $rows, 'sdgc_front9_compare_leagues' );

	return array_map( 'sdgc_front9_league_view', $rows );
}

/**
 * One league by slug, as a view model, or null.
 *
 * @param string $slug League slug.
 * @return array|null
 */
function sdgc_front9_league( $slug ) {
	$series = sdgc_front9_get_league( $slug );
	return is_array( $series ) && ! empty( $series['slug'] ) ? sdgc_front9_league_view( $series ) : null;
}

/**
 * A league drops off the site one month after it ends. Anything without an end
 * date (a year-round league) stays up.
 *
 * @param array             $series Raw payload.
 * @param DateTimeImmutable $today  Today at UTC midnight.
 * @return bool
 */
function sdgc_front9_still_showing( $series, $today ) {
	$end = sdgc_front9_date( $series, 'endDate' );
	if ( ! $end ) {
		return true;
	}

	// Through the end of the last day, not its midnight.
	$cutoff = $end->modify( '+' . SDGC_FRONT9_GRACE_MONTHS . ' month' )->modify( '+1 day' );
	return $today < $cutoff;
}

/**
 * Running and upcoming leagues first, in the order they start; then the ones
 * playing out their grace month, most recently finished first.
 *
 * @param array $a Raw payload.
 * @param array $b Raw payload.
 * @return int
 */
function sdgc_front9_compare_leagues( $a, $b ) {
	$done_a = ( isset( $a['status'] ) && 'completed' === $a['status'] ) ? 1 : 0;
	$done_b = ( isset( $b['status'] ) && 'completed' === $b['status'] ) ? 1 : 0;

	if ( $done_a !== $done_b ) {
		return $done_a - $done_b;
	}
	if ( $done_a ) {
		return strcmp( (string) ( $b['endDate'] ?? '' ), (string) ( $a['endDate'] ?? '' ) );
	}
	return strcmp( (string) ( $a['startDate'] ?? '' ), (string) ( $b['startDate'] ?? '' ) );
}

/**
 * The view model one league renders from.
 *
 * @param array $series Raw payload.
 * @return array
 */
function sdgc_front9_league_view( $series ) {
	$entry_size  = max( 1, (int) ( $series['entrySize'] ?? 1 ) );
	$entry_label = sdgc_front9_entry_label( $entry_size );
	$spots_open  = sdgc_front9_spots_open( $series );
	$stage       = sdgc_front9_stage( $series, sdgc_front9_today() );
	$full        = ( 0 === $spots_open );
	$image       = (string) ( $series['seriesImageUrl'] ?? '' );

	$season_label = trim( (string) ( $series['seasonLabel'] ?? '' ) );

	$logo = '' !== $image ? untrailingslashit( sdgc_front9_option( 'api' ) ) . $image : '';

	// Read off the crest, so each league colours itself. Falls back to the brand
	// colour for a greyscale logo or a crest we can't read.
	$accent = '' !== $logo ? sdgc_front9_accent( $logo ) : '';

	return array(
		'id'            => (int) ( $series['id'] ?? 0 ),
		'slug'          => (string) $series['slug'],
		'name'          => (string) ( $series['name'] ?? '' ),
		'logo'          => $logo,
		'accent'        => '' !== $accent ? $accent : sdgc_front9_option( 'accent' ),
		'schedule'      => sdgc_front9_schedule_label( $series ),
		'format'        => '' !== $season_label ? $season_label : $entry_label,
		'season'        => sdgc_front9_season_label( $series ),
		'entry_label'   => $entry_label,
		'blurb'         => trim( (string) ( $series['description'] ?? '' ) ),
		'stage'         => $stage,
		'members'       => (int) ( $series['memberCount'] ?? 0 ),
		'spots_open'    => $spots_open,
		'full'          => $full,
		'status_label'  => sdgc_front9_status_label( $series, $stage, $spots_open ),
		// Only an actual invitation gets the accent: a season already underway
		// or a full roster is a state, not a call to action.
		'status_open'   => ( 'registering' === $stage && ! $full ),
		'has_schedule'  => ( (int) ( $series['linkedEventCount'] ?? 0 ) > 0 ),
		'has_standings' => isset( $series['standingSeriesId'] ),
	);
}

/**
 * Which stage a league is in, most-final first: a finished season is finished
 * whatever its registration window says, and a season that has started is
 * underway even if the org never flipped the status off "open".
 *
 * @param array             $series Raw payload.
 * @param DateTimeImmutable $today  Today at UTC midnight.
 * @return string upcoming|registering|closed|playing|finished
 */
function sdgc_front9_stage( $series, $today ) {
	$status = (string) ( $series['status'] ?? '' );

	if ( 'completed' === $status || 'canceled' === $status ) {
		return 'finished';
	}

	$end = sdgc_front9_date( $series, 'endDate' );
	if ( $end && $today > $end ) {
		return 'finished';
	}

	$start = sdgc_front9_date( $series, 'startDate' );
	if ( 'active' === $status || ( $start && $today >= $start ) ) {
		return 'playing';
	}

	$opens = sdgc_front9_date( $series, 'registrationOpensAt' );
	if ( $opens && $today < $opens ) {
		return 'upcoming';
	}

	// Inclusive: a league closing "Mar 4" takes sign-ups all of Mar 4, matching
	// how the API treats the same date.
	$closes = sdgc_front9_date( $series, 'registrationClosesAt' );
	if ( $closes && $today > $closes ) {
		return 'closed';
	}

	return 'registering';
}

/**
 * Seats left, in GOLFERS. `maxEntries` is named for entries but the API enforces
 * it against the roster count — a pairs league capped at 18 holds 18 golfers,
 * not 18 pairs — so the two compare directly. Null when there's no cap.
 *
 * @param array $series Raw payload.
 * @return int|null
 */
function sdgc_front9_spots_open( $series ) {
	if ( ! isset( $series['maxEntries'] ) ) {
		return null;
	}
	return max( 0, (int) $series['maxEntries'] - (int) ( $series['memberCount'] ?? 0 ) );
}

/**
 * The card's bottom line. While a league is taking sign-ups this is the number
 * that matters ("6 spots open"); once it isn't, it's the field it ended up with
 * ("Full · 24 teams").
 *
 * @param array    $series     Raw payload.
 * @param string   $stage      Stage.
 * @param int|null $spots_open Seats left.
 * @return string
 */
function sdgc_front9_status_label( $series, $stage, $spots_open ) {
	$field = sdgc_front9_field_label( $series );

	switch ( $stage ) {
		case 'finished':
			return 'Season Complete';

		case 'playing':
			return '' !== $field ? 'Season Underway · ' . $field : 'Season Underway';

		case 'upcoming':
			$opens = sdgc_front9_date( $series, 'registrationOpensAt' );
			return $opens ? 'Opens ' . $opens->format( 'M j' ) : 'Registration Opens Soon';

		case 'closed':
			return '' !== $field ? 'Registration Closed · ' . $field : 'Registration Closed';

		case 'registering':
		default:
			if ( null === $spots_open ) {
				return 'Registration Open';
			}
			if ( 0 === $spots_open ) {
				return '' !== $field ? 'Full · ' . $field : 'Registration Full';
			}
			return $spots_open . ' spots open';
	}
}

/**
 * The size of the full field, in the unit the league is played in. The cap is a
 * golfer count, so a team league divides it down — and only when it divides
 * evenly, since an odd cap doesn't describe a whole number of teams.
 *
 * @param array $series Raw payload.
 * @return string
 */
function sdgc_front9_field_label( $series ) {
	if ( ! isset( $series['maxEntries'] ) ) {
		return '';
	}

	$cap  = (int) $series['maxEntries'];
	$size = max( 1, (int) ( $series['entrySize'] ?? 1 ) );

	if ( $size > 1 && 0 === $cap % $size ) {
		return ( $cap / $size ) . ' teams';
	}
	return $cap . ' players';
}

/**
 * When the league plays. `scheduleLabel` is the org's own wording and carries
 * the tee times ("Thursdays: 6:00-10:00 PM"), so it's used verbatim wherever
 * it's set.
 *
 * Without one there's only the start date to go on: a league plays the same
 * night every week, so its first night names the night — but nothing else in
 * the API carries a time, which is the whole reason scheduleLabel exists.
 *
 * @param array $series Raw payload.
 * @return string
 */
function sdgc_front9_schedule_label( $series ) {
	$label = trim( (string) ( $series['scheduleLabel'] ?? '' ) );
	if ( '' !== $label ) {
		return $label;
	}

	$start = sdgc_front9_date( $series, 'startDate' );
	return $start ? $start->format( 'l' ) . 's' : 'Schedule TBA';
}

/**
 * "Jul 16 – Aug 27, 2026", or whichever half of that the league publishes.
 *
 * @param array $series Raw payload.
 * @return string
 */
function sdgc_front9_season_label( $series ) {
	$start = sdgc_front9_date( $series, 'startDate' );
	$end   = sdgc_front9_date( $series, 'endDate' );

	if ( $start && $end ) {
		$same_year = $start->format( 'Y' ) === $end->format( 'Y' );
		$from      = $same_year ? $start->format( 'M j' ) : $start->format( 'M j, Y' );
		return $from . ' – ' . $end->format( 'M j, Y' );
	}
	if ( $start ) {
		return 'Starts ' . $start->format( 'M j, Y' );
	}
	if ( $end ) {
		return 'Through ' . $end->format( 'M j, Y' );
	}

	$season_label = trim( (string) ( $series['seasonLabel'] ?? '' ) );
	return '' !== $season_label ? $season_label : 'Year Round';
}

/**
 * "Individual", "Two-Person Teams", and so on.
 *
 * @param int $entry_size Golfers per entry.
 * @return string
 */
function sdgc_front9_entry_label( $entry_size ) {
	if ( $entry_size <= 1 ) {
		return 'Individual';
	}

	$words = array( 2 => 'Two', 3 => 'Three', 4 => 'Four', 5 => 'Five', 6 => 'Six' );
	$word  = isset( $words[ $entry_size ] ) ? $words[ $entry_size ] : (string) $entry_size;

	return $word . '-Person Teams';
}

/**
 * The CTA's label, which follows the same stage the card's footer does.
 *
 * @param array $league View model.
 * @return string
 */
function sdgc_front9_register_label( $league ) {
	switch ( $league['stage'] ) {
		case 'finished':
			return 'Season Complete';
		case 'playing':
			return 'Season Underway — Ask About Next Season';
		case 'upcoming':
			return 'Registration ' . $league['status_label'];
		case 'closed':
			return 'Registration Closed';
		case 'registering':
		default:
			if ( $league['full'] ) {
				return 'League Full — Join Waitlist';
			}
			return null === $league['spots_open']
				? 'Register Now'
				: 'Register — ' . $league['spots_open'] . ' Spots Open';
	}
}

/* -------------------------------------------------------------------------- */
/* Dates — the API sends date-only strings, so everything stays in UTC to keep  */
/* "Jul 16" from sliding to "Jul 15" west of Greenwich.                        */
/* -------------------------------------------------------------------------- */

/**
 * Today at UTC midnight, so it compares like-for-like against the date-only
 * values the API sends.
 *
 * @return DateTimeImmutable
 */
function sdgc_front9_today() {
	return new DateTimeImmutable( gmdate( 'Y-m-d' ) . ' 00:00:00', new DateTimeZone( 'UTC' ) );
}

/**
 * Reads a "YYYY-MM-DD" field off the payload.
 *
 * @param array  $series Raw payload.
 * @param string $key    Field name.
 * @return DateTimeImmutable|null
 */
function sdgc_front9_date( $series, $key ) {
	$value = isset( $series[ $key ] ) ? (string) $series[ $key ] : '';
	if ( ! preg_match( '/^(\d{4})-(\d{2})-(\d{2})/', $value, $m ) ) {
		return null;
	}

	return new DateTimeImmutable( $m[1] . '-' . $m[2] . '-' . $m[3] . ' 00:00:00', new DateTimeZone( 'UTC' ) );
}
