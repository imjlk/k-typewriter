<?php
/**
 * 404 Error Prompt pattern.
 *
 * @package KTypewriter
 */

return array(
	'slug'         => 'k-typewriter/404-error-prompt',
	'title'        => __( '404 Error Prompt', 'k-typewriter' ),
	'description'  => __( 'A friendly 404 error page prompt that suggests popular destinations.', 'k-typewriter' ),
	'categories'   => array( 'k-typewriter' ),
	'blockTypes'   => array( 'imjlk/k-typewriter' ),
	'viewportWidth' => 1200,
	'content'      => <<<'HTML'
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"5rem","right":"1.5rem","bottom":"5rem","left":"1.5rem"}},"color":{"text":"#111827","background":"#f9fafb"}},"layout":{"type":"constrained","contentSize":"800px"}} -->
<div class="wp-block-group alignfull has-text-color has-background" style="color:#111827;background-color:#f9fafb;padding-top:5rem;padding-right:1.5rem;padding-bottom:5rem;padding-left:1.5rem"><!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(5rem, 12vw, 10rem)","fontWeight":"800"}}} -->
<h1 class="wp-block-heading has-text-align-center" style="font-size:clamp(5rem, 12vw, 10rem);font-weight:800">404</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.25rem"},"color":{"text":"#4b5563"}}} -->
<p class="has-text-align-center has-text-color" style="color:#4b5563;font-size:1.25rem">Looks like you've ventured into the unknown.</p>
<!-- /wp:paragraph -->

<!-- wp:spacer {"height":"2rem"} -->
<div style="height:2rem" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:group {"style":{"spacing":{"blockGap":"0.5rem"}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"center","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"style":{"typography":{"fontSize":"1.5rem","fontWeight":"600"}}} -->
<p style="font-size:1.5rem;font-weight:600">Did you mean to visit</p>
<!-- /wp:paragraph -->

<!-- wp:imjlk/k-typewriter {"items":["the homepage?","our latest blog post?","the contact page?","our pricing plans?"],"inlineLayout":true,"inlineWidthMode":"measure","tagName":"span","reserveLines":1,"pauseOnHover":true,"typeDelay":50,"deleteDelay":30,"pauseDelay":1500,"style":{"color":{"text":"#3b82f6"},"typography":{"fontSize":"1.5rem","fontWeight":"600"}}} /--></div>
<!-- /wp:group -->

<!-- wp:spacer {"height":"2rem"} -->
<div style="height:2rem" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="/">Back to Home</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->
HTML,
);
