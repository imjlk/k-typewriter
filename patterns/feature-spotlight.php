<?php
/**
 * Feature spotlight pattern.
 *
 * @package KTypewriter
 */

return array(
	'slug'          => 'k-typewriter/feature-spotlight',
	'title'         => __( 'Feature Spotlight', 'k-typewriter' ),
	'description'   => __( 'A practical section intro pattern for feature pages, launch sections, and campaign callouts.', 'k-typewriter' ),
	'categories'    => array( 'k-typewriter' ),
	'blockTypes'    => array( 'imjlk/k-typewriter' ),
	'viewportWidth' => 1200,
	'content'       => <<<'HTML'
<!-- wp:group {"style":{"spacing":{"padding":{"top":"3.5rem","right":"1.5rem","bottom":"3.5rem","left":"1.5rem"}},"border":{"radius":"24px"},"color":{"background":"#ffffff","text":"#111827"}},"layout":{"type":"constrained","contentSize":"960px"}} -->
<div class="wp-block-group has-text-color has-background" style="color:#111827;background-color:#ffffff;border-radius:24px;padding-top:3.5rem;padding-right:1.5rem;padding-bottom:3.5rem;padding-left:1.5rem"><!-- wp:paragraph {"style":{"typography":{"fontSize":"0.85rem","textTransform":"uppercase","letterSpacing":"0.12em"}},"textColor":"contrast"} -->
<p class="has-contrast-color has-text-color" style="font-size:0.85rem;letter-spacing:0.12em;text-transform:uppercase">Feature spotlight</p>
<!-- /wp:paragraph -->

<!-- wp:imjlk/k-typewriter {"items":["Announce one feature clearly.","Rotate benefit-led headlines.","Keep the section steady while copy changes."],"reserveLines":2,"verticalAlign":"middle","pauseOnHover":true,"tagName":"h2","style":{"typography":{"fontSize":"clamp(2rem,4vw,3rem)","lineHeight":"1.08","textAlign":"left"}}} /-->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem"}}} -->
<p style="font-size:1rem">Use this pattern for campaign sections, feature launches, and landing-page midpoints where one animated line should carry the section.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"style":{"border":{"radius":"999px"}}} -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="#" style="border-radius:999px">Primary action</a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-outline","style":{"border":{"radius":"999px"}}} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="#" style="border-radius:999px">Secondary action</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->
HTML,
);
