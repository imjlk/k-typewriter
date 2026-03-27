import {
	coerceInlineWidthMode,
	coerceTagName,
	getApproximateInlineWidthCh,
	getEffectiveSummaryText,
	getEffectiveFallbackText,
	normalizeAttributes,
} from '../../src/shared';

describe( 'shared helpers', () => {
	test( 'uses the first message as the default visible fallback', () => {
		expect(
			getEffectiveFallbackText( {
				items: [ 'Alpha', 'Beta' ],
				fallbackMode: 'auto',
				fallbackText: 'Ignored',
			} )
		).toBe( 'Alpha' );
	} );

	test( 'uses the custom fallback when enabled', () => {
		expect(
			getEffectiveFallbackText( {
				items: [ 'Alpha', 'Beta' ],
				fallbackMode: 'custom',
				fallbackText: 'Static fallback',
			} )
		).toBe( 'Static fallback' );
	} );

	test( 'uses the custom summary when provided', () => {
		expect(
			getEffectiveSummaryText(
				{
					items: [ 'Alpha', 'Beta', 'Gamma' ],
					summaryMode: 'custom',
					summaryText: 'Custom summary',
				},
				'en-US'
			)
		).toBe( 'Custom summary' );
	} );

	test( 'auto-generates a locale-aware descriptive summary when blank', () => {
		const summary = getEffectiveSummaryText(
			{
				items: [ 'Alpha', 'Beta', 'Gamma' ],
				summaryMode: 'auto',
				summaryText: '',
			},
			'en-US'
		);

		expect( summary ).toContain( 'Alpha' );
		expect( summary ).toContain( 'Beta' );
		expect( summary ).toContain( 'Gamma' );
		expect( summary ).toContain( 'Typewriter animation' );
	} );

	test( 'normalizes extended tag names and unified fallback attributes', () => {
		const normalized = normalizeAttributes( {
			items: [ 'Alpha', 'Beta' ],
			tagName: 'h6',
			transitionMode: 'restart',
			startDelay: 800,
			startDelayMode: 'every-reentry',
			reserveLines: 3,
			verticalAlign: 'bottom',
			inlineLayout: true,
			inlineWidthMode: 'measure',
			inlineWidthCh: 32,
			textDirection: 'rtl',
			startFromEmpty: true,
			cursorAnimationMode: 'transition',
			cursorWidth: 0.12,
			cursorHeight: 0.9,
			cursorOffsetX: 0.03,
			cursorOffsetY: 0.08,
			cursorBlinkSpeed: 1600,
			cursorTransitionSpeed: 1200,
			hideCursorWhenComplete: true,
			fallbackMode: 'custom',
			fallbackText: 'Static fallback',
			summaryMode: 'custom',
			summaryText: 'Summary',
		} );

		expect( normalized.tagName ).toBe( 'h6' );
		expect( normalized.transitionMode ).toBe( 'restart' );
		expect( normalized.startDelay ).toBe( 800 );
		expect( normalized.startDelayMode ).toBe( 'every-reentry' );
		expect( normalized.reserveLines ).toBe( 3 );
		expect( normalized.verticalAlign ).toBe( 'bottom' );
		expect( normalized.inlineLayout ).toBe( true );
		expect( normalized.inlineWidthMode ).toBe( 'measure' );
		expect( normalized.inlineWidthCh ).toBe( 32 );
		expect( normalized.textDirection ).toBe( 'rtl' );
		expect( normalized.startFromEmpty ).toBe( true );
		expect( normalized.cursorAnimationMode ).toBe( 'transition' );
		expect( normalized.cursorWidth ).toBe( 0.12 );
		expect( normalized.cursorHeight ).toBe( 0.9 );
		expect( normalized.cursorOffsetX ).toBe( 0.03 );
		expect( normalized.cursorOffsetY ).toBe( 0.08 );
		expect( normalized.cursorBlinkSpeed ).toBe( 1600 );
		expect( normalized.cursorTransitionSpeed ).toBe( 1200 );
		expect( normalized.hideCursorWhenComplete ).toBe( true );
		expect( normalized.fallbackMode ).toBe( 'custom' );
		expect( normalized.fallbackText ).toBe( 'Static fallback' );
		expect( normalized.summaryMode ).toBe( 'custom' );
		expect( normalized.summaryText ).toBe( 'Summary' );
	} );

	test( 'clamps reserve lines into the supported range', () => {
		expect(
			normalizeAttributes( {
				reserveLines: 0,
			} ).reserveLines
		).toBe( 1 );
		expect(
			normalizeAttributes( {
				reserveLines: 9,
			} ).reserveLines
		).toBe( 6 );
	} );

	test( 'rejects unsupported custom tags', () => {
		expect( coerceTagName( 'script' ) ).toBe( 'p' );
		expect( coerceTagName( 'mark' ) ).toBe( 'mark' );
	} );

	test( 'falls back to top vertical alignment for unsupported values', () => {
		expect(
			normalizeAttributes( {
				verticalAlign: 'sideways',
			} ).verticalAlign
		).toBe( 'top' );
	} );

	test( 'clamps cursor controls into the supported range', () => {
		const normalized = normalizeAttributes( {
			cursorAnimationMode: 'smooth',
			cursorWidth: 0.5,
			cursorHeight: 9,
			cursorOffsetX: -1,
			cursorOffsetY: -1,
			cursorBlinkSpeed: 5000,
			cursorTransitionSpeed: 10,
		} );

		expect( normalized.cursorAnimationMode ).toBe( 'blink' );
		expect( normalized.cursorWidth ).toBe( 0.24 );
		expect( normalized.cursorHeight ).toBe( 1.2 );
		expect( normalized.cursorOffsetX ).toBe( -0.3 );
		expect( normalized.cursorOffsetY ).toBe( -0.3 );
		expect( normalized.cursorBlinkSpeed ).toBe( 2000 );
		expect( normalized.cursorTransitionSpeed ).toBe( 200 );
	} );

	test( 'falls back to auto text direction for unsupported values', () => {
		expect(
			normalizeAttributes( {
				textDirection: 'sideways',
			} ).textDirection
		).toBe( 'auto' );
	} );

	test( 'clamps inline width settings into the supported range', () => {
		const normalized = normalizeAttributes( {
			inlineWidthMode: 'characters',
			inlineWidthCh: 1200,
		} );

		expect( normalized.inlineWidthMode ).toBe( 'characters' );
		expect( normalized.inlineWidthCh ).toBe( 1200 );
		expect( coerceInlineWidthMode( 'stretch' ) ).toBe( 'auto' );
	} );

	test( 'allows inline width values down to 1ch', () => {
		expect(
			normalizeAttributes( {
				inlineWidthMode: 'characters',
				inlineWidthCh: 0,
			} ).inlineWidthCh
		).toBe( 1 );
		expect(
			normalizeAttributes( {
				inlineWidthMode: 'characters',
				inlineWidthCh: 12000,
			} ).inlineWidthCh
		).toBe( 9999 );
	} );

	test( 'approximates inline width fallback for measure mode from content', () => {
		expect(
			getApproximateInlineWidthCh( {
				items: [ 'Short', 'A much longer message' ],
				fallbackMode: 'custom',
				fallbackText: 'Fallback',
				inlineWidthMode: 'measure',
				inlineWidthCh: 24,
			} )
		).toBeGreaterThanOrEqual( 21 );
	} );
} );
