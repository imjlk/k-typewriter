import {
	coerceTagName,
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
			textDirection: 'rtl',
			startFromEmpty: true,
			cursorWidth: 0.12,
			cursorOffsetY: 0.08,
			cursorBlinkSpeed: 1600,
			hideCursorWhilePaused: true,
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
		expect( normalized.textDirection ).toBe( 'rtl' );
		expect( normalized.startFromEmpty ).toBe( true );
		expect( normalized.cursorWidth ).toBe( 0.12 );
		expect( normalized.cursorOffsetY ).toBe( 0.08 );
		expect( normalized.cursorBlinkSpeed ).toBe( 1600 );
		expect( normalized.hideCursorWhilePaused ).toBe( true );
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
			cursorWidth: 0.5,
			cursorOffsetY: -1,
			cursorBlinkSpeed: 5000,
		} );

		expect( normalized.cursorWidth ).toBe( 0.24 );
		expect( normalized.cursorOffsetY ).toBe( -0.3 );
		expect( normalized.cursorBlinkSpeed ).toBe( 2000 );
	} );

	test( 'falls back to auto text direction for unsupported values', () => {
		expect(
			normalizeAttributes( {
				textDirection: 'sideways',
			} ).textDirection
		).toBe( 'auto' );
	} );
} );
