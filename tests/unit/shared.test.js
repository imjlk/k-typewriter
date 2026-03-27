import {
	coerceTagName,
	getEffectiveFallbackText,
	getEffectiveSeoSummary,
	normalizeAttributes,
} from '../../src/shared';

describe( 'shared helpers', () => {
	test( 'uses the first message as the default visible fallback', () => {
		expect(
			getEffectiveFallbackText( {
				items: [ 'Alpha', 'Beta' ],
				useCustomFallback: false,
				fallbackText: 'Ignored',
			} )
		).toBe( 'Alpha' );
	} );

	test( 'uses the custom fallback when enabled', () => {
		expect(
			getEffectiveFallbackText( {
				items: [ 'Alpha', 'Beta' ],
				useCustomFallback: true,
				fallbackText: 'Static fallback',
			} )
		).toBe( 'Static fallback' );
	} );

	test( 'uses the custom SEO summary when provided', () => {
		expect(
			getEffectiveSeoSummary(
				{
					items: [ 'Alpha', 'Beta', 'Gamma' ],
					seoSummaryText: 'Custom summary',
				},
				'en-US'
			)
		).toBe( 'Custom summary' );
	} );

	test( 'auto-generates a locale-aware SEO summary when blank', () => {
		const summary = getEffectiveSeoSummary(
			{
				items: [ 'Alpha', 'Beta', 'Gamma' ],
				seoSummaryText: '',
			},
			'en-US'
		);

		expect( summary ).toContain( 'Alpha' );
		expect( summary ).toContain( 'Beta' );
		expect( summary ).toContain( 'Gamma' );
	} );

	test( 'normalizes extended tag names and new fallback attributes', () => {
		const normalized = normalizeAttributes( {
			items: [ 'Alpha', 'Beta' ],
			tagName: 'h6',
			startDelay: 800,
			startDelayMode: 'every-reentry',
			useCustomFallback: true,
			fallbackText: 'Static fallback',
			seoSummaryText: 'Summary',
		} );

		expect( normalized.tagName ).toBe( 'h6' );
		expect( normalized.startDelay ).toBe( 800 );
		expect( normalized.startDelayMode ).toBe( 'every-reentry' );
		expect( normalized.useCustomFallback ).toBe( true );
		expect( normalized.fallbackText ).toBe( 'Static fallback' );
		expect( normalized.seoSummaryText ).toBe( 'Summary' );
	} );

	test( 'rejects unsupported custom tags', () => {
		expect( coerceTagName( 'script' ) ).toBe( 'p' );
		expect( coerceTagName( 'mark' ) ).toBe( 'mark' );
	} );
} );
