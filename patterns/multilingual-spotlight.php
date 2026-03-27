<?php
/**
 * Multilingual spotlight pattern.
 *
 * @package KTypewriter
 */

return array(
	'slug'         => 'k-typewriter/multilingual-spotlight',
	'title'        => __( 'Multilingual Spotlight', 'k-typewriter' ),
	'description'  => __( 'A showcase pattern for Korean, English, and Arabic messaging in one polished section.', 'k-typewriter' ),
	'categories'   => array( 'k-typewriter' ),
	'blockTypes'   => array( 'imjlk/k-typewriter' ),
	'viewportWidth' => 1200,
	'content'      => <<<'HTML'
<!-- wp:group {"style":{"spacing":{"padding":{"top":"3rem","right":"1.5rem","bottom":"3rem","left":"1.5rem"}},"color":{"background":"#eef2ff","text":"#18231f"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group has-text-color has-background" style="color:#18231f;background-color:#eef2ff;padding-top:3rem;padding-right:1.5rem;padding-bottom:3rem;padding-left:1.5rem"><!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.85rem","textTransform":"uppercase","letterSpacing":"0.12em"}}} -->
<p class="has-text-align-center" style="font-size:0.85rem;letter-spacing:0.12em;text-transform:uppercase">Multilingual spotlight</p>
<!-- /wp:paragraph -->

<!-- wp:imjlk/k-typewriter {"items":["한 글자씩, 리듬 있게.","Animate headlines in any language.","نص متحرك بإيقاع واضح."],"reserveLines":2,"verticalAlign":"middle","inlineLayout":false,"textDirection":"auto","tagName":"h2","style":{"typography":{"fontSize":"clamp(2.1rem,5vw,3.5rem)","lineHeight":"1.08","textAlign":"center"}}} /-->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1rem"}}} -->
<p class="has-text-align-center" style="font-size:1rem">Use this when you want one animated statement area to demonstrate multilingual support without changing the surrounding layout.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
HTML,
);
