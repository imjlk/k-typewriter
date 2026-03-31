=== K Typewriter ===
Contributors: imjlk
Tags: block, typewriter, headline, hero, multilingual
Requires at least: 6.6
Tested up to: 6.9
Requires PHP: 8.0
Stable tag: 1.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Animate headlines, notices, and hero copy with a polished typewriter block that works beautifully with multilingual text.

== Description ==

K Typewriter is a dynamic block for WordPress sites that need expressive text motion without sacrificing accessibility or graceful fallbacks.

Its typing playback is built on top of UniTyper by Beaver Coding:
https://github.com/beavercoding2022/uni-typer

Use it for:

* Homepage hero copy
* Product callouts
* Announcement banners
* Event pages
* Multilingual headline rotations
* Inline keyword rotators inside rows and grouped layouts

Key features:

* Multiple messages with one message per line
* Configurable typing, deleting, and pause timing
* Optional start delay with first-start, every-cycle, and every-reentry timing modes
* Optional looping, viewport start, and replay-on-re-entry behavior
* Cursor controls for visibility, animation mode, thickness, height, and offset
* First-message static fallback by default, with an optional custom fallback override
* Auto-generated non-visual summary with optional override text
* Inline layout support with width reservation in `ch` or measured longest-message mode
* Text direction controls for `auto`, `ltr`, and `rtl`
* Start animation only when the block enters the viewport
* Dynamic rendering for SEO-friendly first paint and no-JavaScript fallback
* Reduced-motion support for visitors who prefer less animation
* Semantic tag selection for `p`, `div`, `span`, `h1`-`h6`, `strong`, `em`, `small`, and `mark`
* Support for theme typography, spacing, and color tools
* Bundled patterns for hero headlines, inline keyword rotators, announcement strips, feature spotlights, multilingual sections, split launch heroes, editorial leads, 404 prompts, and terminal-style loading sequences

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/k-typewriter` directory, or install the plugin through the WordPress plugins screen.
2. Activate the plugin through the `Plugins` screen in WordPress.
3. Open the block editor and insert the `K Typewriter` block.
4. Add one message per line in the block settings sidebar.
5. Adjust timing, cursor, inline layout, width reservation, loop, and viewport options to match your design.

== Frequently Asked Questions ==

= Does it work without JavaScript? =

Yes. By default the first message is rendered on the server so visitors still see meaningful content even if JavaScript does not run. You can also override that visible fallback with a custom fallback message.

= Is reduced motion supported? =

Yes. Visitors with `prefers-reduced-motion` enabled will see the visible fallback only, without animation.

= Can I control the non-visual summary for assistive technology? =

Yes. Leave the summary on `Auto-generated` to build a locale-aware summary from every message, or switch the source to `Custom override` and provide your own summary for assistive technology.

= Can I use Korean and English together? =

Yes. The block is designed for multilingual messaging and works well with Korean, English, Arabic, and mixed-language headlines. Use `Text direction` when you need explicit `ltr` or `rtl` behavior.

= Can I change the HTML tag? =

Yes. Choose between `p`, `div`, `span`, `h1`-`h6`, `strong`, `em`, `small`, and `mark` from the block settings. Use `h1` only when the block is the primary page heading.

= Can I keep inline layouts stable while the text changes? =

Yes. Turn on `Inline layout` and use `Inline width reserve` with either `Characters (ch)` or `Measure longest message` to keep inline keyword rotators and row layouts steadier.

= Does it support a WordPress Playground preview? =

Yes. The plugin includes a WordPress.org Playground blueprint, so maintainers can enable a one-click preview from the plugin's Advanced view after deployment.

== Screenshots ==

1. Editing multiple messages and animation timing in the block sidebar.
2. A front-end hero section using K Typewriter with multilingual text.
3. Reduced-motion mode preserving the first message as a static fallback.

== Changelog ==

= 1.0.0 =

* First public release.
* Added a dynamic, Interactivity API-powered typewriter block.
* Added viewport-aware animation start, replay-on-re-entry, reduced-motion support, and graceful no-JS fallback.
* Added inline layout, width reservation, text direction controls, and detailed cursor controls.
* Added bundled starter and advanced patterns, WordPress Playground demos, packaging, local `wp-env` tooling, smoke tests, and release workflows.

== Upgrade Notice ==

= 1.0.0 =

First public release of K Typewriter.
