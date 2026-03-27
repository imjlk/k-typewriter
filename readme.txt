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

Use it for:

* Homepage hero copy
* Product callouts
* Announcement banners
* Event pages
* Multilingual headline rotations

Key features:

* Multiple messages with one message per line
* Configurable typing, deleting, and pause timing
* Optional start delay with first-start, every-cycle, and every-reentry timing modes
* Optional looping and cursor display
* First-message static fallback by default, with an optional custom fallback override
* Auto-generated non-visual summary with optional override text
* Start animation only when the block enters the viewport
* Dynamic rendering for SEO-friendly first paint and no-JavaScript fallback
* Reduced-motion support for visitors who prefer less animation
* Semantic tag selection for `p`, `div`, `span`, `h1`-`h6`, `strong`, `em`, `small`, and `mark`
* Support for theme typography, spacing, and color tools

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/k-typewriter` directory, or install the plugin through the WordPress plugins screen.
2. Activate the plugin through the `Plugins` screen in WordPress.
3. Open the block editor and insert the `K Typewriter` block.
4. Add one message per line in the block settings sidebar.
5. Adjust timing, cursor, loop, and viewport options to match your design.

== Frequently Asked Questions ==

= Does it work without JavaScript? =

Yes. By default the first message is rendered on the server so visitors still see meaningful content even if JavaScript does not run. You can also override that visible fallback with a custom fallback message.

= Is reduced motion supported? =

Yes. Visitors with `prefers-reduced-motion` enabled will see the visible fallback only, without animation.

= Can I control the non-visual summary for assistive technology? =

Yes. Leave the `SEO summary text` field empty to auto-generate a locale-aware summary from every message, or provide your own summary override for assistive technology.

= Can I use Korean and English together? =

Yes. The block is designed for multilingual messaging and works well with Korean, English, and mixed-language headlines.

= Can I change the HTML tag? =

Yes. Choose between `p`, `div`, `span`, `h1`-`h6`, `strong`, `em`, `small`, and `mark` from the block settings. Use `h1` only when the block is the primary page heading.

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
* Added viewport-aware animation start, reduced-motion support, and graceful no-JS fallback.
* Added packaging, local `wp-env` tooling, smoke tests, and release workflows.

== Upgrade Notice ==

= 1.0.0 =

First public release of K Typewriter.
