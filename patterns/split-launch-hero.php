<?php
/**
 * Split launch hero pattern.
 *
 * @package KTypewriter
 */

return array(
	'slug'          => 'k-typewriter/split-launch-hero',
	'title'         => __( 'Split Launch Hero', 'k-typewriter' ),
	'description'   => __( 'A left-aligned hero with supporting launch details and calls to action.', 'k-typewriter' ),
	'categories'    => array( 'k-typewriter' ),
	'blockTypes'    => array( 'imjlk/k-typewriter' ),
	'viewportWidth' => 1200,
	'content'       => <<<'HTML'
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"5rem","right":"1.5rem","bottom":"5rem","left":"1.5rem"}},"color":{"background":"#0f172a","text":"#f8fafc"}},"layout":{"type":"constrained","contentSize":"1120px"}} -->
<div class="wp-block-group alignfull has-text-color has-background" style="color:#f8fafc;background-color:#0f172a;padding-top:5rem;padding-right:1.5rem;padding-bottom:5rem;padding-left:1.5rem"><!-- wp:columns {"verticalAlignment":"center","style":{"spacing":{"blockGap":{"top":"2rem","left":"3rem"}}}} -->
<div class="wp-block-columns are-vertically-aligned-center"><!-- wp:column {"verticalAlignment":"center","width":"62%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:62%"><!-- wp:paragraph {"style":{"typography":{"fontSize":"0.85rem","textTransform":"uppercase","letterSpacing":"0.14em"}},"textColor":"accent-4"} -->
<p class="has-accent-4-color has-text-color" style="font-size:0.85rem;letter-spacing:0.14em;text-transform:uppercase">Experimental combination</p>
<!-- /wp:paragraph -->

<!-- wp:imjlk/k-typewriter {"items":["Launch pages that feel tailored to your theme.","Swap multilingual hero copy without layout shock.","Keep the first paint readable, even before animation starts."],"reserveLines":2,"verticalAlign":"middle","startDelay":300,"startDelayMode":"first-start","tagName":"h1","style":{"typography":{"fontSize":"clamp(2.5rem,6vw,4.8rem)","lineHeight":"1.02","textAlign":"left"}}} /-->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.05rem"}},"textColor":"accent-5"} -->
<p class="has-accent-5-color has-text-color" style="font-size:1.05rem">A practical hero pattern for launches, product reveal pages, and homepages where animated copy needs to sit beside real supporting content.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"style":{"border":{"radius":"999px"},"color":{"background":"#f8fafc","text":"#0f172a"}},"textColor":"contrast","backgroundColor":"base"} -->
<div class="wp-block-button"><a class="wp-block-button__link has-contrast-color has-text-color has-base-background-color has-background wp-element-button" href="#" style="border-radius:999px;color:#0f172a;background-color:#f8fafc">Start with this layout</a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-outline","style":{"border":{"radius":"999px"},"color":{"text":"#f8fafc"}},"textColor":"base"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-base-color has-text-color wp-element-button" href="#" style="border-radius:999px;color:#f8fafc">View documentation</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"center","width":"38%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:38%"><!-- wp:paragraph {"style":{"typography":{"fontSize":"0.82rem","textTransform":"uppercase","letterSpacing":"0.14em"}},"textColor":"accent-4"} -->
<p class="has-accent-4-color has-text-color" style="font-size:0.82rem;letter-spacing:0.14em;text-transform:uppercase">Supporting notes</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4,"style":{"typography":{"fontSize":"1.05rem"}}} -->
<h4 class="wp-block-heading" style="font-size:1.05rem">Why this combo works</h4>
<!-- /wp:heading -->

<!-- wp:list {"className":"is-style-checklist","style":{"spacing":{"blockGap":"0.6rem"}}} -->
<ul class="is-style-checklist"><li>Reserve lines keeps the hero from bouncing as copy changes.</li><li>Left alignment shows the block can live inside richer launch layouts.</li><li>Buttons and helper copy prove the typewriter can anchor a real hero, not only a demo headline.</li></ul>
<!-- /wp:list --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->
HTML,
);
