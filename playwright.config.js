const { defineConfig } = require( '@playwright/test' );

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8888';
const browserChannel = process.env.PLAYWRIGHT_BROWSER_CHANNEL || undefined;

module.exports = defineConfig( {
	testDir: './tests/smoke',
	timeout: 120000,
	reporter: [
		[ 'line' ],
		[
			'html',
			{
				open: 'never',
			},
		],
	],
	expect: {
		timeout: 10000,
	},
	use: {
		baseURL,
		channel: browserChannel,
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure',
	},
} );
