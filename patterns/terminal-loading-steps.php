<?php
/**
 * Terminal loading simulation pattern.
 *
 * @package KTypewriter
 */

return array(
	'slug'         => 'k-typewriter/terminal-loading-steps',
	'title'        => __( 'Terminal Simulation', 'k-typewriter' ),
	'description'  => __( 'A developer-focused terminal animation for SaaS or IT websites.', 'k-typewriter' ),
	'categories'   => array( 'k-typewriter' ),
	'blockTypes'   => array( 'imjlk/k-typewriter' ),
	'viewportWidth' => 1200,
	'content'      => <<<'HTML'
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"6rem","right":"2rem","bottom":"6rem","left":"2rem"},"margin":{"top":"0","bottom":"0"}},"color":{"background":"#0d1117","text":"#3fb950"}},"layout":{"type":"constrained","contentSize":"800px"}} -->
<div class="wp-block-group alignfull has-text-color has-background" style="color:#3fb950;background-color:#0d1117;margin-top:0;margin-bottom:0;padding-top:6rem;padding-right:2rem;padding-bottom:6rem;padding-left:2rem"><!-- wp:imjlk/k-typewriter {"items":["> Loading core modules...","> Verifying transport security...","> Syncing the production cache...","> All services are ready."],"transitionMode":"restart","typeDelay":40,"pauseDelay":800,"loop":false,"keepCursorAnimationOnComplete":true,"startOnView":true,"replayOnReentry":true,"cursorWidth":0.24,"tagName":"p","style":{"typography":{"fontSize":"1.5rem","lineHeight":"1.5"}}} /--></div>
<!-- /wp:group -->
HTML,
);
