# Release Checklist

## Local

1. Start a clean WordPress environment.
2. Activate `K Typewriter`.
3. Insert the block into a new page.
4. Change messages, speeds, cursor, and viewport start options.
5. Publish the page and confirm there is no invalid block warning.
6. Open the front-end page and confirm:
   - The first message is present in initial HTML.
   - The text animates when JavaScript is enabled.
   - Reduced-motion mode keeps the first message static.
   - No-JS mode keeps the first message static.

## Compatibility

1. Verify the plugin still activates on WordPress 6.6 / PHP 8.0.
2. Verify a minimal smoke test on the latest stable WordPress release.

## Packaging

1. Confirm `.wordpress-org/` contains:
   - `icon-128x128.png`
   - `icon-256x256.png`
   - `banner-772x250.png`
   - `banner-1544x500.png`
   - `blueprints/blueprint.json`
   - `blueprints/github-playground.json`
   - `screenshot-1.png`
   - `screenshot-2.png`
   - `screenshot-3.png`
2. Confirm `readme.txt` screenshot count matches the actual files.
3. Confirm `languages/k-typewriter.pot` exists and reflects the latest strings.
4. Confirm `.wordpress-org/blueprints/blueprint.json` still matches the current plugin slug and demo messaging.
5. Confirm `.wordpress-org/blueprints/github-playground.json` points at the correct GitHub repo/ref before sharing a branch preview link.

## GitHub Actions

1. Confirm the tag follows the `v*` pattern.
2. Confirm the CI and release workflows upload the tested `k-typewriter.zip` artifact.
3. Confirm the GitHub release attaches the same tested zip that was built before deploy.
4. Confirm the WordPress.org deploy step is enabled only when the plugin slug exists by setting `WPORG_DEPLOY_ENABLED=true`.
5. Confirm `SVN_USERNAME` and `SVN_PASSWORD` are set before enabling WordPress.org deploy.
6. Confirm the WordPress.org deploy step runs only after the smoke checks pass.
7. After the first WordPress.org deploy, confirm the plugin Advanced view has Playground preview set to `public`.
