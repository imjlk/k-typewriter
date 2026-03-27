<?php
/**
 * Hero headline pattern.
 *
 * @package KTypewriter
 */

return array(
	'slug'         => 'k-typewriter/hero-headline',
	'title'        => __( 'Hero Headline', 'k-typewriter' ),
	'description'  => __( 'A centered hero headline with polished typewriter playback and stable reserved height.', 'k-typewriter' ),
	'categories'   => array( 'k-typewriter' ),
	'blockTypes'   => array( 'imjlk/k-typewriter' ),
	'viewportWidth' => 1200,
	'content'      => <<<'HTML'
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"6rem","right":"1.5rem","bottom":"6rem","left":"1.5rem"}},"color":{"background":"#f7f1df","text":"#18231f"}},"layout":{"type":"constrained","contentSize":"980px"}} -->
<div class="wp-block-group alignfull has-text-color has-background" style="color:#18231f;background-color:#f7f1df;padding-top:6rem;padding-right:1.5rem;padding-bottom:6rem;padding-left:1.5rem"><!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.85rem","textTransform":"uppercase","letterSpacing":"0.14em"}}} -->
<p class="has-text-align-center" style="font-size:0.85rem;letter-spacing:0.14em;text-transform:uppercase">Ready-to-use hero pattern</p>
<!-- /wp:paragraph -->

<!-- wp:imjlk/k-typewriter {"items":["한 글자씩, 리듬 있게.","Animate hero headlines in any language.","Ship polished launch copy in minutes."],"reserveLines":2,"verticalAlign":"middle","startDelay":250,"startDelayMode":"first-start","tagName":"h1","style":{"typography":{"fontSize":"clamp(2.5rem,7vw,5.15rem)","lineHeight":"1.02","textAlign":"center"}}} /-->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1rem"}}} -->
<p class="has-text-align-center" style="font-size:1rem">Use this for landing pages, launches, and high-emphasis hero sections.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
HTML,
);
