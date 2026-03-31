# K Typewriter

Multilingual typewriter block plugin for WordPress hero headlines, notices, and announcement copy.

[한국어 문서](./readme-ko_KR.md) · [WordPress.org readme](./readme.txt) · [Release checklist](./docs/release-checklist.md)

## Overview

K Typewriter ships as a dynamic Gutenberg block with server-rendered fallback content, Interactivity API playback, and multilingual typing support.

Typing playback is built on top of [UniTyper](https://github.com/beavercoding2022/uni-typer) by Beaver Coding.

Highlights:

- Dynamic rendering with meaningful first paint text
- First-message no-JS fallback, plus optional custom fallback override
- Optional non-visual summary text for assistive technology
- Hangul-aware typing playback
- Start delay controls for first start, every cycle, or every re-entry
- Start when visible, with optional replay on re-entry
- Inline layout with width reservation using `ch` or measured longest-message mode
- Text direction controls for `auto`, `ltr`, and `rtl`
- Cursor controls for animation mode, thickness, height, and offsets
- Semantic tag selection from `p`, `div`, `span`, `h1`-`h6`, `strong`, `em`, `small`, and `mark`
- Support for theme typography, spacing, and color tools

## Ready-to-use Patterns

The plugin now ships starter block patterns so the block is useful immediately after activation.

- `Hero Headline`: a centered hero section with reserved lines and polished headline motion
- `Inline Keyword Rotator`: a row-based inline example that pairs fixed copy with `inline layout + measure`
- `Announcement Strip`: a compact banner for launches, reminders, and promo messages
- `Feature Spotlight`: a practical mid-page section intro with CTA buttons
- `Multilingual Spotlight`: a showcase section for Korean, English, and Arabic messaging
- `Split Launch Hero`: a left-aligned product-launch hero with supporting content
- `Editorial Section Lead`: a practical section intro for case studies and resource hubs
- `404 Error Prompt`: a friendly recovery pattern with an inline rotating destination
- `Terminal Simulation`: a developer-focused terminal loading sequence

For more experimental width and layout stability comparisons, use the Playground `Stability Examples` page instead of the starter patterns.

## Playground Preview

WordPress.org preview support is configured through [`.wordpress-org/blueprints/blueprint.json`](./.wordpress-org/blueprints/blueprint.json). After the first WordPress.org deploy, maintainers can enable the public preview button from the plugin's Advanced view.

For direct GitHub-based previews, use [`.wordpress-org/blueprints/github-playground.json`](./.wordpress-org/blueprints/github-playground.json).

- Raw blueprint:
  [github-playground.json](https://raw.githubusercontent.com/imjlk/k-typewriter/main/.wordpress-org/blueprints/github-playground.json)
- Open in Playground:
  [WordPress Playground](https://playground.wordpress.net/?blueprint-url=https%3A%2F%2Fraw.githubusercontent.com%2Fimjlk%2Fk-typewriter%2Fmain%2F.wordpress-org%2Fblueprints%2Fgithub-playground.json)

## Local Development

```bash
pnpm install
pnpm run build
pnpm run env:start
```

The default local site is `http://localhost:8888`.

If the port is already in use:

```bash
WP_ENV_PORT=8898 pnpm run env:start
PLAYWRIGHT_BASE_URL=http://localhost:8898 pnpm run test:smoke
WP_ENV_PORT=8898 pnpm run env:stop
```

## Quality Gates

```bash
pnpm run lint:js
pnpm run lint:css
pnpm run test:unit
pnpm run build
pnpm run test:smoke
php -l k-typewriter.php
php -l includes/class-k-typewriter-plugin.php
```

Notes:

- `test:unit` covers the typing engine and shared attribute helpers.
- `test:smoke` exercises the editor and front-end flow, but it still depends on the exact Gutenberg UI shape of the local WordPress instance.
- For local Playground demos, use `http://127.0.0.1:9410` to avoid host-mismatch issues between `localhost` and `127.0.0.1`.

## Localization

The plugin keeps translation assets in [`languages/`](./languages).

- Template: `k-typewriter.pot`
- Bundled Korean translations: `k-typewriter-ko_KR.po`, `k-typewriter-ko_KR.mo`
- Bundled block editor JSON translations for Korean are committed for direct installs and zip builds

For WordPress.org, approved translations from `translate.wordpress.org` will eventually be delivered as language packs and may take precedence over bundled translations.

## Release Flow

1. Run the quality gates.
2. Confirm `.wordpress-org/` assets and blueprints are up to date.
3. Regenerate the translation template with `pnpm run make:pot`.
4. Regenerate language assets if translations changed.
5. Tag the release with `v*`.
6. Let GitHub Actions build the tested zip with the 10up build-zip action and attach it to the GitHub release.
7. Enable WordPress.org deployment only after the plugin slug exists by setting `WPORG_DEPLOY_ENABLED=true` and adding `SVN_USERNAME` / `SVN_PASSWORD`.
8. After the first deploy, enable the public Playground preview from the WordPress.org Advanced view if desired.
