# WordPress 7.0 Release Verification

WordPress 7.0 is a stable release, so compatibility coverage now belongs in the
normal CI and release workflows rather than in a separate RC-only checklist.
This note stays out of the WordPress.org release package and records the manual
commands for rechecking the 7.0 target locally.

## Local WordPress 7.0 Smoke

```bash
WP_ENV_PORT=8899 WP_ENV_CORE=https://wordpress.org/wordpress-7.0.zip pnpm exec wp-env start --update
WP_ENV_PORT=8899 WP_ENV_CORE=https://wordpress.org/wordpress-7.0.zip pnpm exec wp-env run cli wp core update-db --allow-root
PLAYWRIGHT_BASE_URL=http://localhost:8899 pnpm run test:smoke
WP_ENV_PORT=8899 WP_ENV_CORE=https://wordpress.org/wordpress-7.0.zip pnpm exec wp-env stop
```

## Release Expectations

1. `readme.txt` should advertise `Tested up to: 7.0`.
2. CI should smoke test both the minimum supported WordPress target and
   WordPress 7.0 stable.
3. The release workflow should pass both smoke targets before the WordPress.org
   SVN deploy step.
4. The GitHub Actions JavaScript actions should use Node.js 24-compatible
   action runtimes.
5. The release tag should bump the plugin version so WordPress.org users receive
   the compatibility update.
