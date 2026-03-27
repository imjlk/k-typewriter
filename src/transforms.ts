import { createBlock } from '@wordpress/blocks';

import type { TypewriterAttributes } from './shared';

const K_TYPEWRITER_BLOCK = 'imjlk/k-typewriter';

export const SUPPORTED_TEXT_TRANSFORM_BLOCKS = [
	'core/paragraph',
	'core/heading',
	'core/quote',
	'core/list',
	'core/preformatted',
] as const;

const TRANSFORM_STYLE_KEYS = [
	'style',
	'backgroundColor',
	'textColor',
	'fontSize',
	'className',
] as const;

type TransformStyleKey = ( typeof TRANSFORM_STYLE_KEYS )[ number ];

type TransformStyleAttributes = Partial<
	Record< TransformStyleKey, unknown >
> & {
	direction?: unknown;
	content?: unknown;
	value?: unknown;
	values?: unknown;
	level?: unknown;
	tagName?: unknown;
	items?: unknown;
	textDirection?: unknown;
};

type TransformBlock = {
	name: string;
	attributes?: TransformStyleAttributes;
	innerBlocks?: TransformBlock[];
};

function isSupportedTransformBlockName( name: unknown ) {
	return (
		typeof name === 'string' &&
		SUPPORTED_TEXT_TRANSFORM_BLOCKS.includes(
			name as ( typeof SUPPORTED_TEXT_TRANSFORM_BLOCKS )[ number ]
		)
	);
}

function createHTMLDocument( markup: string ) {
	if (
		typeof document !== 'undefined' &&
		document.implementation?.createHTMLDocument
	) {
		const doc = document.implementation.createHTMLDocument( '' );
		doc.body.innerHTML = markup;
		return doc;
	}

	if ( typeof DOMParser !== 'undefined' ) {
		return new DOMParser().parseFromString( markup, 'text/html' );
	}

	return null;
}

function escapeHTML( text: string ) {
	return text
		.replaceAll( '&', '&amp;' )
		.replaceAll( '<', '&lt;' )
		.replaceAll( '>', '&gt;' )
		.replaceAll( '"', '&quot;' )
		.replaceAll( "'", '&#39;' );
}

function normalizeText( text: string ) {
	return text.replaceAll( '\u00a0', ' ' ).trim();
}

function splitMessages( text: string ) {
	return text.split( /\r?\n/u ).map( normalizeText ).filter( Boolean );
}

export function getStoredTransformItems( items: unknown ) {
	if ( ! Array.isArray( items ) ) {
		return [];
	}

	return items.map( ( item ) => String( item ).trim() ).filter( Boolean );
}

export function htmlToPlainText( html: unknown ) {
	if ( typeof html !== 'string' || ! html ) {
		return '';
	}

	const normalizedMarkup = html.replace( /<br\s*\/?>/giu, '\n' );
	const doc = createHTMLDocument( normalizedMarkup );

	if ( doc?.body ) {
		return normalizeText( doc.body.textContent ?? '' );
	}

	return normalizeText( normalizedMarkup.replace( /<[^>]+>/gu, '' ) );
}

export function extractMessagesFromParagraphLikeContent( content: unknown ) {
	if ( typeof content !== 'string' ) {
		return [];
	}

	return splitMessages( htmlToPlainText( content ) );
}

function extractMessagesFromListItemBlocks( blocks: TransformBlock[] = [] ) {
	return blocks.flatMap( ( block ) => {
		if ( block.name !== 'core/list-item' ) {
			return extractMessagesFromListItemBlocks( block.innerBlocks );
		}

		const messages: string[] = [];
		const content = htmlToPlainText( block.attributes?.content );

		if ( content ) {
			messages.push( content );
		}

		if ( block.innerBlocks?.length ) {
			messages.push(
				...extractMessagesFromListItemBlocks( block.innerBlocks )
			);
		}

		return messages;
	} );
}

export function extractMessagesFromQuoteBlock(
	attributes: TransformStyleAttributes = {},
	innerBlocks: TransformBlock[] = []
) {
	const innerBlockMessages = extractMessagesFromBlocks( innerBlocks );

	if ( innerBlockMessages.length ) {
		return innerBlockMessages;
	}

	if ( typeof attributes.value !== 'string' || ! attributes.value ) {
		return [];
	}

	const doc = createHTMLDocument(
		`<blockquote>${ attributes.value }</blockquote>`
	);
	const paragraphMessages = doc?.querySelectorAll( 'blockquote > p' )
		? Array.from( doc.querySelectorAll( 'blockquote > p' ) )
				.map( ( node ) => normalizeText( node.textContent ?? '' ) )
				.filter( Boolean )
		: [];

	return paragraphMessages.length
		? paragraphMessages
		: splitMessages( htmlToPlainText( attributes.value ) );
}

export function extractMessagesFromListBlock(
	attributes: TransformStyleAttributes = {},
	innerBlocks: TransformBlock[] = []
) {
	const innerBlockMessages = extractMessagesFromListItemBlocks( innerBlocks );

	if ( innerBlockMessages.length ) {
		return innerBlockMessages;
	}

	if ( typeof attributes.values !== 'string' || ! attributes.values ) {
		return [];
	}

	const doc = createHTMLDocument( `<ul>${ attributes.values }</ul>` );
	const listItemMessages = doc?.querySelectorAll( 'li' )
		? Array.from( doc.querySelectorAll( 'li' ) )
				.map( ( node ) => normalizeText( node.textContent ?? '' ) )
				.filter( Boolean )
		: [];

	return listItemMessages.length
		? listItemMessages
		: splitMessages( htmlToPlainText( attributes.values ) );
}

export function extractMessagesFromSourceBlock( block: TransformBlock ) {
	switch ( block.name ) {
		case 'core/paragraph':
		case 'core/heading':
		case 'core/preformatted':
			return extractMessagesFromParagraphLikeContent(
				block.attributes?.content
			);
		case 'core/quote':
			return extractMessagesFromQuoteBlock(
				block.attributes,
				block.innerBlocks
			);
		case 'core/list':
			return extractMessagesFromListBlock(
				block.attributes,
				block.innerBlocks
			);
		default:
			return [];
	}
}

export function extractMessagesFromBlocks( blocks: TransformBlock[] = [] ) {
	return blocks.flatMap( extractMessagesFromSourceBlock ).filter( Boolean );
}

export function buildParagraphLikeContent( messages: string[] ) {
	return messages.map( escapeHTML ).join( '<br>' );
}

export function buildPreformattedContent( messages: string[] ) {
	return messages.map( escapeHTML ).join( '\n' );
}

function pickTransformStyleAttributes(
	attributes: TransformStyleAttributes = {}
) {
	return TRANSFORM_STYLE_KEYS.reduce(
		( nextAttributes, key ) => {
			const value = attributes[ key ];

			if ( value !== undefined && value !== '' ) {
				nextAttributes[ key ] = value;
			}

			return nextAttributes;
		},
		{} as Record< string, unknown >
	);
}

function getTagNameFromSourceBlock( block?: TransformBlock ) {
	if ( block?.name === 'core/heading' ) {
		const level = Number( block.attributes?.level );

		if ( Number.isInteger( level ) && level >= 1 && level <= 6 ) {
			return `h${ level }` as TypewriterAttributes[ 'tagName' ];
		}
	}

	return 'p' as const;
}

function getTextDirectionFromSourceBlocks( blocks: TransformBlock[] = [] ) {
	for ( const block of blocks ) {
		if ( block.name !== 'core/paragraph' ) {
			continue;
		}

		if (
			block.attributes?.direction === 'ltr' ||
			block.attributes?.direction === 'rtl'
		) {
			return block.attributes.direction;
		}
	}

	return undefined;
}

export function createTypewriterAttributesFromBlocks(
	blocks: TransformBlock[] = []
) {
	const items = extractMessagesFromBlocks( blocks );

	if ( ! items.length ) {
		return null;
	}

	const firstBlock = blocks[ 0 ];
	const nextAttributes: Record< string, unknown > = {
		...pickTransformStyleAttributes( firstBlock?.attributes ),
		items,
		tagName: getTagNameFromSourceBlock( firstBlock ),
	};
	const textDirection = getTextDirectionFromSourceBlocks( blocks );

	if ( textDirection ) {
		nextAttributes.textDirection = textDirection;
	}

	return nextAttributes;
}

export function getHeadingLevelFromTagName( tagName: unknown ) {
	if ( typeof tagName === 'string' && /^h[1-6]$/u.test( tagName ) ) {
		return Number( tagName.slice( 1 ) );
	}

	return 2;
}

export function createSupportedTextTransforms() {
	const fromTransforms = SUPPORTED_TEXT_TRANSFORM_BLOCKS.map(
		( blockName ) => ( {
			type: 'block' as const,
			blocks: [ blockName ],
			isMatch: (
				_attributes: TransformStyleAttributes,
				block: TransformBlock
			) => extractMessagesFromSourceBlock( block ).length > 0,
			transform: (
				attributes: TransformStyleAttributes,
				innerBlocks: TransformBlock[] = []
			) =>
				createBlock(
					K_TYPEWRITER_BLOCK,
					createTypewriterAttributesFromBlocks( [
						{ name: blockName, attributes, innerBlocks },
					] ) ?? undefined
				),
		} )
	);

	const multiBlockTransform = {
		type: 'block' as const,
		blocks: [ ...SUPPORTED_TEXT_TRANSFORM_BLOCKS ],
		isMultiBlock: true,
		isMatch: (
			_attributesArray: TransformStyleAttributes[],
			blocks: TransformBlock[]
		) =>
			blocks.every( ( block ) =>
				isSupportedTransformBlockName( block.name )
			) && extractMessagesFromBlocks( blocks ).length > 0,
		__experimentalConvert: ( blocks: TransformBlock[] ) =>
			createBlock(
				K_TYPEWRITER_BLOCK,
				createTypewriterAttributesFromBlocks( blocks ) ?? undefined
			),
	};

	const toTransforms = [
		{
			type: 'block' as const,
			blocks: [ 'core/paragraph' ],
			isMatch: ( attributes: Partial< TypewriterAttributes > ) =>
				getStoredTransformItems( attributes.items ).length > 0,
			transform: ( attributes: Partial< TypewriterAttributes > ) => {
				const items = getStoredTransformItems( attributes.items );
				const nextAttributes = {
					...pickTransformStyleAttributes( attributes ),
					content: buildParagraphLikeContent( items ),
				} as Record< string, unknown >;

				if (
					attributes.textDirection === 'ltr' ||
					attributes.textDirection === 'rtl'
				) {
					nextAttributes.direction = attributes.textDirection;
				}

				return createBlock( 'core/paragraph', nextAttributes );
			},
		},
		{
			type: 'block' as const,
			blocks: [ 'core/heading' ],
			isMatch: ( attributes: Partial< TypewriterAttributes > ) =>
				getStoredTransformItems( attributes.items ).length > 0,
			transform: ( attributes: Partial< TypewriterAttributes > ) =>
				createBlock( 'core/heading', {
					...pickTransformStyleAttributes( attributes ),
					content: buildParagraphLikeContent(
						getStoredTransformItems( attributes.items )
					),
					level: getHeadingLevelFromTagName( attributes.tagName ),
				} ),
		},
		{
			type: 'block' as const,
			blocks: [ 'core/quote' ],
			isMatch: ( attributes: Partial< TypewriterAttributes > ) =>
				getStoredTransformItems( attributes.items ).length > 0,
			transform: ( attributes: Partial< TypewriterAttributes > ) => {
				const items = getStoredTransformItems( attributes.items );

				return createBlock(
					'core/quote',
					pickTransformStyleAttributes( attributes ),
					items.map( ( item ) =>
						createBlock( 'core/paragraph', {
							content: escapeHTML( item ),
						} )
					)
				);
			},
		},
		{
			type: 'block' as const,
			blocks: [ 'core/list' ],
			isMatch: ( attributes: Partial< TypewriterAttributes > ) =>
				getStoredTransformItems( attributes.items ).length > 0,
			transform: ( attributes: Partial< TypewriterAttributes > ) => {
				const items = getStoredTransformItems( attributes.items );

				return createBlock(
					'core/list',
					pickTransformStyleAttributes( attributes ),
					items.map( ( item ) =>
						createBlock( 'core/list-item', {
							content: escapeHTML( item ),
						} )
					)
				);
			},
		},
		{
			type: 'block' as const,
			blocks: [ 'core/preformatted' ],
			isMatch: ( attributes: Partial< TypewriterAttributes > ) =>
				getStoredTransformItems( attributes.items ).length > 0,
			transform: ( attributes: Partial< TypewriterAttributes > ) =>
				createBlock( 'core/preformatted', {
					...pickTransformStyleAttributes( attributes ),
					content: buildPreformattedContent(
						getStoredTransformItems( attributes.items )
					),
				} ),
		},
	];

	return {
		from: [ ...fromTransforms, multiBlockTransform ],
		to: toTransforms,
	};
}

export default createSupportedTextTransforms();
