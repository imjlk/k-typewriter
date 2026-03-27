import {
	getContext,
	getElement,
	store,
	withScope,
} from '@wordpress/interactivity';
import {
	advanceTypewriterFrame,
	armReentryDelay,
	createFallbackFrame,
	getNextStepDelay,
	isAnimationComplete,
	normalizeTypingItems,
} from './typewriter-engine';
import { syncReservedHeight } from './reserve-lines';
import type { StartDelayMode, TransitionMode } from './shared';

type TypewriterContext = {
	items: string[];
	displayText: string;
	itemIndex: number;
	charIndex: number;
	isDeleting: boolean;
	hasStarted: boolean;
	pendingReentryDelay: boolean;
	fallbackText: string;
	loop: boolean;
	transitionMode: TransitionMode;
	startFromEmpty: boolean;
	showCursor: boolean;
	cursorVisible: boolean;
	hideCursorWhilePaused: boolean;
	hideCursorWhenComplete: boolean;
	startOnView: boolean;
	pauseOnHover: boolean;
	typeDelay: number;
	deleteDelay: number;
	pauseDelay: number;
	startDelay: number;
	startDelayMode: StartDelayMode;
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
	wasActive: boolean;
	isHovered: boolean;
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
				context.cursorVisible = false;
				return;
			}

			if ( context.reducedMotion ) {
				resetToFallback( context, items );
				syncCursorVisibility(
					context,
					getElement().ref ? ensureRuntime( getElement().ref ) : null
				);
				return;
			}

			Object.assign(
				context,
				advanceTypewriterFrame( context, {
					items,
					fallbackText: context.fallbackText,
					loop: context.loop,
					transitionMode: context.transitionMode,
					startFromEmpty: context.startFromEmpty,
					startDelay: context.startDelay,
					startDelayMode: context.startDelayMode,
				} )
			);
			syncCursorVisibility(
				context,
				getElement().ref ? ensureRuntime( getElement().ref ) : null
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
			const textElement = ref.querySelector(
				'.k-typewriter__text'
			) as HTMLElement | null;
			const cleanupReservedHeight = syncReservedHeight( textElement );

			resetToFallback( context, items );
			runtime.documentVisible = ! document.hidden;
			syncCursorVisibility( context, runtime );

			const mediaQuery = window.matchMedia(
				'(prefers-reduced-motion: reduce)'
			);
			runtime.mediaQuery = mediaQuery;

			const syncReducedMotion = withScope( () => {
				context.reducedMotion = mediaQuery.matches;

				if ( context.reducedMotion ) {
					resetToFallback( context, items );
				}

				syncCursorVisibility( context, runtime );
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
			const handlePointerEnter = withScope( () => {
				runtime.isHovered = true;
				scheduleTick();
			} );
			const handlePointerLeave = withScope( () => {
				runtime.isHovered = false;
				scheduleTick();
			} );

			document.addEventListener( 'visibilitychange', handleVisibility );
			ref.addEventListener( 'mouseenter', handlePointerEnter );
			ref.addEventListener( 'mouseleave', handlePointerLeave );

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
				cleanupReservedHeight();
				document.removeEventListener(
					'visibilitychange',
					handleVisibility
				);
				ref.removeEventListener( 'mouseenter', handlePointerEnter );
				ref.removeEventListener( 'mouseleave', handlePointerLeave );
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
		wasActive: false,
		isHovered: false,
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
	Object.assign(
		context,
		createFallbackFrame( items, context.fallbackText )
	);
}

function syncCursorVisibility(
	context: TypewriterContext,
	runtime: RuntimeState | null
) {
	if ( ! context.showCursor ) {
		context.cursorVisible = false;
		return;
	}

	const isComplete = isAnimationComplete( context, {
		items: context.items,
		fallbackText: context.fallbackText,
		loop: context.loop,
		transitionMode: context.transitionMode,
		startFromEmpty: context.startFromEmpty,
		startDelay: context.startDelay,
		startDelayMode: context.startDelayMode,
	} );
	const isPaused = ! runtime || ! shouldAnimate( context, runtime );

	if ( context.hideCursorWhenComplete && isComplete ) {
		context.cursorVisible = false;
		return;
	}

	if ( context.hideCursorWhilePaused && isPaused ) {
		context.cursorVisible = false;
		return;
	}

	context.cursorVisible = true;
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

	if ( context.pauseOnHover && runtime.isHovered ) {
		return false;
	}

	return ! isAnimationComplete( context, {
		items,
		fallbackText: context.fallbackText,
		loop: context.loop,
		transitionMode: context.transitionMode,
		startFromEmpty: context.startFromEmpty,
		startDelay: context.startDelay,
		startDelayMode: context.startDelayMode,
	} );
}

function getDelay( context: TypewriterContext ): number {
	return getNextStepDelay( context, {
		items: normalizeTypingItems( context.items ),
		fallbackText: context.fallbackText,
		loop: context.loop,
		transitionMode: context.transitionMode,
		startFromEmpty: context.startFromEmpty,
		typeDelay: context.typeDelay,
		deleteDelay: context.deleteDelay,
		pauseDelay: context.pauseDelay,
		startDelay: context.startDelay,
		startDelayMode: context.startDelayMode,
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
		runtime.wasActive = false;
		syncCursorVisibility( context, runtime );
		return;
	}

	if ( ! runtime.wasActive ) {
		Object.assign( context, armReentryDelay( context ) );
		runtime.wasActive = true;
	}

	syncCursorVisibility( context, runtime );

	runtime.timeoutId = window.setTimeout(
		withScope( () => {
			actions.advance();
			scheduleTick();
		} ),
		getDelay( context )
	);
}
