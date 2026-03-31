<?php
/**
 * Announcement strip pattern.
 *
 * @package KTypewriter
 */

return array(
	'slug'         => 'k-typewriter/announcement-strip',
	'title'        => __( 'Announcement Strip', 'k-typewriter' ),
	'description'  => __( 'A compact banner for rotating launches, promos, or deadline reminders.', 'k-typewriter' ),
	'categories'   => array( 'k-typewriter' ),
	'blockTypes'   => array( 'imjlk/k-typewriter' ),
	'viewportWidth' => 1200,
	'content'      => <<<'HTML'
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"0.75rem","right":"1rem","bottom":"0.75rem","left":"1rem"}},"border":{"radius":"14px"},"color":{"background":"#111827","text":"#f9fafb"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-text-color has-background" style="color:#f9fafb;background-color:#111827;border-radius:14px;padding-top:0.75rem;padding-right:1rem;padding-bottom:0.75rem;padding-left:1rem"><!-- wp:imjlk/k-typewriter {"items":["Launch week pricing ends Friday.","Now shipping GitHub-based Playground previews.","Pause on hover to let visitors read every message."],"pauseOnHover":true,"deleteDelay":25,"pauseDelay":1500,"tagName":"p","style":{"typography":{"textAlign":"center","fontSize":"1rem","fontWeight":"600"}}} /--></div>
<!-- /wp:group -->
HTML,
);
