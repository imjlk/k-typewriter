import { combine, decompose } from '@beavercoding/uni-typer';

export type TypewriterFrame = {
	displayText: string;
	itemIndex: number;
	charIndex: number;
	isDeleting: boolean;
};

export type TypewriterPlaybackOptions = {
	items: string[];
	loop: boolean;
};

export type TypewriterTimingOptions = TypewriterPlaybackOptions & {
	typeDelay: number;
	deleteDelay: number;
	pauseDelay: number;
};

const EMPTY_FRAME: TypewriterFrame = {
	displayText: '',
	itemIndex: 0,
	charIndex: 0,
	isDeleting: false,
};

export function normalizeTypingItems( items: unknown ): string[] {
	if ( ! Array.isArray( items ) ) {
		return [];
	}

	return items.map( ( item ) => String( item ).trim() ).filter( Boolean );
}

export function getTypingUnits( value: string ): string[] {
	return decompose( value, 'simple' ) as string[];
}

export function composeTypingUnits( units: string[] ): string {
	const combined = combine( units );

	return Array.isArray( combined ) ? combined.join( '' ) : combined;
}

export function createFallbackFrame( items: unknown ): TypewriterFrame {
	const normalizedItems = normalizeTypingItems( items );
	const fallback = normalizedItems[ 0 ] ?? '';

	return {
		displayText: fallback,
		itemIndex: 0,
		charIndex: getTypingUnits( fallback ).length,
		isDeleting: false,
	};
}

export function isAnimationComplete(
	frame: TypewriterFrame,
	options: TypewriterPlaybackOptions
): boolean {
	const normalizedItems = normalizeTypingItems( options.items );
	const currentItem =
		normalizedItems[ frame.itemIndex ] ?? normalizedItems[ 0 ] ?? '';
	const currentUnits = getTypingUnits( currentItem );

	return (
		! options.loop &&
		frame.itemIndex === normalizedItems.length - 1 &&
		! frame.isDeleting &&
		frame.charIndex >= currentUnits.length
	);
}

export function getFrameDelay(
	frame: TypewriterFrame,
	options: TypewriterTimingOptions
): number {
	const normalizedItems = normalizeTypingItems( options.items );
	const currentItem =
		normalizedItems[ frame.itemIndex ] ?? normalizedItems[ 0 ] ?? '';
	const currentUnits = getTypingUnits( currentItem );
	const isFullyTyped = frame.charIndex >= currentUnits.length;

	if ( ! frame.isDeleting && isFullyTyped ) {
		return options.pauseDelay;
	}

	return frame.isDeleting ? options.deleteDelay : options.typeDelay;
}

export function advanceFrame(
	frame: TypewriterFrame,
	options: TypewriterPlaybackOptions
): TypewriterFrame {
	const normalizedItems = normalizeTypingItems( options.items );

	if ( ! normalizedItems.length ) {
		return EMPTY_FRAME;
	}

	const currentItem =
		normalizedItems[ frame.itemIndex ] ?? normalizedItems[ 0 ];
	const currentUnits = getTypingUnits( currentItem );

	if ( frame.isDeleting ) {
		const nextCharIndex = Math.max( frame.charIndex - 1, 0 );
		const nextFrame: TypewriterFrame = {
			...frame,
			charIndex: nextCharIndex,
			displayText: composeTypingUnits(
				currentUnits.slice( 0, nextCharIndex )
			),
		};

		if ( nextCharIndex > 0 ) {
			return nextFrame;
		}

		if (
			frame.itemIndex === normalizedItems.length - 1 &&
			! options.loop
		) {
			return {
				...frame,
				charIndex: currentUnits.length,
				displayText: currentItem,
				isDeleting: false,
			};
		}

		return {
			displayText: '',
			itemIndex: ( frame.itemIndex + 1 ) % normalizedItems.length,
			charIndex: 0,
			isDeleting: false,
		};
	}

	if ( frame.charIndex < currentUnits.length ) {
		const nextCharIndex = frame.charIndex + 1;

		return {
			...frame,
			charIndex: nextCharIndex,
			displayText: composeTypingUnits(
				currentUnits.slice( 0, nextCharIndex )
			),
		};
	}

	if ( ! options.loop && frame.itemIndex === normalizedItems.length - 1 ) {
		return frame;
	}

	return {
		...frame,
		isDeleting: true,
	};
}
