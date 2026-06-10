const { expect, test } = require( '@playwright/test' );

const FIRST_MESSAGE = '안녕하세요, 세계';
const SEO_SUMMARY = '안녕하세요, 세계 and Animate without losing your fallback';

async function login( page ) {
	await page.goto( '/wp-login.php' );

	if ( page.url().includes( '/wp-admin/' ) ) {
		return;
	}

	await page.locator( '#user_login' ).waitFor();
	await page.waitForTimeout( 250 );
	await page.locator( '#user_login' ).fill( 'admin' );
	await page.locator( '#user_pass' ).fill( 'password' );
	await Promise.all( [
		page.waitForURL( /\/wp-admin\//u, { waitUntil: 'domcontentloaded' } ),
		page.getByRole( 'button', { name: 'Log In' } ).click(),
	] );
	await completeDatabaseUpgradeIfNeeded( page );
}

async function completeDatabaseUpgradeIfNeeded( page ) {
	const upgradeHeading = page.getByRole( 'heading', {
		name: /Database Update Required/iu,
	} );
	const needsUpgrade =
		page.url().includes( '/wp-admin/upgrade.php' ) ||
		( await upgradeHeading
			.first()
			.isVisible( { timeout: 1500 } )
			.catch( () => false ) );

	if ( ! needsUpgrade ) {
		return;
	}

	const updateButton = page.getByRole( 'button', {
		name: /Update WordPress Database/iu,
	} );
	const updateLink = page.getByRole( 'link', {
		name: /Update WordPress Database/iu,
	} );
	const updateSubmit = page.locator(
		'input[type="submit"][value="Update WordPress Database"]'
	);
	let upgradeControl = updateSubmit;

	if ( ( await updateButton.count() ) > 0 ) {
		upgradeControl = updateButton;
	} else if ( ( await updateLink.count() ) > 0 ) {
		upgradeControl = updateLink;
	}

	if ( ( await upgradeControl.count() ) > 0 ) {
		await upgradeControl.first().waitFor( {
			state: 'visible',
			timeout: 5000,
		} );
		await Promise.all( [
			page.waitForLoadState( 'domcontentloaded' ).catch( () => {} ),
			upgradeControl.first().click(),
		] );
	}

	const continueLink = page.getByRole( 'link', { name: /^Continue$/iu } );

	if (
		( await continueLink.count() ) > 0 &&
		( await continueLink
			.first()
			.isVisible( { timeout: 5000 } )
			.catch( () => false ) )
	) {
		await Promise.all( [
			page.waitForLoadState( 'domcontentloaded' ).catch( () => {} ),
			continueLink.first().click(),
		] );
	}

	await page.waitForLoadState( 'domcontentloaded' ).catch( () => {} );
}

async function openNewPageEditor( page ) {
	const editorFrame = page.locator( 'iframe[name="editor-canvas"]' );
	const upgradeHeading = page.getByRole( 'heading', {
		name: /Database Update Required/iu,
	} );

	for ( let attempt = 0; attempt < 2; attempt++ ) {
		await page.goto( '/wp-admin/post-new.php?post_type=page', {
			waitUntil: 'domcontentloaded',
		} );

		const destination = await Promise.race( [
			editorFrame
				.waitFor( { state: 'visible', timeout: 15000 } )
				.then( () => 'editor' )
				.catch( () => null ),
			upgradeHeading
				.waitFor( { state: 'visible', timeout: 15000 } )
				.then( () => 'upgrade' )
				.catch( () => null ),
		] );

		if ( destination === 'editor' ) {
			return;
		}

		if ( destination === 'upgrade' ) {
			await completeDatabaseUpgradeIfNeeded( page );
		}
	}

	await editorFrame.waitFor();
}

async function dismissEditorOverlays( page ) {
	await dismissModalOverlay( page );

	const patternHeading = page.getByRole( 'heading', {
		name: 'Choose a pattern',
		exact: true,
	} );

	if (
		( await patternHeading.count() ) > 0 &&
		( await patternHeading
			.first()
			.isVisible()
			.catch( () => false ) )
	) {
		await page.keyboard.press( 'Escape' ).catch( () => {} );

		const closePatternButtons = [
			page.getByRole( 'button', { name: /^Close$/u } ).last(),
			page.locator( 'button[aria-label="Close"]' ).last(),
		];

		for ( const closePatternButton of closePatternButtons ) {
			if (
				( await closePatternButton.count() ) > 0 &&
				( await closePatternButton.isVisible().catch( () => false ) )
			) {
				await closePatternButton
					.click( {
						timeout: 1000,
					} )
					.catch( () => {} );
			}
		}

		await patternHeading
			.first()
			.waitFor( {
				state: 'hidden',
				timeout: 3000,
			} )
			.catch( () => {} );
	}

	const dialogCloseButton = page.getByRole( 'button', { name: 'Close' } );

	if ( ( await dialogCloseButton.count() ) > 0 ) {
		await dialogCloseButton
			.first()
			.click( {
				timeout: 1000,
			} )
			.catch( () => {} );
	}

	const welcomeGuideCloseButton = page.getByRole( 'button', {
		name: 'Close dialog',
	} );

	if ( ( await welcomeGuideCloseButton.count() ) > 0 ) {
		await welcomeGuideCloseButton
			.first()
			.click( {
				timeout: 1000,
			} )
			.catch( () => {} );
	}

	await dismissModalOverlay( page );
}

async function dismissModalOverlay( page ) {
	const modalOverlay = page.locator( '.components-modal__screen-overlay' );

	for ( let attempt = 0; attempt < 3; attempt++ ) {
		if (
			( await modalOverlay.count() ) === 0 ||
			! ( await modalOverlay
				.first()
				.isVisible()
				.catch( () => false ) )
		) {
			return;
		}

		const closeButton = modalOverlay
			.locator(
				'button[aria-label*="Close" i], button:has-text("Close")'
			)
			.last();

		if (
			( await closeButton.count() ) > 0 &&
			( await closeButton.isVisible().catch( () => false ) )
		) {
			await closeButton
				.click( {
					timeout: 1000,
				} )
				.catch( () => {} );
		} else {
			await page.keyboard.press( 'Escape' ).catch( () => {} );
		}

		await modalOverlay
			.first()
			.waitFor( {
				state: 'hidden',
				timeout: 1000,
			} )
			.catch( () => {} );
	}
}

async function publishPage( page ) {
	const publishButtons = page.getByRole( 'button', { name: /^Publish$/u } );
	const publishedViewLink = page.getByRole( 'link', {
		name: /^View(?: Page)?$/u,
	} );

	await publishButtons.first().click();
	await publishButtons.last().click();
	await expect( publishedViewLink.first() ).toBeVisible();
}

async function openBlockSettings( page ) {
	const messagesField = page.getByRole( 'textbox', {
		name: 'Messages',
		exact: true,
	} );

	if ( ( await messagesField.count() ) > 0 ) {
		return;
	}

	const settingsButton = page.getByRole( 'button', { name: 'Settings' } );

	if ( ( await settingsButton.count() ) > 0 ) {
		await settingsButton
			.first()
			.click()
			.catch( () => {} );
	}

	const blockTab = page.getByRole( 'tab', { name: 'Block', exact: true } );

	if ( ( await blockTab.count() ) > 0 ) {
		await blockTab
			.first()
			.click()
			.catch( () => {} );
	}
}

async function openSummarySettings( page ) {
	const summarySource = page.getByRole( 'combobox', {
		name: 'Summary source',
		exact: true,
	} );
	const legacySummaryField = page.getByRole( 'textbox', {
		name: 'SEO summary text',
		exact: true,
	} );

	if (
		( await summarySource.count() ) > 0 ||
		( await legacySummaryField.count() ) > 0
	) {
		return;
	}

	for ( const panelTitle of [
		'Fallback & Summary',
		'SEO & Accessibility',
	] ) {
		const panelToggle = page.getByRole( 'button', {
			name: new RegExp( panelTitle, 'u' ),
		} );

		if ( ( await panelToggle.count() ) > 0 ) {
			await panelToggle
				.first()
				.click()
				.catch( () => {} );
		}
	}
}

async function setSummaryOverride( page, summaryText ) {
	await openSummarySettings( page );

	const summarySource = page.getByRole( 'combobox', {
		name: 'Summary source',
		exact: true,
	} );

	if ( ( await summarySource.count() ) > 0 ) {
		await summarySource.selectOption( 'custom' );
		await page
			.getByRole( 'textbox', { name: 'Summary override' } )
			.fill( summaryText );

		return;
	}

	const legacySummaryField = page.getByRole( 'textbox', {
		name: 'SEO summary text',
		exact: true,
	} );

	if ( ( await legacySummaryField.count() ) > 0 ) {
		await legacySummaryField.fill( summaryText );

		return;
	}

	throw new Error( 'Missing summary controls in block inspector.' );
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
		name: /^View(?: Page)?$/u,
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
	if ( publishedPageUrl ) {
		return publishedPageUrl;
	}

	const siteUrl = new URL(
		process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8888'
	);

	siteUrl.pathname = '/';
	siteUrl.search = '';
	siteUrl.searchParams.set( 'page_id', postId );

	return siteUrl.toString();
}

async function attachDebugArtifacts(
	testInfo,
	{ page, viewPageUrl, frontEndPage, frontEndUrl }
) {
	const attachments = [
		`editorUrl: ${ page?.url?.() ?? '' }`,
		`viewPageUrl: ${ viewPageUrl ?? '' }`,
		`frontEndUrl: ${ frontEndUrl ?? frontEndPage?.url?.() ?? '' }`,
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
	const title = `Stroke by stroke typing effect Block Smoke ${ Date.now() }`;
	let viewPageUrl = '';
	let frontEndUrl = '';
	let frontEndPage;
	let frontEndContext;
	let reducedMotionContext;
	let noJsContext;

	try {
		await login( page );
		await openNewPageEditor( page );
		await dismissEditorOverlays( page );

		const canvas = page.frameLocator( 'iframe[name="editor-canvas"]' );

		await canvas
			.getByRole( 'textbox', { name: 'Add title' } )
			.fill( title );
		await dismissEditorOverlays( page );
		await page
			.getByRole( 'button', {
				name: /(?:Toggle block inserter|Block Inserter)/iu,
			} )
			.click();
		await page
			.getByRole( 'searchbox', {
				name: /Search(?: for blocks and patterns)?/u,
			} )
			.fill( 'Stroke by stroke typing effect Block' );
		await page
			.getByRole( 'option', {
				name: /Stroke by stroke typing effect Block/u,
			} )
			.click();
		const insertedTypewriterBlock = canvas
			.locator( '.wp-block-imjlk-sbs-typing-effect-block' )
			.first();
		await insertedTypewriterBlock.waitFor( {
			state: 'visible',
			timeout: 15000,
		} );
		await insertedTypewriterBlock.click();
		await openBlockSettings( page );
		await page
			.getByRole( 'textbox', { name: 'Messages', exact: true } )
			.waitFor( { state: 'visible', timeout: 15000 } );

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
			.getByRole( 'spinbutton', { name: 'Start delay (ms)' } )
			.fill( '200' );
		await page
			.getByRole( 'combobox', { name: 'Start delay mode' } )
			.selectOption( 'every-reentry' );
		await page
			.getByRole( 'combobox', { name: 'Markup tag' } )
			.selectOption( 'h6' );
		await setSummaryOverride( page, SEO_SUMMARY );
		await page
			.getByRole( 'checkbox', {
				name: 'Start when visible',
				exact: true,
			} )
			.uncheck();

		const editorPreviewText = canvas.locator(
			'.wp-block-imjlk-sbs-typing-effect-block .k-typewriter__content'
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
		await dismissEditorOverlays( page );

		await canvas
			.locator(
				'.wp-block-imjlk-sbs-typing-effect-block .k-typewriter-editor'
			)
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

		frontEndUrl = buildFrontEndUrl( postId, viewPageUrl );

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
							'wp-block-imjlk-sbs-typing-effect-block'
						),
						hasFirstMessage: html.includes( FIRST_MESSAGE ),
						hasSeoSummary: html.includes( SEO_SUMMARY ),
						hasHeadingTag:
							/<h6[^>]*class="k-typewriter__text"/u.test( html ),
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
					hasSeoSummary: true,
					hasHeadingTag: true,
					status: 200,
				} )
			);

		const htmlResponse = await page.request.get( frontEndUrl, {
			failOnStatusCode: false,
		} );
		const html = await htmlResponse.text();

		expect( htmlResponse.status() ).toBeLessThan( 400 );
		expect( html ).toContain( 'wp-block-imjlk-sbs-typing-effect-block' );
		expect( html ).toContain( FIRST_MESSAGE );
		expect( html ).toContain( SEO_SUMMARY );
		expect( html ).toMatch( /<h6[^>]*class="k-typewriter__text"/u );

		frontEndContext = await browser.newContext();
		frontEndPage = await frontEndContext.newPage();

		await frontEndPage.goto( frontEndUrl, {
			waitUntil: 'domcontentloaded',
		} );

		const block = frontEndPage.locator(
			'.wp-block-imjlk-sbs-typing-effect-block'
		);
		const animatedText = block.locator( '.k-typewriter__content' );
		const animatedHeading = block.locator( 'h6.k-typewriter__text' );

		await expect( block ).toBeVisible();
		await expect( animatedHeading ).toHaveAttribute(
			'aria-label',
			SEO_SUMMARY
		);
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
				'.wp-block-imjlk-sbs-typing-effect-block .k-typewriter__content'
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
				'.wp-block-imjlk-sbs-typing-effect-block .k-typewriter__content'
			)
		).toHaveText( FIRST_MESSAGE );
	} catch ( error ) {
		await attachDebugArtifacts( testInfo, {
			page,
			viewPageUrl,
			frontEndPage,
			frontEndUrl,
		} );

		throw error;
	} finally {
		await frontEndContext?.close();
		await reducedMotionContext?.close();
		await noJsContext?.close();
	}
} );
