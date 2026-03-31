<?php
/**
 * Configure WordPress Playground demo pages for K Typewriter.
 *
 * @package KTypewriter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$patterns_dir = dirname( __DIR__ ) . '/patterns';
$hero         = require $patterns_dir . '/hero-headline.php';
$inline       = require $patterns_dir . '/inline-keyword-rotator.php';
$announcement = require $patterns_dir . '/announcement-strip.php';
$feature      = require $patterns_dir . '/feature-spotlight.php';
$multilingual = require $patterns_dir . '/multilingual-spotlight.php';
$split_hero   = require $patterns_dir . '/split-launch-hero.php';
$editorial    = require $patterns_dir . '/editorial-section-lead.php';
$error_prompt = require $patterns_dir . '/404-error-prompt.php';
$terminal     = require $patterns_dir . '/terminal-loading-steps.php';

$upsert_page = static function( $slug, $title, $content ) {
	$existing_page = get_page_by_path( $slug, OBJECT, 'page' );
	$page_id       = wp_insert_post(
		wp_slash(
			array(
				'ID'           => $existing_page instanceof WP_Post ? $existing_page->ID : 0,
				'post_name'    => $slug,
				'post_title'   => $title,
				'post_status'  => 'publish',
				'post_type'    => 'page',
				'post_content' => $content,
			)
		),
		true
	);

	if ( is_wp_error( $page_id ) ) {
		throw new Exception( $page_id->get_error_message() );
	}

	return (int) $page_id;
};

$placeholder = '<!-- wp:paragraph --><p>Preparing demo…</p><!-- /wp:paragraph -->';
$gallery_id  = $upsert_page( 'k-typewriter-demo', 'K Typewriter Pattern Gallery', $placeholder );
$lab_id      = $upsert_page( 'k-typewriter-layout-lab', 'K Typewriter Stability Examples', $placeholder );
$gallery_url = esc_url_raw( get_permalink( $gallery_id ) );
$lab_url     = esc_url_raw( get_permalink( $lab_id ) );

$sample_page = get_page_by_path( 'sample-page', OBJECT, 'page' );

if ( $sample_page instanceof WP_Post ) {
	wp_trash_post( $sample_page->ID );
}

$gallery_intro = sprintf(
	<<<'HTML'
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"3rem","right":"1.5rem","bottom":"2.5rem","left":"1.5rem"}},"color":{"background":"#101827","text":"#f9fafb"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-text-color has-background" style="color:#f9fafb;background-color:#101827;padding-top:3rem;padding-right:1.5rem;padding-bottom:2.5rem;padding-left:1.5rem"><!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.85rem","textTransform":"uppercase","letterSpacing":"0.14em"}}} -->
<p class="has-text-align-center" style="font-size:0.85rem;letter-spacing:0.14em;text-transform:uppercase">K Typewriter pattern gallery</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(2.2rem,6vw,3.8rem)","lineHeight":"1.05"}}} -->
<h1 class="wp-block-heading has-text-align-center" style="font-size:clamp(2.2rem,6vw,3.8rem);line-height:1.05">Start with polished patterns, then compare the stability examples.</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.95rem"}}} -->
<p class="has-text-align-center" style="font-size:0.95rem">This page focuses on stable, ready-to-use patterns. The comparison page makes width and line changes easier to notice before you use them in a real layout.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons"><!-- wp:button {"textColor":"contrast","style":{"border":{"radius":"999px"},"color":{"background":"#f9fafb","text":"#101827"}}} -->
<div class="wp-block-button"><a class="wp-block-button__link has-contrast-color has-text-color has-background wp-element-button" href="%s" style="border-radius:999px;color:#101827;background-color:#f9fafb">Open the stability examples</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->
HTML,
	$lab_url
);

$section_spacer = "\n<!-- wp:spacer {\"height\":\"2rem\"} -->\n<div style=\"height:2rem\" aria-hidden=\"true\" class=\"wp-block-spacer\"></div>\n<!-- /wp:spacer -->\n";

$experimental_intro = <<<'HTML'
<!-- wp:group {"style":{"spacing":{"padding":{"top":"2rem","bottom":"0.5rem"}}},"layout":{"type":"constrained","contentSize":"980px"}} -->
<div class="wp-block-group" style="padding-top:2rem;padding-bottom:0.5rem"><!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.85rem","textTransform":"uppercase","letterSpacing":"0.14em"}},"textColor":"accent-4"} -->
<p class="has-text-align-center has-accent-4-color has-text-color" style="font-size:0.85rem;letter-spacing:0.14em;text-transform:uppercase">Experimental combinations</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"textAlign":"center","level":2,"style":{"typography":{"fontSize":"clamp(1.9rem,4vw,3rem)","lineHeight":"1.08"}}} -->
<h2 class="wp-block-heading has-text-align-center" style="font-size:clamp(1.9rem,4vw,3rem);line-height:1.08">Try K Typewriter inside layouts people actually build.</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.98rem"}}} -->
<p class="has-text-align-center" style="font-size:0.98rem">These are slightly more opinionated compositions that combine the block with columns, pricing cards, buttons, and editorial sections.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
HTML;

$gallery_footer = sprintf(
	<<<'HTML'
<!-- wp:group {"style":{"spacing":{"padding":{"top":"2rem","bottom":"4rem"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding-top:2rem;padding-bottom:4rem"><!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.95rem"}}} -->
<p class="has-text-align-center" style="font-size:0.95rem">Want to compare width reserve and reserved lines more aggressively? The stability examples keep those experiments separate from the starter patterns.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons"><!-- wp:button {"style":{"border":{"radius":"999px"}}} -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="%s" style="border-radius:999px">Go to the stability examples</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->
HTML,
	$lab_url
);

$gallery_content = implode(
	$section_spacer,
	array(
		$gallery_intro,
		$hero['content'],
		$inline['content'],
		$announcement['content'],
		$feature['content'],
		$multilingual['content'],
		$experimental_intro,
		$split_hero['content'],
		$editorial['content'],
		$error_prompt['content'],
		$terminal['content'],
		$gallery_footer,
	)
);

$lab_content = sprintf(
	<<<'HTML'
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"3rem","right":"1.5rem","bottom":"3.5rem","left":"1.5rem"}},"color":{"background":"#f3f4f6","text":"#111827"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-text-color has-background" style="color:#111827;background-color:#f3f4f6;padding-top:3rem;padding-right:1.5rem;padding-bottom:3.5rem;padding-left:1.5rem"><!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.85rem","textTransform":"uppercase","letterSpacing":"0.14em"}}} -->
<p class="has-text-align-center" style="font-size:0.85rem;letter-spacing:0.14em;text-transform:uppercase">K Typewriter stability examples</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(2.2rem,6vw,3.75rem)","lineHeight":"1.05"}}} -->
<h1 class="wp-block-heading has-text-align-center" style="font-size:clamp(2.2rem,6vw,3.75rem);line-height:1.05">Compare settings that keep rotating text steadier on the page.</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1rem"}}} -->
<p class="has-text-align-center" style="font-size:1rem">These examples make width and wrapping changes more obvious, so they live on a separate page from the polished starter patterns.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons"><!-- wp:button {"style":{"border":{"radius":"999px"}}} -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="%s" style="border-radius:999px">Back to the pattern gallery</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->

<!-- wp:spacer {"height":"2rem"} -->
<div style="height:2rem" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:columns -->
<div class="wp-block-columns"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Reserved height: off</h3>
<!-- /wp:heading -->

<!-- wp:imjlk/k-typewriter {"items":["Short","A much longer line that wraps when reserve lines are not helping."],"reserveLines":1,"pauseDelay":1400,"tagName":"p","style":{"typography":{"fontSize":"1.2rem"}}} /--></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Reserved height: on</h3>
<!-- /wp:heading -->

<!-- wp:imjlk/k-typewriter {"items":["Short","A much longer line that wraps when reserve lines are not helping."],"reserveLines":3,"verticalAlign":"middle","pauseDelay":1400,"tagName":"p","style":{"typography":{"fontSize":"1.2rem"}}} /--></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:spacer {"height":"1.5rem"} -->
<div style="height:1.5rem" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:columns -->
<div class="wp-block-columns"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Inline width: auto</h3>
<!-- /wp:heading -->

<!-- wp:group {"style":{"spacing":{"blockGap":"0.5rem"}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"left","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"style":{"typography":{"fontSize":"1.25rem","fontWeight":"700"}}} -->
<p style="font-size:1.25rem;font-weight:700">Built for</p>
<!-- /wp:paragraph -->

<!-- wp:imjlk/k-typewriter {"items":["teams","distributed product teams","global editorial systems"],"inlineLayout":true,"inlineWidthMode":"auto","tagName":"span","style":{"typography":{"fontSize":"1.25rem","fontWeight":"700"}}} /--></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Inline width: measured</h3>
<!-- /wp:heading -->

<!-- wp:group {"style":{"spacing":{"blockGap":"0.5rem"}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"left","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"style":{"typography":{"fontSize":"1.25rem","fontWeight":"700"}}} -->
<p style="font-size:1.25rem;font-weight:700">Built for</p>
<!-- /wp:paragraph -->

<!-- wp:imjlk/k-typewriter {"items":["teams","distributed product teams","global editorial systems"],"inlineLayout":true,"inlineWidthMode":"measure","tagName":"span","style":{"typography":{"fontSize":"1.25rem","fontWeight":"700"}}} /--></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:spacer {"height":"1.5rem"} -->
<div style="height:1.5rem" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:columns -->
<div class="wp-block-columns"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Inline width: 8ch</h3>
<!-- /wp:heading -->

<!-- wp:group {"style":{"spacing":{"blockGap":"0.5rem"}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"left","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"style":{"typography":{"fontSize":"1.15rem","fontWeight":"700"}}} -->
<p style="font-size:1.15rem;font-weight:700">Built for</p>
<!-- /wp:paragraph -->

<!-- wp:imjlk/k-typewriter {"items":["small teams","international editorial systems"],"inlineLayout":true,"inlineWidthMode":"characters","inlineWidthCh":8,"tagName":"span","style":{"typography":{"fontSize":"1.15rem","fontWeight":"700"}}} /--></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Inline width: measured</h3>
<!-- /wp:heading -->

<!-- wp:group {"style":{"spacing":{"blockGap":"0.5rem"}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"left","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"style":{"typography":{"fontSize":"1.15rem","fontWeight":"700"}}} -->
<p style="font-size:1.15rem;font-weight:700">Built for</p>
<!-- /wp:paragraph -->

<!-- wp:imjlk/k-typewriter {"items":["small teams","international editorial systems"],"inlineLayout":true,"inlineWidthMode":"measure","tagName":"span","style":{"typography":{"fontSize":"1.15rem","fontWeight":"700"}}} /--></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->
HTML,
	$gallery_url
);

$gallery_id = $upsert_page( 'k-typewriter-demo', 'K Typewriter Pattern Gallery', $gallery_content );
$lab_id     = $upsert_page( 'k-typewriter-layout-lab', 'K Typewriter Stability Examples', $lab_content );

$demo_css = sprintf(
	'body.page-id-%1$d .wp-block-post-title,
	body.page-id-%2$d .wp-block-post-title { display: none; }
	body.page-id-%1$d main.wp-block-group,
	body.page-id-%2$d main.wp-block-group { margin-top: 0 !important; }
	body.page-id-%1$d .entry-content.alignfull.wp-block-post-content,
	body.page-id-%2$d .entry-content.alignfull.wp-block-post-content { margin-top: 0; }
	body.page-id-%1$d .entry-content > .wp-block-group.alignfull:first-child,
	body.page-id-%2$d .entry-content > .wp-block-group.alignfull:first-child { margin-top: 0 !important; }',
	$gallery_id,
	$lab_id
);

if ( function_exists( 'wp_update_custom_css_post' ) ) {
	wp_update_custom_css_post( $demo_css );
}

update_option( 'blogname', 'K Typewriter Playground Preview' );
update_option( 'blogdescription', 'Explore ready-to-use K Typewriter patterns and a separate stability examples page.' );
update_option( 'show_on_front', 'page' );
update_option( 'page_on_front', (int) $gallery_id );
