jest.mock(
	'@wordpress/blocks',
	() => ( {
		createBlock: ( name, attributes = {}, innerBlocks = [] ) => ( {
			name,
			attributes,
			innerBlocks,
		} ),
	} ),
	{ virtual: true }
);

import transforms, {
	buildParagraphLikeContent,
	buildPreformattedContent,
	createTypewriterAttributesFromBlocks,
	extractMessagesFromListBlock,
	extractMessagesFromParagraphLikeContent,
	extractMessagesFromQuoteBlock,
	getHeadingLevelFromTagName,
} from '../../src/transforms';

describe( 'block transforms helpers', () => {
	test( 'extracts multiple messages from paragraph-like rich text', () => {
		expect(
			extractMessagesFromParagraphLikeContent(
				'<strong>Alpha</strong><br>Beta<br />Gamma'
			)
		).toEqual( [ 'Alpha', 'Beta', 'Gamma' ] );
	} );

	test( 'extracts quote paragraphs from inner blocks', () => {
		expect(
			extractMessagesFromQuoteBlock( {}, [
				{
					name: 'core/paragraph',
					attributes: { content: 'First quote line' },
				},
				{
					name: 'core/paragraph',
					attributes: { content: 'Second quote line' },
				},
			] )
		).toEqual( [ 'First quote line', 'Second quote line' ] );
	} );

	test( 'extracts list item messages from nested list item inner blocks', () => {
		expect(
			extractMessagesFromListBlock( {}, [
				{
					name: 'core/list-item',
					attributes: { content: 'Alpha item' },
				},
				{
					name: 'core/list-item',
					attributes: { content: 'Beta item' },
				},
			] )
		).toEqual( [ 'Alpha item', 'Beta item' ] );
	} );

	test( 'creates typewriter attributes from mixed supported text blocks', () => {
		expect(
			createTypewriterAttributesFromBlocks( [
				{
					name: 'core/heading',
					attributes: {
						content: 'Primary headline',
						level: 3,
						textColor: 'contrast',
					},
				},
				{
					name: 'core/paragraph',
					attributes: {
						content: 'Follow-up line',
						direction: 'rtl',
					},
				},
			] )
		).toEqual(
			expect.objectContaining( {
				items: [ 'Primary headline', 'Follow-up line' ],
				tagName: 'h3',
				textColor: 'contrast',
				textDirection: 'rtl',
			} )
		);
	} );

	test( 'serializes all messages for paragraph-like targets', () => {
		expect(
			buildParagraphLikeContent( [ 'Alpha', 'Beta & <Gamma>' ] )
		).toBe( 'Alpha<br>Beta &amp; &lt;Gamma&gt;' );
		expect( buildPreformattedContent( [ 'Alpha', 'Beta' ] ) ).toBe(
			'Alpha\nBeta'
		);
	} );

	test( 'uses heading tag name when transforming back to heading', () => {
		expect( getHeadingLevelFromTagName( 'h6' ) ).toBe( 6 );
		expect( getHeadingLevelFromTagName( 'span' ) ).toBe( 2 );
	} );

	test( 'builds a paragraph block transform that preserves all messages', () => {
		const paragraphTransform = transforms.to.find(
			( transform ) => transform.blocks[ 0 ] === 'core/paragraph'
		);

		expect(
			paragraphTransform.transform( {
				items: [ 'Alpha', 'Beta' ],
				textDirection: 'rtl',
				textColor: 'contrast',
			} )
		).toEqual(
			expect.objectContaining( {
				name: 'core/paragraph',
				attributes: expect.objectContaining( {
					content: 'Alpha<br>Beta',
					direction: 'rtl',
					textColor: 'contrast',
				} ),
			} )
		);
	} );

	test( 'builds a multi-block transform into k typewriter', () => {
		const multiBlockTransform = transforms.from.find(
			( transform ) => transform.isMultiBlock
		);
		const blocks = [
			{
				name: 'core/paragraph',
				attributes: { content: 'Alpha line' },
				innerBlocks: [],
			},
			{
				name: 'core/preformatted',
				attributes: { content: 'Beta line\nGamma line' },
				innerBlocks: [],
			},
		];

		expect( multiBlockTransform.isMatch( [], blocks ) ).toBe( true );
		expect( multiBlockTransform.__experimentalConvert( blocks ) ).toEqual(
			expect.objectContaining( {
				name: 'imjlk/k-typewriter',
				attributes: expect.objectContaining( {
					items: [ 'Alpha line', 'Beta line', 'Gamma line' ],
				} ),
			} )
		);
	} );
} );
