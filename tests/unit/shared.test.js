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
			startFromEmpty: true,
			fallbackMode: 'custom',
			fallbackText: 'Static fallback',
			summaryMode: 'custom',
			summaryText: 'Summary',
		} );

		expect( normalized.tagName ).toBe( 'h6' );
		expect( normalized.transitionMode ).toBe( 'restart' );
		expect( normalized.startDelay ).toBe( 800 );
		expect( normalized.startDelayMode ).toBe( 'every-reentry' );
		expect( normalized.startFromEmpty ).toBe( true );
		expect( normalized.fallbackMode ).toBe( 'custom' );
		expect( normalized.fallbackText ).toBe( 'Static fallback' );
		expect( normalized.summaryMode ).toBe( 'custom' );
		expect( normalized.summaryText ).toBe( 'Summary' );
	} );

	test( 'rejects unsupported custom tags', () => {
		expect( coerceTagName( 'script' ) ).toBe( 'p' );
		expect( coerceTagName( 'mark' ) ).toBe( 'mark' );
	} );
} );
