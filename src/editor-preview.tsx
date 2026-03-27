import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';

import {
	DEFAULT_ATTRIBUTES,
	getApproximateInlineWidthCh,
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
import { syncInlineWidth, syncReservedHeight } from './reserve-lines';

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
		reserveLines,
		verticalAlign,
		inlineLayout,
		inlineWidthMode,
		inlineWidthCh,
		textDirection,
		startFromEmpty,
		showCursor,
		cursorAnimationMode,
		cursorWidth,
		cursorHeight,
		cursorOffsetX,
		cursorOffsetY,
		cursorBlinkSpeed,
		cursorTransitionSpeed,
		hideCursorWhenComplete,
		pauseOnHover,
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
	const [ isHovered, setIsHovered ] = useState( false );
	const timeoutRef = useRef< number | null >( null );
	const previousIsSelectedRef = useRef( isSelected );
	const previousIsPreviewPlayingRef = useRef( false );
	const textRef = useRef< HTMLElement | null >( null );
	const previewStyle = useMemo( () => {
		let justifyContent = 'flex-start';
		const widthFallbackCh = getApproximateInlineWidthCh( attributes );

		if ( verticalAlign === 'middle' ) {
			justifyContent = 'center';
		} else if ( verticalAlign === 'bottom' ) {
			justifyContent = 'flex-end';
		}

		return {
			'--k-typewriter-reserve-lines': String( reserveLines ),
			'--k-typewriter-vertical-align': justifyContent,
			'--k-typewriter-cursor-width': `${ cursorWidth }em`,
			'--k-typewriter-cursor-height-scale': String(
				cursorHeight / DEFAULT_ATTRIBUTES.cursorHeight
			),
			'--k-typewriter-cursor-offset-x': `${ cursorOffsetX }em`,
			'--k-typewriter-cursor-offset-y': `${ cursorOffsetY }em`,
			'--k-typewriter-cursor-blink-speed': `${ cursorBlinkSpeed }ms`,
			'--k-typewriter-cursor-transition-speed': `${ cursorTransitionSpeed }ms`,
			...( widthFallbackCh === null
				? {}
				: {
						'--k-typewriter-inline-width': `${ widthFallbackCh }ch`,
				  } ),
		} as CSSProperties;
	}, [
		attributes,
		cursorBlinkSpeed,
		cursorHeight,
		cursorOffsetX,
		cursorOffsetY,
		cursorTransitionSpeed,
		cursorWidth,
		reserveLines,
		verticalAlign,
	] );
	const isPreviewComplete = isAnimationComplete( frame, {
		items: stableItems,
		fallbackText: visibleFallbackText,
		loop,
		transitionMode,
		startFromEmpty,
		startDelay,
		startDelayMode,
	} );
	const canPreviewPlay =
		isSelected && ! isPreviewPaused && ( ! pauseOnHover || ! isHovered );
	const isPreviewPlaying = canPreviewPlay && ! isPreviewComplete;
	const isCursorVisible =
		showCursor &&
		( isPreviewPlaying ||
			( isPreviewComplete && ! hideCursorWhenComplete ) );
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
		return syncReservedHeight( textRef.current );
	}, [ reserveLines, tagName ] );

	useEffect( () => {
		return syncInlineWidth( textRef.current, {
			inlineLayout,
			mode: inlineWidthMode,
			items: stableItems,
			fallbackText: visibleFallbackText,
			showCursor,
		} );
	}, [
		inlineLayout,
		inlineWidthMode,
		inlineWidthCh,
		showCursor,
		stableItems,
		tagName,
		visibleFallbackText,
	] );

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
			onMouseEnter={ () => setIsHovered( true ) }
			onMouseLeave={ () => setIsHovered( false ) }
		>
			<TagName
				aria-label={
					seoSummary && seoSummary !== visibleFallbackText
						? seoSummary
						: undefined
				}
				className="k-typewriter__text k-typewriter-editor__preview"
				dir={ textDirection === 'auto' ? undefined : textDirection }
				ref={ textRef }
				style={ previewStyle }
			>
				<span className="k-typewriter__line">
					<span className="k-typewriter__content">
						{ frame.displayText }
					</span>
					{ isCursorVisible && (
						<span
							aria-hidden="true"
							className={ `k-typewriter__cursor k-typewriter-editor__cursor ${
								cursorAnimationMode === 'transition'
									? 'k-typewriter__cursor--transition'
									: 'k-typewriter__cursor--blink'
							}` }
						/>
					) }
				</span>
			</TagName>
		</div>
	);
}
