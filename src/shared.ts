export const DEFAULT_ITEMS = [
	'한 글자씩, 리듬 있게.',
	'Animate headlines in any language.',
	'Ship polished hero copy in minutes.',
];

export const START_DELAY_MODES = [
	'first-start',
	'every-cycle',
	'every-reentry',
] as const;

export const DEFAULT_ATTRIBUTES = {
	items: DEFAULT_ITEMS,
	typeDelay: 80,
	deleteDelay: 40,
	pauseDelay: 1200,
	startDelay: 0,
	startDelayMode: 'first-start',
	loop: true,
	showCursor: true,
	startOnView: true,
	useCustomFallback: false,
	fallbackText: '',
	seoSummaryText: '',
	tagName: 'p',
} as const;

export const LEGACY_BLOCK_NAME = 'create-block/k-typewriter';

export const VALID_TAG_NAMES = [
	'p',
	'div',
	'span',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'strong',
	'em',
	'small',
	'mark',
] as const;

export type TypewriterTagName = ( typeof VALID_TAG_NAMES )[ number ];
export type StartDelayMode = ( typeof START_DELAY_MODES )[ number ];

export type TypewriterAttributes = {
	items: string[];
	typeDelay: number;
	deleteDelay: number;
	pauseDelay: number;
	startDelay: number;
	startDelayMode: StartDelayMode;
	loop: boolean;
	showCursor: boolean;
	startOnView: boolean;
	useCustomFallback: boolean;
	fallbackText: string;
	seoSummaryText: string;
	tagName: TypewriterTagName;
};

export type LegacyAttributes = {
	texts?: string[];
	text?: string;
	testToggle?: boolean;
};

function sanitizeText( value: unknown ): string {
	return typeof value === 'string' ? value.trim() : '';
}

function clampNumber( value: unknown, minimum: number, maximum: number ) {
	if ( typeof value !== 'number' || Number.isNaN( value ) ) {
		return minimum;
	}

	return Math.min( maximum, Math.max( minimum, value ) );
}

export function sanitizeItems( items: unknown ): string[] {
	if ( ! Array.isArray( items ) ) {
		return [ ...DEFAULT_ITEMS ];
	}

	const nextItems = items
		.map( ( item ) => String( item ).trim() )
		.filter( Boolean );

	return nextItems.length ? nextItems : [ ...DEFAULT_ITEMS ];
}

export function coerceStartDelayMode( value: unknown ): StartDelayMode {
	if ( typeof value === 'string' ) {
		const candidate = value.toLowerCase() as StartDelayMode;

		if ( START_DELAY_MODES.includes( candidate ) ) {
			return candidate;
		}
	}

	return DEFAULT_ATTRIBUTES.startDelayMode;
}

export function coerceTagName( tagName: unknown ): TypewriterTagName {
	if ( typeof tagName === 'string' ) {
		const lowerTagName = tagName.toLowerCase() as TypewriterTagName;

		if ( VALID_TAG_NAMES.includes( lowerTagName ) ) {
			return lowerTagName;
		}
	}

	return DEFAULT_ATTRIBUTES.tagName;
}

export function getEffectiveFallbackText(
	attributes: Pick<
		TypewriterAttributes,
		'items' | 'useCustomFallback' | 'fallbackText'
	>
) {
	if ( attributes.useCustomFallback ) {
		const customFallback = sanitizeText( attributes.fallbackText );

		if ( customFallback ) {
			return customFallback;
		}
	}

	const items = sanitizeItems( attributes.items );

	return items[ 0 ] ?? '';
}

export function formatLocaleList( items: string[], locale?: string ) {
	if ( ! items.length ) {
		return '';
	}

	if ( items.length === 1 ) {
		return items[ 0 ];
	}

	if (
		typeof Intl !== 'undefined' &&
		typeof Intl.ListFormat === 'function'
	) {
		return new Intl.ListFormat( locale, {
			style: 'long',
			type: 'conjunction',
		} ).format( items );
	}

	return items.join( ', ' );
}

export function getEffectiveSeoSummary(
	attributes: Pick< TypewriterAttributes, 'items' | 'seoSummaryText' >,
	locale?: string
) {
	const customSummary = sanitizeText( attributes.seoSummaryText );

	if ( customSummary ) {
		return customSummary;
	}

	return formatLocaleList( sanitizeItems( attributes.items ), locale );
}

export function normalizeAttributes(
	attributes: Partial< TypewriterAttributes >
): TypewriterAttributes {
	return {
		items: sanitizeItems( attributes.items ),
		typeDelay: clampNumber(
			attributes.typeDelay ?? DEFAULT_ATTRIBUTES.typeDelay,
			20,
			300
		),
		deleteDelay: clampNumber(
			attributes.deleteDelay ?? DEFAULT_ATTRIBUTES.deleteDelay,
			10,
			240
		),
		pauseDelay: clampNumber(
			attributes.pauseDelay ?? DEFAULT_ATTRIBUTES.pauseDelay,
			200,
			4000
		),
		startDelay: clampNumber(
			attributes.startDelay ?? DEFAULT_ATTRIBUTES.startDelay,
			0,
			5000
		),
		startDelayMode: coerceStartDelayMode( attributes.startDelayMode ),
		loop:
			typeof attributes.loop === 'boolean'
				? attributes.loop
				: DEFAULT_ATTRIBUTES.loop,
		showCursor:
			typeof attributes.showCursor === 'boolean'
				? attributes.showCursor
				: DEFAULT_ATTRIBUTES.showCursor,
		startOnView:
			typeof attributes.startOnView === 'boolean'
				? attributes.startOnView
				: DEFAULT_ATTRIBUTES.startOnView,
		useCustomFallback:
			typeof attributes.useCustomFallback === 'boolean'
				? attributes.useCustomFallback
				: DEFAULT_ATTRIBUTES.useCustomFallback,
		fallbackText: sanitizeText( attributes.fallbackText ),
		seoSummaryText: sanitizeText( attributes.seoSummaryText ),
		tagName: coerceTagName( attributes.tagName ),
	};
}

export function migrateLegacyAttributes(
	attributes: LegacyAttributes
): TypewriterAttributes {
	const items = attributes.testToggle
		? sanitizeItems( attributes.texts )
		: sanitizeItems(
				attributes.text ? [ attributes.text ] : attributes.texts
		  );

	return {
		...DEFAULT_ATTRIBUTES,
		items,
	};
}
