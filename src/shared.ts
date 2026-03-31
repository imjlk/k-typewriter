export const SAMPLE_ITEMS = [
	'한 글자씩, 리듬 있게.',
	'Animate headlines in any language.',
	'Ship polished hero copy in minutes.',
];

export const START_DELAY_MODES = [
	'first-start',
	'every-cycle',
	'every-reentry',
] as const;

export const CONTENT_SOURCE_MODES = [ 'auto', 'custom' ] as const;
export const TRANSITION_MODES = [ 'backspace', 'restart' ] as const;
export const VERTICAL_ALIGNMENTS = [ 'top', 'middle', 'bottom' ] as const;
export const TEXT_DIRECTIONS = [ 'auto', 'ltr', 'rtl' ] as const;
export const INLINE_WIDTH_MODES = [ 'auto', 'characters', 'measure' ] as const;
export const CURSOR_ANIMATION_MODES = [ 'blink', 'transition' ] as const;

export const DEFAULT_ATTRIBUTES = {
	items: [] as string[],
	typeDelay: 80,
	transitionMode: 'backspace',
	deleteDelay: 40,
	pauseDelay: 1200,
	startDelay: 0,
	startDelayMode: 'first-start',
	loop: true,
	reserveLines: 1,
	verticalAlign: 'top',
	inlineLayout: false,
	inlineWidthMode: 'auto',
	inlineWidthCh: 24,
	textDirection: 'auto',
	startFromEmpty: false,
	showCursor: true,
	cursorAnimationMode: 'blink',
	cursorWidth: 0.08,
	cursorHeight: 0.86,
	cursorOffsetX: 0,
	cursorOffsetY: 0,
	cursorBlinkSpeed: 1000,
	cursorTransitionSpeed: 900,
	hideCursorWhenComplete: false,
	keepCursorAnimationOnComplete: false,
	startOnView: true,
	replayOnReentry: false,
	pauseOnHover: false,
	fallbackMode: 'auto',
	fallbackText: '',
	summaryMode: 'auto',
	summaryText: '',
	tagName: 'p',
} as const;

export const INLINE_WIDTH_CH_MIN = 1;
export const INLINE_WIDTH_CH_SLIDER_MAX = 80;
export const INLINE_WIDTH_CH_INPUT_MAX = 9999;

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
export type ContentSourceMode = ( typeof CONTENT_SOURCE_MODES )[ number ];
export type TransitionMode = ( typeof TRANSITION_MODES )[ number ];
export type VerticalAlignment = ( typeof VERTICAL_ALIGNMENTS )[ number ];
export type TextDirection = ( typeof TEXT_DIRECTIONS )[ number ];
export type InlineWidthMode = ( typeof INLINE_WIDTH_MODES )[ number ];
export type CursorAnimationMode = ( typeof CURSOR_ANIMATION_MODES )[ number ];

export type TypewriterAttributes = {
	items: string[];
	typeDelay: number;
	transitionMode: TransitionMode;
	deleteDelay: number;
	pauseDelay: number;
	startDelay: number;
	startDelayMode: StartDelayMode;
	loop: boolean;
	reserveLines: number;
	verticalAlign: VerticalAlignment;
	inlineLayout: boolean;
	inlineWidthMode: InlineWidthMode;
	inlineWidthCh: number;
	textDirection: TextDirection;
	startFromEmpty: boolean;
	showCursor: boolean;
	cursorAnimationMode: CursorAnimationMode;
	cursorWidth: number;
	cursorHeight: number;
	cursorOffsetX: number;
	cursorOffsetY: number;
	cursorBlinkSpeed: number;
	cursorTransitionSpeed: number;
	hideCursorWhenComplete: boolean;
	keepCursorAnimationOnComplete: boolean;
	startOnView: boolean;
	replayOnReentry: boolean;
	pauseOnHover: boolean;
	fallbackMode: ContentSourceMode;
	fallbackText: string;
	summaryMode: ContentSourceMode;
	summaryText: string;
	tagName: TypewriterTagName;
};

function sanitizeText( value: unknown ): string {
	return typeof value === 'string' ? decodeHtmlEntities( value ).trim() : '';
}

function decodeHtmlEntities( value: string ): string {
	if ( typeof document !== 'undefined' ) {
		const textarea = document.createElement( 'textarea' );
		textarea.innerHTML = value;
		return textarea.value;
	}

	return value
		.replaceAll( '&gt;', '>' )
		.replaceAll( '&lt;', '<' )
		.replaceAll( '&amp;', '&' )
		.replaceAll( '&quot;', '"' )
		.replaceAll( '&#039;', "'" )
		.replaceAll( '&#8217;', "'" )
		.replaceAll( '&#8230;', '...' );
}

function clampNumber( value: unknown, minimum: number, maximum: number ) {
	if ( typeof value !== 'number' || Number.isNaN( value ) ) {
		return minimum;
	}

	return Math.min( maximum, Math.max( minimum, value ) );
}

export function sanitizeItems( items: unknown ): string[] {
	if ( ! Array.isArray( items ) ) {
		return [];
	}

	const nextItems = items
		.map( ( item ) => decodeHtmlEntities( String( item ) ).trim() )
		.filter( Boolean );

	return nextItems;
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

export function coerceTransitionMode( value: unknown ): TransitionMode {
	if ( typeof value === 'string' ) {
		const candidate = value.toLowerCase() as TransitionMode;

		if ( TRANSITION_MODES.includes( candidate ) ) {
			return candidate;
		}
	}

	return DEFAULT_ATTRIBUTES.transitionMode;
}

export function coerceVerticalAlignment( value: unknown ): VerticalAlignment {
	if ( typeof value === 'string' ) {
		const candidate = value.toLowerCase() as VerticalAlignment;

		if ( VERTICAL_ALIGNMENTS.includes( candidate ) ) {
			return candidate;
		}
	}

	return DEFAULT_ATTRIBUTES.verticalAlign;
}

export function coerceTextDirection( value: unknown ): TextDirection {
	if ( typeof value === 'string' ) {
		const candidate = value.toLowerCase() as TextDirection;

		if ( TEXT_DIRECTIONS.includes( candidate ) ) {
			return candidate;
		}
	}

	return DEFAULT_ATTRIBUTES.textDirection;
}

export function coerceInlineWidthMode( value: unknown ): InlineWidthMode {
	if ( typeof value === 'string' ) {
		const candidate = value.toLowerCase() as InlineWidthMode;

		if ( INLINE_WIDTH_MODES.includes( candidate ) ) {
			return candidate;
		}
	}

	return DEFAULT_ATTRIBUTES.inlineWidthMode;
}

export function coerceCursorAnimationMode(
	value: unknown
): CursorAnimationMode {
	if ( typeof value === 'string' ) {
		const candidate = value.toLowerCase() as CursorAnimationMode;

		if ( CURSOR_ANIMATION_MODES.includes( candidate ) ) {
			return candidate;
		}
	}

	return DEFAULT_ATTRIBUTES.cursorAnimationMode;
}

export function coerceContentSourceMode(
	value: unknown,
	fallbackMode: ContentSourceMode = DEFAULT_ATTRIBUTES.fallbackMode
): ContentSourceMode {
	if ( typeof value === 'string' ) {
		const candidate = value.toLowerCase() as ContentSourceMode;

		if ( CONTENT_SOURCE_MODES.includes( candidate ) ) {
			return candidate;
		}
	}

	return fallbackMode;
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
		'items' | 'fallbackMode' | 'fallbackText'
	>
) {
	if ( attributes.fallbackMode === 'custom' ) {
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

export function formatAutoSummaryText( items: string[], locale?: string ) {
	const summaryList = formatLocaleList( items, locale );
	const normalizedLocale = locale?.toLowerCase() ?? '';

	if ( ! summaryList ) {
		return '';
	}

	if ( normalizedLocale.startsWith( 'ko' ) ) {
		return `${ summaryList }가 순차적으로 타이핑되는 애니메이션`;
	}

	return `Typewriter animation that sequentially types ${ summaryList }.`;
}

export function getApproximateInlineWidthCh(
	attributes: Pick<
		TypewriterAttributes,
		| 'items'
		| 'fallbackMode'
		| 'fallbackText'
		| 'inlineWidthMode'
		| 'inlineWidthCh'
	>
) {
	if ( attributes.inlineWidthMode === 'auto' ) {
		return null;
	}

	if ( attributes.inlineWidthMode === 'characters' ) {
		return clampNumber(
			attributes.inlineWidthCh ?? DEFAULT_ATTRIBUTES.inlineWidthCh,
			INLINE_WIDTH_CH_MIN,
			INLINE_WIDTH_CH_INPUT_MAX
		);
	}

	const messages = new Set( [
		...sanitizeItems( attributes.items ),
		getEffectiveFallbackText( attributes ),
	] );
	const longestLength = Math.max(
		...Array.from( messages, ( message ) => Array.from( message ).length ),
		DEFAULT_ATTRIBUTES.inlineWidthCh
	);

	return clampNumber(
		longestLength,
		INLINE_WIDTH_CH_MIN,
		INLINE_WIDTH_CH_INPUT_MAX
	);
}

export function getEffectiveSummaryText(
	attributes: Pick<
		TypewriterAttributes,
		'items' | 'summaryMode' | 'summaryText'
	>,
	locale?: string
) {
	if ( attributes.summaryMode === 'custom' ) {
		const customSummary = sanitizeText( attributes.summaryText );

		if ( customSummary ) {
			return customSummary;
		}
	}

	return formatAutoSummaryText( sanitizeItems( attributes.items ), locale );
}

export function normalizeAttributes(
	attributes: Partial< TypewriterAttributes >
): TypewriterAttributes {
	const fallbackText = sanitizeText( attributes.fallbackText );
	const summaryText = sanitizeText( attributes.summaryText );
	const fallbackMode = coerceContentSourceMode(
		attributes.fallbackMode,
		DEFAULT_ATTRIBUTES.fallbackMode
	);
	const summaryMode = coerceContentSourceMode(
		attributes.summaryMode,
		DEFAULT_ATTRIBUTES.summaryMode
	);

	return {
		items: sanitizeItems( attributes.items ),
		typeDelay: clampNumber(
			attributes.typeDelay ?? DEFAULT_ATTRIBUTES.typeDelay,
			20,
			300
		),
		transitionMode: coerceTransitionMode( attributes.transitionMode ),
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
		reserveLines: clampNumber(
			attributes.reserveLines ?? DEFAULT_ATTRIBUTES.reserveLines,
			1,
			6
		),
		verticalAlign: coerceVerticalAlignment( attributes.verticalAlign ),
		inlineLayout:
			typeof attributes.inlineLayout === 'boolean'
				? attributes.inlineLayout
				: DEFAULT_ATTRIBUTES.inlineLayout,
		inlineWidthMode: coerceInlineWidthMode( attributes.inlineWidthMode ),
		inlineWidthCh: clampNumber(
			attributes.inlineWidthCh ?? DEFAULT_ATTRIBUTES.inlineWidthCh,
			INLINE_WIDTH_CH_MIN,
			INLINE_WIDTH_CH_INPUT_MAX
		),
		textDirection: coerceTextDirection( attributes.textDirection ),
		startFromEmpty:
			typeof attributes.startFromEmpty === 'boolean'
				? attributes.startFromEmpty
				: DEFAULT_ATTRIBUTES.startFromEmpty,
		showCursor:
			typeof attributes.showCursor === 'boolean'
				? attributes.showCursor
				: DEFAULT_ATTRIBUTES.showCursor,
		cursorAnimationMode: coerceCursorAnimationMode(
			attributes.cursorAnimationMode
		),
		cursorWidth: clampNumber(
			attributes.cursorWidth ?? DEFAULT_ATTRIBUTES.cursorWidth,
			0.04,
			0.24
		),
		cursorHeight: clampNumber(
			attributes.cursorHeight ?? DEFAULT_ATTRIBUTES.cursorHeight,
			0.6,
			1.2
		),
		cursorOffsetX: clampNumber(
			attributes.cursorOffsetX ?? DEFAULT_ATTRIBUTES.cursorOffsetX,
			-0.3,
			0.3
		),
		cursorOffsetY: clampNumber(
			attributes.cursorOffsetY ?? DEFAULT_ATTRIBUTES.cursorOffsetY,
			-0.3,
			0.3
		),
		cursorBlinkSpeed: clampNumber(
			attributes.cursorBlinkSpeed ?? DEFAULT_ATTRIBUTES.cursorBlinkSpeed,
			200,
			2000
		),
		cursorTransitionSpeed: clampNumber(
			attributes.cursorTransitionSpeed ??
				DEFAULT_ATTRIBUTES.cursorTransitionSpeed,
			200,
			2000
		),
		hideCursorWhenComplete:
			typeof attributes.hideCursorWhenComplete === 'boolean'
				? attributes.hideCursorWhenComplete
				: DEFAULT_ATTRIBUTES.hideCursorWhenComplete,
		keepCursorAnimationOnComplete:
			typeof attributes.keepCursorAnimationOnComplete === 'boolean'
				? attributes.keepCursorAnimationOnComplete
				: DEFAULT_ATTRIBUTES.keepCursorAnimationOnComplete,
		startOnView:
			typeof attributes.startOnView === 'boolean'
				? attributes.startOnView
				: DEFAULT_ATTRIBUTES.startOnView,
		replayOnReentry:
			typeof attributes.replayOnReentry === 'boolean'
				? attributes.replayOnReentry
				: DEFAULT_ATTRIBUTES.replayOnReentry,
		pauseOnHover:
			typeof attributes.pauseOnHover === 'boolean'
				? attributes.pauseOnHover
				: DEFAULT_ATTRIBUTES.pauseOnHover,
		fallbackMode,
		fallbackText,
		summaryMode,
		summaryText,
		tagName: coerceTagName( attributes.tagName ),
	};
}
