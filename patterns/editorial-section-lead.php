<?php
/**
 * Editorial section lead pattern.
 *
 * @package KTypewriter
 */

return array(
	'slug'          => 'k-typewriter/editorial-section-lead',
	'title'         => __( 'Editorial Section Lead', 'k-typewriter' ),
	'description'   => __( 'A section intro pattern for stories, resources, and long-form editorial pages.', 'k-typewriter' ),
	'categories'    => array( 'k-typewriter' ),
	'blockTypes'    => array( 'imjlk/k-typewriter' ),
	'viewportWidth' => 1200,
	'content'       => <<<'HTML'
<!-- wp:group {"style":{"spacing":{"padding":{"top":"3rem","right":"1.5rem","bottom":"3rem","left":"1.5rem"}},"border":{"radius":"24px"},"color":{"background":"#f6efe5","text":"#1f2937"}},"layout":{"type":"constrained","contentSize":"900px"}} -->
<div class="wp-block-group has-text-color has-background" style="color:#1f2937;background-color:#f6efe5;border-radius:24px;padding-top:3rem;padding-right:1.5rem;padding-bottom:3rem;padding-left:1.5rem"><!-- wp:paragraph {"style":{"typography":{"fontSize":"0.85rem","textTransform":"uppercase","letterSpacing":"0.12em"}}} -->
<p style="font-size:0.85rem;letter-spacing:0.12em;text-transform:uppercase">Experimental combination</p>
<!-- /wp:paragraph -->

<!-- wp:imjlk/k-typewriter {"items":["Tell one story in a more editorial rhythm.","Swap section framing without reworking the layout.","Keep the motion subtle and the structure readable."],"reserveLines":2,"verticalAlign":"top","pauseOnHover":true,"showCursor":false,"tagName":"h2","style":{"typography":{"fontSize":"clamp(2rem,4vw,3rem)","lineHeight":"1.08","textAlign":"left"}}} /-->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem"}}} -->
<p style="font-size:1rem">This works well for case studies, blog landing pages, resource hubs, and feature sections where animated language should feel supportive rather than flashy.</p>
<!-- /wp:paragraph -->

<!-- wp:separator {"backgroundColor":"accent-6"} -->
<hr class="wp-block-separator has-text-color has-accent-6-color has-alpha-channel-opacity has-accent-6-background-color has-background"/>
<!-- /wp:separator -->

<!-- wp:columns -->
<div class="wp-block-columns"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem","fontWeight":"700"}}} -->
<p style="font-size:0.9rem;font-weight:700">Why try it</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.95rem"}}} -->
<p style="font-size:0.95rem">It gives long-form pages a living intro without turning the whole section into a hero.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem","fontWeight":"700"}}} -->
<p style="font-size:0.9rem;font-weight:700">Best use</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.95rem"}}} -->
<p style="font-size:0.95rem">Editorial intros, case-study leads, or campaign sections with more supporting copy below.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->
HTML,
);
