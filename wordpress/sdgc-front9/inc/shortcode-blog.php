<?php
/**
 * [sdgc_blog] — a single blog post.
 *
 * One reusable page, the same shape as the league and event pages: the post to
 * show comes from `?id=<slug>`, which is what the blog feed on the leagues page
 * links to. The widget reads that parameter itself — `data-post="url"` tells
 * embed.js to take the slug from the URL rather than from a fixed attribute —
 * so nothing here has to fetch or know the post.
 *
 * @package SDGC_Front9
 */

defined( 'ABSPATH' ) || exit;

/**
 * Renders the blog post page body.
 *
 * @param array<string, string> $atts Shortcode attributes.
 * @return string
 */
function sdgc_front9_shortcode_blog( $atts = array() ) {
	sdgc_front9_enqueue_assets();

	$atts = shortcode_atts( array( 'slug' => '' ), $atts, 'sdgc_blog' );

	// A slug on the shortcode pins one post to its own permanent page; without
	// one the page serves whichever post the URL asks for.
	$slug = '' !== $atts['slug'] ? sanitize_title( $atts['slug'] ) : sdgc_front9_query_slug( array( 'id', 'post', 'slug' ) );

	$options = array(
		'accent' => sdgc_front9_option( 'accent' ),
	);

	if ( '' !== $atts['slug'] ) {
		$options['post'] = $slug;
	} else {
		// Let the widget read the slug out of the query string itself.
		$options['post']      = 'url';
		$options['postParam'] = 'id';
	}

	ob_start();
	?>
	<div class="sdgc">
		<section class="sdgc-hero sdgc-hero--flat sdgc-hero--compact">
			<div class="sdgc-hero__inner">
				<?php echo sdgc_front9_back_link( sdgc_front9_page_url( 'leagues_page' ) . '#schedule', 'All Posts' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<p class="sdgc-hero__eyebrow sdgc-hero__eyebrow--spaced">Seth Dichard Golf Centers</p>
				<h1 class="sdgc-event__title">From the Blog</h1>
			</div>
			<span class="sdgc-hero__rule"></span>
		</section>

		<section class="sdgc-section sdgc-section--grey">
			<div class="sdgc-wrap">
				<?php if ( '' === $slug ) : ?>
					<?php echo sdgc_front9_empty_state( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						'No Post Selected',
						'This page needs a post in the URL, for example ?id=derek-roy-and-ainsley-roy-capture-victory'
					); ?>
				<?php else : ?>
					<div class="sdgc-tabpanels">
						<?php echo sdgc_front9_embed( 'blog-post', $options ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					</div>
				<?php endif; ?>
			</div>
		</section>
	</div>
	<?php
	return sdgc_front9_shortcode_output( ob_get_clean() );
}
add_shortcode( 'sdgc_blog', 'sdgc_front9_shortcode_blog' );
