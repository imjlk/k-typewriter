import type { InlineWidthMode } from './shared';

type InlineWidthSyncOptions = {
	inlineLayout: boolean;
	mode: InlineWidthMode;
	items: string[];
	fallbackText: string;
	showCursor: boolean;
};

function getMeasuredLineHeight( textElement: HTMLElement ) {
	const computedStyle = window.getComputedStyle( textElement );
	const numericLineHeight = Number.parseFloat( computedStyle.lineHeight );

	if ( Number.isFinite( numericLineHeight ) ) {
		return numericLineHeight;
	}

	const probe = document.createElement( 'span' );

	probe.textContent = 'A';
	probe.setAttribute( 'aria-hidden', 'true' );
	probe.style.position = 'absolute';
	probe.style.visibility = 'hidden';
	probe.style.inset = '0 auto auto 0';
	probe.style.margin = '0';
	probe.style.padding = '0';
	probe.style.border = '0';
	probe.style.font = 'inherit';
	probe.style.lineHeight = 'inherit';
	probe.style.whiteSpace = 'nowrap';

	textElement.appendChild( probe );

	const probeHeight = probe.getBoundingClientRect().height;

	probe.remove();

	return probeHeight || 0;
}

function getMeasuredReservedHeight(
	textElement: HTMLElement,
	reserveLines: number
) {
	if ( reserveLines <= 1 ) {
		return getMeasuredLineHeight( textElement );
	}

	const probe = document.createElement( 'span' );

	probe.setAttribute( 'aria-hidden', 'true' );
	probe.style.position = 'absolute';
	probe.style.visibility = 'hidden';
	probe.style.inset = '0 auto auto 0';
	probe.style.display = 'block';
	probe.style.margin = '0';
	probe.style.padding = '0';
	probe.style.border = '0';
	probe.style.font = 'inherit';
	probe.style.lineHeight = 'inherit';
	probe.style.whiteSpace = 'nowrap';

	for ( let index = 0; index < reserveLines; index += 1 ) {
		if ( index > 0 ) {
			probe.appendChild( document.createElement( 'br' ) );
		}

		probe.appendChild( document.createTextNode( 'A' ) );
	}

	textElement.appendChild( probe );

	const probeHeight = probe.getBoundingClientRect().height;

	probe.remove();

	return probeHeight || 0;
}

function getReserveLines( textElement: HTMLElement ) {
	const computedStyle = window.getComputedStyle( textElement );
	const reserveLines = Number.parseInt(
		computedStyle.getPropertyValue( '--k-typewriter-reserve-lines' ).trim(),
		10
	);

	if ( ! Number.isFinite( reserveLines ) || reserveLines < 1 ) {
		return 1;
	}

	return reserveLines;
}

function getStyleTarget( textElement: HTMLElement ) {
	return (
		textElement.closest( '.wp-block-imjlk-k-typewriter' ) ??
		textElement.parentElement
	);
}

function setupMetricObservers( textElement: HTMLElement, apply: () => void ) {
	if ( 'fonts' in document ) {
		document.fonts.ready.then( apply ).catch( () => {} );
	}

	const styleTarget = getStyleTarget( textElement );
	let resizeObserver: ResizeObserver | null = null;
	let mutationObserver: MutationObserver | null = null;

	if ( typeof ResizeObserver === 'function' ) {
		resizeObserver = new ResizeObserver( apply );
		resizeObserver.observe( textElement );

		if ( styleTarget && styleTarget !== textElement ) {
			resizeObserver.observe( styleTarget );
		}
	}

	if ( typeof MutationObserver === 'function' ) {
		mutationObserver = new MutationObserver( apply );
		mutationObserver.observe( textElement, {
			attributeFilter: [ 'class', 'dir' ],
			attributes: true,
		} );

		if ( styleTarget && styleTarget !== textElement ) {
			mutationObserver.observe( styleTarget, {
				attributeFilter: [ 'class', 'style', 'dir' ],
				attributes: true,
			} );
		}
	}

	return () => {
		resizeObserver?.disconnect();
		mutationObserver?.disconnect();
	};
}

function createMeasurementProbe(
	textElement: HTMLElement,
	showCursor: boolean
) {
	const probe = document.createElement( 'span' );
	const line = document.createElement( 'span' );
	const content = document.createElement( 'span' );
	let cursor: HTMLSpanElement | null = null;

	probe.setAttribute( 'aria-hidden', 'true' );
	probe.style.position = 'absolute';
	probe.style.visibility = 'hidden';
	probe.style.pointerEvents = 'none';
	probe.style.inset = '0 auto auto 0';
	probe.style.margin = '0';
	probe.style.padding = '0';
	probe.style.border = '0';
	probe.style.display = 'inline-block';
	probe.style.whiteSpace = 'nowrap';
	probe.style.maxInlineSize = 'none';
	probe.style.inlineSize = 'max-content';

	line.className = 'k-typewriter__line';
	line.style.display = 'inline-block';
	line.style.whiteSpace = 'nowrap';
	line.style.maxInlineSize = 'none';

	content.className = 'k-typewriter__content';

	line.appendChild( content );

	if ( showCursor ) {
		cursor = document.createElement( 'span' );
		cursor.className = 'k-typewriter__cursor';
		cursor.setAttribute( 'aria-hidden', 'true' );
		cursor.style.animation = 'none';
		cursor.hidden = false;
		line.appendChild( cursor );
	}

	probe.appendChild( line );
	textElement.appendChild( probe );

	return {
		content,
		cursor,
		line,
		probe,
		remove() {
			probe.remove();
		},
	};
}

function getMeasuredInlineWidth(
	textElement: HTMLElement,
	strings: string[],
	showCursor: boolean
) {
	const probe = createMeasurementProbe( textElement, showCursor );
	let maxWidth = 0;

	for ( const value of strings ) {
		probe.content.textContent = value;
		maxWidth = Math.max(
			maxWidth,
			probe.line.getBoundingClientRect().width
		);
	}

	probe.remove();

	return maxWidth;
}

export function syncReservedHeight( textElement: HTMLElement | null ) {
	if ( ! textElement ) {
		return () => {};
	}

	const applyReservedHeight = () => {
		const reserveLines = getReserveLines( textElement );
		const reservedHeight = getMeasuredReservedHeight(
			textElement,
			reserveLines
		);

		if ( ! reservedHeight ) {
			textElement.style.removeProperty(
				'--k-typewriter-reserved-height'
			);
			return;
		}

		// Round up so reserve lines never undershoot by a fractional pixel.
		textElement.style.setProperty(
			'--k-typewriter-reserved-height',
			`${ Math.ceil( reservedHeight ) }px`
		);
	};

	applyReservedHeight();

	return setupMetricObservers( textElement, applyReservedHeight );
}

export function syncInlineWidth(
	textElement: HTMLElement | null,
	{
		inlineLayout,
		mode,
		items,
		fallbackText,
		showCursor,
	}: InlineWidthSyncOptions
) {
	if ( ! textElement ) {
		return () => {};
	}

	const clearMeasuredWidth = () => {
		textElement.style.removeProperty(
			'--k-typewriter-inline-measured-width'
		);
	};

	if ( ! inlineLayout || mode !== 'measure' ) {
		clearMeasuredWidth();
		return () => {};
	}

	const measurementStrings = Array.from(
		new Set( [ ...items, fallbackText ].filter( Boolean ) )
	);

	if ( ! measurementStrings.length ) {
		clearMeasuredWidth();
		return () => {};
	}

	const applyMeasuredWidth = () => {
		const measuredWidth = getMeasuredInlineWidth(
			textElement,
			measurementStrings,
			showCursor
		);

		if ( ! measuredWidth ) {
			clearMeasuredWidth();
			return;
		}

		textElement.style.setProperty(
			'--k-typewriter-inline-measured-width',
			`${ Math.ceil( measuredWidth ) }px`
		);
	};

	applyMeasuredWidth();

	const cleanupObservers = setupMetricObservers(
		textElement,
		applyMeasuredWidth
	);

	return () => {
		cleanupObservers();
		clearMeasuredWidth();
	};
}
