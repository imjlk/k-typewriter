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

	if ( 'fonts' in document ) {
		document.fonts.ready.then( applyReservedHeight ).catch( () => {} );
	}

	if ( typeof ResizeObserver !== 'function' ) {
		return () => {};
	}

	const resizeObserver = new ResizeObserver( applyReservedHeight );
	const styleTarget =
		textElement.closest( '.wp-block-imjlk-k-typewriter' ) ??
		textElement.parentElement;
	let mutationObserver: MutationObserver | null = null;

	resizeObserver.observe( textElement );

	if ( typeof MutationObserver === 'function' && styleTarget ) {
		mutationObserver = new MutationObserver( applyReservedHeight );
		mutationObserver.observe( styleTarget, {
			attributeFilter: [ 'class', 'style' ],
			attributes: true,
		} );
	}

	return () => {
		resizeObserver.disconnect();
		mutationObserver?.disconnect();
	};
}
