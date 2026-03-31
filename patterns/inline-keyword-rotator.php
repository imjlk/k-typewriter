<?php
/**
 * Inline keyword rotator pattern.
 *
 * @package KTypewriter
 */

return array(
	'slug'         => 'k-typewriter/inline-keyword-rotator',
	'title'        => __( 'Inline Keyword Rotator', 'k-typewriter' ),
	'description'  => __( 'A row-based inline layout that rotates compact keywords without widening the whole line.', 'k-typewriter' ),
	'categories'   => array( 'k-typewriter' ),
	'blockTypes'   => array( 'imjlk/k-typewriter' ),
	'viewportWidth' => 1200,
	'content'      => <<<'HTML'
<!-- wp:group {"style":{"spacing":{"padding":{"top":"1rem","bottom":"1rem","left":"0.75rem","right":"0.75rem"}},"color":{"background":"#ffffff","text":"#111827"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group has-text-color has-background" style="color:#111827;background-color:#ffffff;padding-top:1rem;padding-right:0.75rem;padding-bottom:1rem;padding-left:0.75rem"><!-- wp:group {"style":{"spacing":{"blockGap":"0.4rem"}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"center","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"style":{"typography":{"fontSize":"clamp(1.5rem,4vw,2.4rem)","fontWeight":"700"}}} -->
<p style="font-size:clamp(1.5rem,4vw,2.4rem);font-weight:700">Built for</p>
<!-- /wp:paragraph -->

<!-- wp:imjlk/k-typewriter {"items":["design teams","product launches","global brands"],"inlineLayout":true,"inlineWidthMode":"measure","tagName":"span","reserveLines":1,"pauseOnHover":true,"style":{"typography":{"fontSize":"clamp(1.5rem,4vw,2.4rem)","fontWeight":"700"}}} /--></div>
<!-- /wp:group -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.95rem"}}} -->
<p class="has-text-align-center" style="font-size:0.95rem">Great for row layouts where a fixed phrase and rotating keyword should stay together without stretching the whole line.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
HTML,
);
