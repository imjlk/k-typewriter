const { defineConfig } = require( '@playwright/test' );

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8888';

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
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure',
	},
} );
