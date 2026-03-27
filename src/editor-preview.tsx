import { useEffect, useMemo, useRef, useState } from '@wordpress/element';

import {
	getEffectiveFallbackText,
	getEffectiveSummaryText,
	type TypewriterAttributes,
} from './shared';
import {
	advanceTypewriterFrame,
	armReentryDelay,
	createFallbackFrame,
	getNextStepDelay,
	isAnimationComplete,
	type TypewriterFrame,
} from './typewriter-engine';

type EditorPreviewProps = {
	attributes: TypewriterAttributes;
	isSelected: boolean;
	isPreviewPaused: boolean;
};

export default function EditorPreview( {
	attributes,
	isSelected,
	isPreviewPaused,
}: EditorPreviewProps ) {
	const {
		items,
		typeDelay,
		transitionMode,
		deleteDelay,
		pauseDelay,
		startDelay,
		startDelayMode,
		loop,
		startFromEmpty,
		showCursor,
		tagName,
	} = attributes;
	const TagName = tagName;
	const itemsKey = items.join( '\u0000' );
	const stableItems = useMemo(
		() => ( itemsKey ? itemsKey.split( '\u0000' ) : [] ),
		[ itemsKey ]
	);
	const visibleFallbackText = useMemo(
		() => getEffectiveFallbackText( attributes ),
		[ attributes ]
	);
	const seoSummary = useMemo(
		() => getEffectiveSummaryText( attributes ),
		[ attributes ]
	);
	const playbackKey = `${ itemsKey }::${ typeDelay }::${ transitionMode }::${ deleteDelay }::${ pauseDelay }::${ startDelay }::${ startDelayMode }::${ String(
		loop
	) }::${ String(
		startFromEmpty
	) }::${ visibleFallbackText }::${ seoSummary }`;
	const fallbackFrame = useMemo(
		() => createFallbackFrame( stableItems, visibleFallbackText ),
		[ stableItems, visibleFallbackText ]
	);
	const [ frame, setFrame ] = useState< TypewriterFrame >( fallbackFrame );
	const timeoutRef = useRef< number | null >( null );
	const previousIsSelectedRef = useRef( isSelected );
	const previousIsPreviewPlayingRef = useRef( false );
	const isPreviewPlaying = isSelected && ! isPreviewPaused;
	let previewState = 'idle';

	if ( isPreviewPlaying ) {
		previewState = 'playing';
	} else if ( isSelected ) {
		previewState = 'paused';
	}

	useEffect( () => {
		setFrame( fallbackFrame );
	}, [ fallbackFrame, playbackKey ] );

	useEffect( () => {
		const wasSelected = previousIsSelectedRef.current;

		previousIsSelectedRef.current = isSelected;

		if ( ! isSelected || ( isSelected && ! wasSelected ) ) {
			setFrame( fallbackFrame );
		}
	}, [ fallbackFrame, isSelected ] );

	useEffect( () => {
		const wasPreviewPlaying = previousIsPreviewPlayingRef.current;

		previousIsPreviewPlayingRef.current = isPreviewPlaying;

		if ( ! isPreviewPlaying || wasPreviewPlaying ) {
			return;
		}

		setFrame( ( currentFrame ) => armReentryDelay( currentFrame ) );
	}, [ isPreviewPlaying ] );

	useEffect( () => {
		return () => {
			if ( timeoutRef.current ) {
				window.clearTimeout( timeoutRef.current );
			}
		};
	}, [] );

	useEffect( () => {
		if ( timeoutRef.current ) {
			window.clearTimeout( timeoutRef.current );
			timeoutRef.current = null;
		}

		if (
			! isPreviewPlaying ||
			isAnimationComplete( frame, {
				items: stableItems,
				fallbackText: visibleFallbackText,
				loop,
				transitionMode,
				startFromEmpty,
				startDelay,
				startDelayMode,
			} )
		) {
			return;
		}

		timeoutRef.current = window.setTimeout(
			() => {
				setFrame( ( currentFrame ) =>
					advanceTypewriterFrame( currentFrame, {
						items: stableItems,
						fallbackText: visibleFallbackText,
						loop,
						transitionMode,
						startFromEmpty,
						startDelay,
						startDelayMode,
					} )
				);
			},
			getNextStepDelay( frame, {
				items: stableItems,
				fallbackText: visibleFallbackText,
				loop,
				transitionMode,
				startFromEmpty,
				typeDelay,
				deleteDelay,
				pauseDelay,
				startDelay,
				startDelayMode,
			} )
		);

		return () => {
			if ( timeoutRef.current ) {
				window.clearTimeout( timeoutRef.current );
				timeoutRef.current = null;
			}
		};
	}, [
		deleteDelay,
		frame,
		isPreviewPlaying,
		loop,
		pauseDelay,
		stableItems,
		startFromEmpty,
		startDelay,
		startDelayMode,
		typeDelay,
		transitionMode,
		visibleFallbackText,
	] );

	return (
		<div
			className="k-typewriter k-typewriter-editor"
			data-preview-state={ previewState }
		>
			<TagName
				aria-label={
					seoSummary && seoSummary !== visibleFallbackText
						? seoSummary
						: undefined
				}
				className="k-typewriter__text k-typewriter-editor__preview"
			>
				<span className="k-typewriter__content">
					{ frame.displayText }
				</span>
				{ showCursor && (
					<span
						aria-hidden="true"
						className="k-typewriter__cursor k-typewriter-editor__cursor"
					>
						|
					</span>
				) }
			</TagName>
		</div>
	);
}
