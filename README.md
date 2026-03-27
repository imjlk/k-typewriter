# K Typewriter

WordPress block plugin for multilingual typewriter headlines, hero copy, and announcements.

## Local Development

```bash
pnpm install
pnpm run build
pnpm run env:start
```

The default local site is `http://localhost:8888`.

If the port is already in use, override it for that shell session:

```bash
WP_ENV_PORT=8898 pnpm run env:start
PLAYWRIGHT_BASE_URL=http://localhost:8898 pnpm run test:smoke
WP_ENV_PORT=8898 pnpm run env:stop
```

## Quality Gates

```bash
pnpm run lint:js
pnpm run lint:css
pnpm run build
pnpm run test:smoke
php -l k-typewriter.php
php -l includes/class-k-typewriter-plugin.php
```

## Release Flow

1. Run the local quality gates.
2. Confirm the WordPress.org assets in `.wordpress-org/` are up to date.
3. Regenerate the translation template with `pnpm run make:pot`.
4. Tag the release with `v*`.
5. Let GitHub Actions build the release zip, run smoke checks, upload the tested zip artifact, deploy to WordPress.org, and attach that same zip to the GitHub release.
6. After the first deploy, open the plugin's WordPress.org Advanced view and switch the Playground preview to `public` if you want visitors to see the one-click preview button.

## Manual Verification

See [docs/release-checklist.md](./docs/release-checklist.md).

## Playground Preview

WordPress.org Playground preview support is configured through `.wordpress-org/blueprints/blueprint.json`. The deploy workflow syncs `.wordpress-org/` into the WordPress.org assets directory, so this file is published as `assets/blueprints/blueprint.json`. The blueprint activates `K Typewriter`, creates a published demo page, and makes that page the site's front page so the preview button opens directly to a working hero example.

For direct GitHub-based previews, use `.wordpress-org/blueprints/github-playground.json`. That blueprint installs the plugin from the GitHub repository with Playground's `git:directory` resource, activates it, creates the same demo page, and opens the site on the published front page.
