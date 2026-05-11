# WordPress 7.0 Release Prep

This note is intentionally kept out of the release package. The production
workflows should stay on the current supported/stable WordPress targets until
WordPress 7.0 is final.

## Current Policy

- Do not update `Tested up to` to `7.0` while WordPress 7.0 is still in RC.
- Do not add RC URLs to the release workflow.
- Use this document as the handoff checklist when WordPress 7.0 is officially
  released.

## Final Release Smoke

Once WordPress 7.0 is final, replace the URL below with the official stable
archive URL if it differs:

```bash
export WP70_CORE_URL="https://wordpress.org/wordpress-7.0.zip"
WP_ENV_PORT=8899 WP_ENV_CORE="$WP70_CORE_URL" pnpm exec wp-env start --update
WP_ENV_PORT=8899 WP_ENV_CORE="$WP70_CORE_URL" pnpm exec wp-env run cli wp core update-db --allow-root
PLAYWRIGHT_BASE_URL=http://localhost:8899 pnpm run test:smoke
WP_ENV_PORT=8899 WP_ENV_CORE="$WP70_CORE_URL" pnpm exec wp-env stop
```

If the smoke test needs the post-upgrade database step in CI, add the
`wp core update-db --allow-root` step next to the temporary 7.0 smoke job.

## Release Update Checklist

1. Confirm WordPress 7.0 final is published.
2. Run the final release smoke test above.
3. Update `readme.txt` `Tested up to` to `7.0` only after the smoke test passes.
4. Run the normal gates:

```bash
pnpm run lint:js
pnpm run lint:css
pnpm run test:unit
pnpm run build
pnpm run plugin-zip
```

5. If needed, add a temporary CI matrix entry for WordPress 7.0 stable, not RC.
6. Tag a patch release only after the WordPress.org package is verified.

## Files To Revisit

- `readme.txt`
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `docs/release-checklist.md`
- `package.json`, only if a permanent `env:start:wp70` helper is still useful
