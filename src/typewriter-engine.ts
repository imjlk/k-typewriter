import { combine, decompose } from '@beavercoding/uni-typer';
import { type StartDelayMode, getEffectiveFallbackText } from './shared';

export type TypewriterFrame = {
	displayText: string;
	itemIndex: number;
	charIndex: number;
	isDeleting: boolean;
	hasStarted: boolean;
	pendingReentryDelay: boolean;
};

export type TypewriterPlaybackOptions = {
	items: string[];
	fallbackText?: string;
	loop: boolean;
	startDelay: number;
	startDelayMode: StartDelayMode;
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
	hasStarted: false,
	pendingReentryDelay: false,
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

export function createFallbackFrame(
	items: unknown,
	fallbackText = ''
): TypewriterFrame {
	const normalizedItems = normalizeTypingItems( items );
	const readyItem = normalizedItems[ 0 ] ?? '';
	const visibleFallback =
		fallbackText ||
		getEffectiveFallbackText( {
			items: normalizedItems,
			useCustomFallback: false,
			fallbackText: '',
		} );

	return {
		displayText: visibleFallback,
		itemIndex: 0,
		charIndex: getTypingUnits( readyItem ).length,
		isDeleting: false,
		hasStarted: false,
		pendingReentryDelay: false,
	};
}

export function armReentryDelay( frame: TypewriterFrame ): TypewriterFrame {
	if ( ! frame.hasStarted ) {
		return frame;
	}

	return {
		...frame,
		pendingReentryDelay: true,
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

function shouldUseStartDelay(
	frame: TypewriterFrame,
	options: TypewriterPlaybackOptions
) {
	if ( options.startDelay <= 0 ) {
		return false;
	}

	if ( ! frame.hasStarted ) {
		return true;
	}

	if (
		options.startDelayMode === 'every-reentry' &&
		frame.pendingReentryDelay
	) {
		return true;
	}

	return (
		options.startDelayMode === 'every-cycle' &&
		! frame.isDeleting &&
		frame.charIndex === 0 &&
		frame.displayText === ''
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

export function getNextStepDelay(
	frame: TypewriterFrame,
	options: TypewriterTimingOptions
): number {
	if ( shouldUseStartDelay( frame, options ) ) {
		return options.startDelay;
	}

	return getFrameDelay( frame, options );
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
			...frame,
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

export function advanceTypewriterFrame(
	frame: TypewriterFrame,
	options: TypewriterPlaybackOptions
): TypewriterFrame {
	const normalizedItems = normalizeTypingItems( options.items );

	if ( ! normalizedItems.length ) {
		return EMPTY_FRAME;
	}

	const firstItem = normalizedItems[ 0 ];
	const firstItemLength = getTypingUnits( firstItem ).length;

	if ( ! frame.hasStarted ) {
		if ( frame.displayText !== firstItem ) {
			return {
				displayText: firstItem,
				itemIndex: 0,
				charIndex: firstItemLength,
				isDeleting: false,
				hasStarted: true,
				pendingReentryDelay: false,
			};
		}

		return {
			...advanceFrame(
				{
					...frame,
					displayText: firstItem,
					itemIndex: 0,
					charIndex: firstItemLength,
					isDeleting: false,
				},
				options
			),
			hasStarted: true,
			pendingReentryDelay: false,
		};
	}

	return {
		...advanceFrame(
			{
				...frame,
				pendingReentryDelay: false,
			},
			options
		),
		hasStarted: true,
		pendingReentryDelay: false,
	};
}
