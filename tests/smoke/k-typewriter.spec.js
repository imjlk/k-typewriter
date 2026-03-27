const { expect, test } = require( '@playwright/test' );

const FIRST_MESSAGE = '안녕하세요, 세계';

async function login( page ) {
	await page.goto( '/wp-login.php' );

	if ( page.url().includes( '/wp-admin/' ) ) {
		return;
	}

	await page.locator( '#user_login' ).fill( 'admin' );
	await page.locator( '#user_pass' ).fill( 'password' );
	await page.getByRole( 'button', { name: 'Log In' } ).click();
	await page.waitForURL( /\/wp-admin\//u );
}

async function dismissEditorOverlays( page ) {
	const dialogCloseButton = page.getByRole( 'button', { name: 'Close' } );

	if ( ( await dialogCloseButton.count() ) > 0 ) {
		await dialogCloseButton.first().click();
	}

	const welcomeGuideCloseButton = page.getByRole( 'button', {
		name: 'Close dialog',
	} );

	if ( ( await welcomeGuideCloseButton.count() ) > 0 ) {
		await welcomeGuideCloseButton.first().click();
	}
}

async function publishPage( page ) {
	const publishButtons = page.getByRole( 'button', { name: /^Publish$/u } );
	const publishedViewLink = page.getByRole( 'link', {
		name: /^View Page$/u,
	} );

	await publishButtons.first().click();
	await publishButtons.last().click();
	await expect( publishedViewLink.first() ).toBeVisible();
}

async function expectEditorPreviewToChange( locator ) {
	await expect( locator ).toBeVisible();

	const initialValue = ( await locator.textContent() )?.trim();

	await expect
		.poll(
			async () => {
				const value = ( await locator.textContent() )?.trim();

				return Boolean( value && value !== initialValue );
			},
			{
				timeout: 5000,
			}
		)
		.toBe( true );

	return initialValue;
}

function getEditorPostIdFromUrl( page ) {
	const editorUrl = new URL( page.url() );

	return editorUrl.searchParams.get( 'post' );
}

async function getPublishedPostId( page ) {
	const postIdFromUrl = getEditorPostIdFromUrl( page );

	if ( postIdFromUrl ) {
		return postIdFromUrl;
	}

	const postIdFromStore = await page.evaluate( () => {
		return window.wp?.data
			?.select( 'core/editor' )
			?.getCurrentPostId?.()
			?.toString?.();
	} );

	return postIdFromStore ?? '';
}

async function getPublishedPageUrl( page ) {
	const pageAddressField = page.getByRole( 'textbox', {
		name: 'Page address',
	} );

	if ( ( await pageAddressField.count() ) > 0 ) {
		const fieldValue = ( await pageAddressField.inputValue() ).trim();

		if ( fieldValue ) {
			return fieldValue;
		}
	}

	const viewPageLinks = page.getByRole( 'link', {
		name: /^View Page$/u,
	} );
	const linkCount = await viewPageLinks.count();

	if ( linkCount > 0 ) {
		return (
			( await viewPageLinks
				.nth( linkCount - 1 )
				.getAttribute( 'href' ) ) ?? ''
		).trim();
	}

	return '';
}

function buildFrontEndUrl( postId, publishedPageUrl ) {
	const baseUrl =
		publishedPageUrl ||
		process.env.PLAYWRIGHT_BASE_URL ||
		'http://localhost:8888';
	const siteUrl = new URL( baseUrl );

	siteUrl.pathname = '/';
	siteUrl.search = '';
	siteUrl.searchParams.set( 'page_id', postId );

	return siteUrl.toString();
}

async function attachDebugArtifacts(
	testInfo,
	{ page, viewPageUrl, frontEndPage }
) {
	const attachments = [
		`editorUrl: ${ page?.url?.() ?? '' }`,
		`viewPageUrl: ${ viewPageUrl ?? '' }`,
		`frontEndUrl: ${ frontEndPage?.url?.() ?? '' }`,
	].join( '\n' );

	await testInfo.attach( 'debug-urls.txt', {
		body: Buffer.from( attachments ),
		contentType: 'text/plain',
	} );

	if ( page ) {
		try {
			await testInfo.attach( 'editor-content.html', {
				body: Buffer.from( await page.content() ),
				contentType: 'text/html',
			} );
		} catch {}
	}

	if ( frontEndPage ) {
		try {
			await testInfo.attach( 'front-end-content.html', {
				body: Buffer.from( await frontEndPage.content() ),
				contentType: 'text/html',
			} );
		} catch {}
	}
}

test( 'the block inserts, saves, and renders with front-end fallbacks', async ( {
	browser,
	page,
}, testInfo ) => {
	const title = `K Typewriter Smoke ${ Date.now() }`;
	let viewPageUrl = '';
	let frontEndPage;
	let frontEndContext;
	let reducedMotionContext;
	let noJsContext;

	try {
		await login( page );
		await page.goto( '/wp-admin/post-new.php?post_type=page', {
			waitUntil: 'domcontentloaded',
		} );
		await page.locator( 'iframe[name="editor-canvas"]' ).waitFor();
		await dismissEditorOverlays( page );

		const canvas = page.frameLocator( 'iframe[name="editor-canvas"]' );

		await canvas
			.getByRole( 'textbox', { name: 'Add title' } )
			.fill( title );
		await page
			.getByRole( 'button', { name: 'Toggle block inserter' } )
			.click();
		await page
			.getByRole( 'searchbox', {
				name: 'Search for blocks and patterns',
			} )
			.fill( 'K Typewriter' );
		await page.getByRole( 'option', { name: /K Typewriter/u } ).click();
		await page.getByRole( 'tab', { name: 'Block', exact: true } ).click();

		await page
			.getByRole( 'textbox', { name: 'Messages', exact: true } )
			.fill( `${ FIRST_MESSAGE }\nAnimate without losing your fallback` );
		await page
			.getByRole( 'spinbutton', { name: 'Typing delay (ms)' } )
			.fill( '20' );
		await page
			.getByRole( 'spinbutton', { name: 'Deleting delay (ms)' } )
			.fill( '20' );
		await page
			.getByRole( 'spinbutton', { name: 'Pause delay (ms)' } )
			.fill( '200' );
		await page
			.getByRole( 'checkbox', {
				name: 'Start when visible',
				exact: true,
			} )
			.uncheck();

		const editorPreviewText = canvas.locator(
			'.wp-block-imjlk-k-typewriter .k-typewriter__content'
		);

		await expectEditorPreviewToChange( editorPreviewText );

		await page.getByRole( 'button', { name: 'Pause preview' } ).click();

		const pausedPreviewValue = (
			await editorPreviewText.textContent()
		)?.trim();

		await page.waitForTimeout( 300 );

		await expect( editorPreviewText ).toHaveText(
			pausedPreviewValue ?? ''
		);

		await page.getByRole( 'button', { name: 'Play preview' } ).click();

		await expect
			.poll(
				async () => ( await editorPreviewText.textContent() )?.trim(),
				{
					timeout: 5000,
				}
			)
			.not.toBe( pausedPreviewValue );

		await canvas.getByRole( 'textbox', { name: 'Add title' } ).click();
		await expect( editorPreviewText ).toHaveText( FIRST_MESSAGE );

		await canvas
			.locator( '.wp-block-imjlk-k-typewriter .k-typewriter-editor' )
			.click();
		await expectEditorPreviewToChange( editorPreviewText );

		await publishPage( page );

		await expect(
			page.getByText(
				'This block contains unexpected or invalid content.',
				{
					exact: false,
				}
			)
		).toHaveCount( 0 );

		viewPageUrl = await getPublishedPageUrl( page );

		const postId = await getPublishedPostId( page );

		if ( ! postId ) {
			throw new Error( 'Missing published post ID in editor URL.' );
		}

		const frontEndUrl = buildFrontEndUrl( postId, viewPageUrl );

		await page.reload( {
			waitUntil: 'domcontentloaded',
		} );
		await page.locator( 'iframe[name="editor-canvas"]' ).waitFor();
		await dismissEditorOverlays( page );

		await expect(
			page.getByText(
				'This block contains unexpected or invalid content.',
				{
					exact: false,
				}
			)
		).toHaveCount( 0 );

		await expect
			.poll(
				async () => {
					const response = await page.request.get( frontEndUrl, {
						failOnStatusCode: false,
					} );
					const html = await response.text();

					return {
						hasBlockMarkup: html.includes(
							'wp-block-imjlk-k-typewriter'
						),
						hasFirstMessage: html.includes( FIRST_MESSAGE ),
						status: response.status(),
					};
				},
				{
					timeout: 15000,
				}
			)
			.toEqual(
				expect.objectContaining( {
					hasBlockMarkup: true,
					hasFirstMessage: true,
					status: 200,
				} )
			);

		const htmlResponse = await page.request.get( frontEndUrl, {
			failOnStatusCode: false,
		} );
		const html = await htmlResponse.text();

		expect( htmlResponse.status() ).toBeLessThan( 400 );
		expect( html ).toContain( 'wp-block-imjlk-k-typewriter' );
		expect( html ).toContain( FIRST_MESSAGE );

		frontEndContext = await browser.newContext();
		frontEndPage = await frontEndContext.newPage();

		await frontEndPage.goto( frontEndUrl, {
			waitUntil: 'domcontentloaded',
		} );

		const block = frontEndPage.locator( '.wp-block-imjlk-k-typewriter' );
		const animatedText = block.locator( '.k-typewriter__content' );

		await expect( block ).toBeVisible();
		await expect( animatedText ).toHaveText( FIRST_MESSAGE );

		await expect
			.poll(
				async () => {
					const value = ( await animatedText.textContent() )?.trim();

					return Boolean( value && value !== FIRST_MESSAGE );
				},
				{
					timeout: 5000,
				}
			)
			.toBe( true );

		const animatedValue = ( await animatedText.textContent() )?.trim();

		expect( animatedValue ).toBeTruthy();
		expect( animatedValue ).not.toBe( FIRST_MESSAGE );

		reducedMotionContext = await browser.newContext( {
			reducedMotion: 'reduce',
		} );
		const reducedMotionPage = await reducedMotionContext.newPage();

		await reducedMotionPage.goto( frontEndUrl, {
			waitUntil: 'domcontentloaded',
		} );
		await reducedMotionPage.waitForTimeout( 1200 );

		await expect(
			reducedMotionPage.locator(
				'.wp-block-imjlk-k-typewriter .k-typewriter__content'
			)
		).toHaveText( FIRST_MESSAGE );

		noJsContext = await browser.newContext( {
			javaScriptEnabled: false,
		} );
		const noJsPage = await noJsContext.newPage();

		await noJsPage.goto( frontEndUrl, {
			waitUntil: 'domcontentloaded',
		} );

		await expect(
			noJsPage.locator(
				'.wp-block-imjlk-k-typewriter .k-typewriter__content'
			)
		).toHaveText( FIRST_MESSAGE );
	} catch ( error ) {
		await attachDebugArtifacts( testInfo, {
			page,
			viewPageUrl,
			frontEndPage,
		} );

		throw error;
	} finally {
		await frontEndContext?.close();
		await reducedMotionContext?.close();
		await noJsContext?.close();
	}
} );
