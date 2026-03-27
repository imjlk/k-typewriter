import {
	getContext,
	getElement,
	store,
	withScope,
} from '@wordpress/interactivity';
import {
	advanceFrame,
	createFallbackFrame,
	getFrameDelay,
	isAnimationComplete,
	normalizeTypingItems,
} from './typewriter-engine';

type TypewriterContext = {
	items: string[];
	displayText: string;
	itemIndex: number;
	charIndex: number;
	isDeleting: boolean;
	loop: boolean;
	showCursor: boolean;
	startOnView: boolean;
	typeDelay: number;
	deleteDelay: number;
	pauseDelay: number;
	reducedMotion: boolean;
};

type RuntimeState = {
	hasEnteredView: boolean;
	inView: boolean;
	documentVisible: boolean;
	timeoutId: number | null;
	observer: IntersectionObserver | null;
	mediaQuery: MediaQueryList | null;
	cleanupMotion: ( () => void ) | null;
};

const STORE_NAME = 'kTypewriter';
const runtimes = new WeakMap< Element, RuntimeState >();

const { actions } = store( STORE_NAME, {
	actions: {
		advance() {
			const context = getContext< TypewriterContext >();
			const items = normalizeTypingItems( context.items );

			if ( ! items.length ) {
				context.displayText = '';
				context.charIndex = 0;
				return;
			}

			if ( context.reducedMotion ) {
				resetToFallback( context, items );
				return;
			}

			Object.assign(
				context,
				advanceFrame( context, {
					items,
					loop: context.loop,
				} )
			);
		},
	},
	callbacks: {
		init() {
			const { ref } = getElement();

			if ( ! ref ) {
				return;
			}

			const context = getContext< TypewriterContext >();
			const items = normalizeTypingItems( context.items );
			const runtime = ensureRuntime( ref );

			resetToFallback( context, items );
			runtime.documentVisible = ! document.hidden;

			const mediaQuery = window.matchMedia(
				'(prefers-reduced-motion: reduce)'
			);
			runtime.mediaQuery = mediaQuery;

			const syncReducedMotion = withScope( () => {
				context.reducedMotion = mediaQuery.matches;

				if ( context.reducedMotion ) {
					resetToFallback( context, items );
				}

				scheduleTick();
			} );

			syncReducedMotion();

			if ( typeof mediaQuery.addEventListener === 'function' ) {
				mediaQuery.addEventListener( 'change', syncReducedMotion );
				runtime.cleanupMotion = () =>
					mediaQuery.removeEventListener(
						'change',
						syncReducedMotion
					);
			} else {
				mediaQuery.addListener( syncReducedMotion );
				runtime.cleanupMotion = () =>
					mediaQuery.removeListener( syncReducedMotion );
			}

			const handleVisibility = withScope( () => {
				runtime.documentVisible = ! document.hidden;
				scheduleTick();
			} );

			document.addEventListener( 'visibilitychange', handleVisibility );

			if ( context.startOnView ) {
				runtime.inView = false;
				runtime.observer = new IntersectionObserver(
					withScope( ( entries: IntersectionObserverEntry[] ) => {
						runtime.inView = entries.some(
							( entry ) => entry.isIntersecting
						);
						runtime.hasEnteredView =
							runtime.hasEnteredView || runtime.inView;
						scheduleTick();
					} ),
					{
						threshold: 0.2,
					}
				);
				runtime.observer.observe( ref );
			} else {
				runtime.inView = true;
				runtime.hasEnteredView = true;
				scheduleTick();
			}

			return () => {
				clearScheduledTick( ref );
				runtime.observer?.disconnect();
				runtime.cleanupMotion?.();
				document.removeEventListener(
					'visibilitychange',
					handleVisibility
				);
				runtimes.delete( ref );
			};
		},
	},
} );

function ensureRuntime( ref: Element ): RuntimeState {
	const existingRuntime = runtimes.get( ref );

	if ( existingRuntime ) {
		return existingRuntime;
	}

	const runtime: RuntimeState = {
		hasEnteredView: false,
		inView: true,
		documentVisible: ! document.hidden,
		timeoutId: null,
		observer: null,
		mediaQuery: null,
		cleanupMotion: null,
	};

	runtimes.set( ref, runtime );

	return runtime;
}

function clearScheduledTick( ref: Element ) {
	const runtime = runtimes.get( ref );

	if ( runtime?.timeoutId ) {
		window.clearTimeout( runtime.timeoutId );
		runtime.timeoutId = null;
	}
}

function resetToFallback( context: TypewriterContext, items: string[] ) {
	Object.assign( context, createFallbackFrame( items ) );
}

function shouldAnimate(
	context: TypewriterContext,
	runtime: RuntimeState
): boolean {
	const items = normalizeTypingItems( context.items );

	if ( context.reducedMotion || ! items.length ) {
		return false;
	}

	if ( ! runtime.documentVisible ) {
		return false;
	}

	if ( context.startOnView && ! runtime.inView && ! runtime.hasEnteredView ) {
		return false;
	}

	if ( context.startOnView && ! runtime.inView ) {
		return false;
	}

	return ! isAnimationComplete( context, {
		items,
		loop: context.loop,
	} );
}

function getDelay( context: TypewriterContext ): number {
	return getFrameDelay( context, {
		items: normalizeTypingItems( context.items ),
		loop: context.loop,
		typeDelay: context.typeDelay,
		deleteDelay: context.deleteDelay,
		pauseDelay: context.pauseDelay,
	} );
}

function scheduleTick() {
	const { ref } = getElement();

	if ( ! ref ) {
		return;
	}

	const context = getContext< TypewriterContext >();
	const runtime = ensureRuntime( ref );

	clearScheduledTick( ref );

	if ( ! shouldAnimate( context, runtime ) ) {
		return;
	}

	runtime.timeoutId = window.setTimeout(
		withScope( () => {
			actions.advance();
			scheduleTick();
		} ),
		getDelay( context )
	);
}
