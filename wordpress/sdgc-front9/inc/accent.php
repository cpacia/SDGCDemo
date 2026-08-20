<?php
/**
 * Picks a league's accent colour out of its crest.
 *
 * The original design gave every league its own colour, keyed to its logo — red
 * for the men's league, green for mixed doubles, gold for skins. Front9 stores
 * no such field, but the crest itself is the source that mattered, so the colour
 * is read back out of the image rather than kept in a table that would go stale
 * the moment an org uploads a new logo.
 *
 * Decoding is GD's job (every WordPress host has it — WP's own image editor
 * needs GD or Imagick), so what's left here is the choosing: a crest is mostly
 * black with a thin band of vivid colour, and it's that band we're after.
 *
 * @package SDGC_Front9
 */

defined( 'ABSPATH' ) || exit;

/** Ignore near-grey pixels: a crest is mostly black, white and outline. */
const SDGC_FRONT9_MIN_SATURATION = 0.35;
/** …and ignore the extremes, which carry a hue but read as black or white. */
const SDGC_FRONT9_MIN_LIGHTNESS = 0.18;
const SDGC_FRONT9_MAX_LIGHTNESS = 0.9;
/** Below this the crest has no colour worth using. */
const SDGC_FRONT9_MIN_COLOURED = 40;
/** Hue buckets. 24 keeps red separate from orange without splitting a ring. */
const SDGC_FRONT9_HUE_BUCKETS = 24;
/** Crests are sampled at this size — enough detail, a fraction of the work. */
const SDGC_FRONT9_SAMPLE_SIZE = 120;

/**
 * The accent for one crest, or '' when the image can't be read or carries no
 * colour (the stock "league photo coming soon" placeholder is pure greyscale).
 *
 * Cached for a week rather than the usual few minutes: a crest only changes when
 * someone uploads a new one, and that lands on a new versioned URL, which is a
 * different cache key.
 *
 * @param string $url Absolute image URL.
 * @return string Hex colour, or '' for none.
 */
function sdgc_front9_accent( $url ) {
	if ( '' === $url || ! function_exists( 'imagecreatefromstring' ) ) {
		return '';
	}

	$key    = 'sdgc_f9_accent_' . md5( $url );
	$cached = get_transient( $key );
	if ( false !== $cached ) {
		return is_string( $cached ) ? $cached : '';
	}

	$accent = sdgc_front9_extract_accent( $url );
	set_transient( $key, $accent, WEEK_IN_SECONDS );

	return $accent;
}

/**
 * Downloads a crest and reduces it to one colour.
 *
 * @param string $url Absolute image URL.
 * @return string Hex colour, or '' for none.
 */
function sdgc_front9_extract_accent( $url ) {
	$response = wp_remote_get( $url, array( 'timeout' => 8 ) );
	if ( is_wp_error( $response ) || 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
		sdgc_front9_log( 'accent: could not fetch ' . $url );
		return '';
	}

	$image = @imagecreatefromstring( wp_remote_retrieve_body( $response ) ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
	if ( ! $image ) {
		return '';
	}

	// Sampling a downscaled copy: a 1200px crest is 1.4M pixels, and the ring's
	// colour survives the reduction intact.
	$sample = imagescale( $image, SDGC_FRONT9_SAMPLE_SIZE, SDGC_FRONT9_SAMPLE_SIZE );
	imagedestroy( $image );
	if ( ! $sample ) {
		return '';
	}

	$accent = sdgc_front9_dominant_colour( $sample );
	imagedestroy( $sample );

	return $accent;
}

/**
 * The crest's most present colour: hue-bucket every pixel that actually has a
 * hue, weight each by how saturated it is, and average the winning bucket.
 *
 * Weighting matters because a crest's ring is a thin band of vivid colour
 * against a large dark field — counting pixels alone would favour the muddy
 * anti-aliased edge over the ring itself.
 *
 * @param GdImage $image Sampled image.
 * @return string Hex colour, or '' for none.
 */
function sdgc_front9_dominant_colour( $image ) {
	$width  = imagesx( $image );
	$height = imagesy( $image );

	$weights  = array_fill( 0, SDGC_FRONT9_HUE_BUCKETS, 0.0 );
	$sums     = array_fill( 0, SDGC_FRONT9_HUE_BUCKETS, array( 0.0, 0.0, 0.0, 0.0 ) );
	$coloured = 0;

	for ( $y = 0; $y < $height; $y++ ) {
		for ( $x = 0; $x < $width; $x++ ) {
			$rgba = imagecolorat( $image, $x, $y );

			// GD's alpha runs 0 (opaque) to 127 (transparent); skip the
			// transparent corners of a round crest.
			if ( ( ( $rgba >> 24 ) & 0x7F ) > 64 ) {
				continue;
			}

			$r = ( $rgba >> 16 ) & 0xFF;
			$g = ( $rgba >> 8 ) & 0xFF;
			$b = $rgba & 0xFF;

			list( $h, $s, $l ) = sdgc_front9_to_hsl( $r, $g, $b );
			if ( $s < SDGC_FRONT9_MIN_SATURATION || $l < SDGC_FRONT9_MIN_LIGHTNESS || $l > SDGC_FRONT9_MAX_LIGHTNESS ) {
				continue;
			}

			$coloured++;
			$bucket = (int) min( SDGC_FRONT9_HUE_BUCKETS - 1, floor( ( $h / 360 ) * SDGC_FRONT9_HUE_BUCKETS ) );

			$weights[ $bucket ]  += $s;
			$sums[ $bucket ][0]  += $r * $s;
			$sums[ $bucket ][1]  += $g * $s;
			$sums[ $bucket ][2]  += $b * $s;
			$sums[ $bucket ][3]  += $s;
		}
	}

	if ( $coloured < SDGC_FRONT9_MIN_COLOURED ) {
		return '';
	}

	$best = 0;
	for ( $i = 1; $i < SDGC_FRONT9_HUE_BUCKETS; $i++ ) {
		if ( $weights[ $i ] > $weights[ $best ] ) {
			$best = $i;
		}
	}

	$winner = $sums[ $best ];
	if ( $winner[3] <= 0 ) {
		return '';
	}

	return sdgc_front9_to_hex(
		sdgc_front9_vivid(
			$winner[0] / $winner[3],
			$winner[1] / $winner[3],
			$winner[2] / $winner[3]
		)
	);
}

/**
 * Nudges the averaged colour back to something usable as ink. Averaging pulls a
 * ring's colour toward the dark field behind it, and this accent is also set as
 * text on a black hero, so anything too dark or too washed out is lifted.
 *
 * @param float $r Red 0-255.
 * @param float $g Green 0-255.
 * @param float $b Blue 0-255.
 * @return array{0: float, 1: float, 2: float}
 */
function sdgc_front9_vivid( $r, $g, $b ) {
	list( $h, $s, $l ) = sdgc_front9_to_hsl( $r, $g, $b );
	return sdgc_front9_from_hsl( $h, max( $s, 0.55 ), min( max( $l, 0.42 ), 0.62 ) );
}

/**
 * RGB (0-255) to HSL, with hue in degrees and the rest 0-1.
 *
 * @param float $r Red.
 * @param float $g Green.
 * @param float $b Blue.
 * @return array{0: float, 1: float, 2: float}
 */
function sdgc_front9_to_hsl( $r, $g, $b ) {
	$rn = $r / 255;
	$gn = $g / 255;
	$bn = $b / 255;

	$max = max( $rn, $gn, $bn );
	$min = min( $rn, $gn, $bn );
	$l   = ( $max + $min ) / 2;
	$d   = $max - $min;

	if ( 0.0 === (float) $d ) {
		return array( 0.0, 0.0, $l );
	}

	$s = $l > 0.5 ? $d / ( 2 - $max - $min ) : $d / ( $max + $min );

	if ( $max === $rn ) {
		$h = fmod( ( $gn - $bn ) / $d, 6 );
	} elseif ( $max === $gn ) {
		$h = ( ( $bn - $rn ) / $d ) + 2;
	} else {
		$h = ( ( $rn - $gn ) / $d ) + 4;
	}

	$h *= 60;
	if ( $h < 0 ) {
		$h += 360;
	}

	return array( $h, $s, $l );
}

/**
 * HSL back to RGB (0-255).
 *
 * @param float $h Hue in degrees.
 * @param float $s Saturation 0-1.
 * @param float $l Lightness 0-1.
 * @return array{0: float, 1: float, 2: float}
 */
function sdgc_front9_from_hsl( $h, $s, $l ) {
	$c = ( 1 - abs( ( 2 * $l ) - 1 ) ) * $s;
	$x = $c * ( 1 - abs( fmod( $h / 60, 2 ) - 1 ) );
	$m = $l - ( $c / 2 );

	if ( $h < 60 ) {
		$rgb = array( $c, $x, 0 );
	} elseif ( $h < 120 ) {
		$rgb = array( $x, $c, 0 );
	} elseif ( $h < 180 ) {
		$rgb = array( 0, $c, $x );
	} elseif ( $h < 240 ) {
		$rgb = array( 0, $x, $c );
	} elseif ( $h < 300 ) {
		$rgb = array( $x, 0, $c );
	} else {
		$rgb = array( $c, 0, $x );
	}

	return array(
		( $rgb[0] + $m ) * 255,
		( $rgb[1] + $m ) * 255,
		( $rgb[2] + $m ) * 255,
	);
}

/**
 * "#rrggbb" from an RGB triple.
 *
 * @param array{0: float, 1: float, 2: float} $rgb Channels 0-255.
 * @return string
 */
function sdgc_front9_to_hex( $rgb ) {
	$hex = '#';
	foreach ( $rgb as $channel ) {
		$hex .= str_pad( dechex( (int) round( min( 255, max( 0, $channel ) ) ) ), 2, '0', STR_PAD_LEFT );
	}
	return $hex;
}
