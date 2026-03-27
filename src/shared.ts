export const DEFAULT_ITEMS = [
	'한 글자씩, 리듬 있게.',
	'Animate headlines in any language.',
	'Ship polished hero copy in minutes.',
];

export const DEFAULT_ATTRIBUTES = {
	items: DEFAULT_ITEMS,
	typeDelay: 80,
	deleteDelay: 40,
	pauseDelay: 1200,
	loop: true,
	showCursor: true,
	startOnView: true,
	tagName: 'p',
} as const;

export const LEGACY_BLOCK_NAME = 'create-block/k-typewriter';

export const VALID_TAG_NAMES = [ 'p', 'h1', 'h2', 'div', 'span' ] as const;

export type TypewriterTagName = ( typeof VALID_TAG_NAMES )[ number ];

export type TypewriterAttributes = {
	items: string[];
	typeDelay: number;
	deleteDelay: number;
	pauseDelay: number;
	loop: boolean;
	showCursor: boolean;
	startOnView: boolean;
	tagName: TypewriterTagName;
};

export type LegacyAttributes = {
	texts?: string[];
	text?: string;
	testToggle?: boolean;
};

export function sanitizeItems( items: unknown ): string[] {
	if ( ! Array.isArray( items ) ) {
		return [ ...DEFAULT_ITEMS ];
	}

	const nextItems = items
		.map( ( item ) => String( item ).trim() )
		.filter( Boolean );

	return nextItems.length ? nextItems : [ ...DEFAULT_ITEMS ];
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

export function normalizeAttributes(
	attributes: Partial< TypewriterAttributes >
): TypewriterAttributes {
	return {
		items: sanitizeItems( attributes.items ),
		typeDelay:
			typeof attributes.typeDelay === 'number'
				? attributes.typeDelay
				: DEFAULT_ATTRIBUTES.typeDelay,
		deleteDelay:
			typeof attributes.deleteDelay === 'number'
				? attributes.deleteDelay
				: DEFAULT_ATTRIBUTES.deleteDelay,
		pauseDelay:
			typeof attributes.pauseDelay === 'number'
				? attributes.pauseDelay
				: DEFAULT_ATTRIBUTES.pauseDelay,
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
