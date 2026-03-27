import { useEffect, useMemo, useRef, useState } from '@wordpress/element';

import type { TypewriterAttributes } from './shared';
import {
	advanceFrame,
	createFallbackFrame,
	getFrameDelay,
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
		deleteDelay,
		pauseDelay,
		loop,
		showCursor,
		tagName,
	} = attributes;
	const TagName = tagName;
	const itemsKey = items.join( '\u0000' );
	const stableItems = useMemo(
		() => ( itemsKey ? itemsKey.split( '\u0000' ) : [] ),
		[ itemsKey ]
	);
	const playbackKey = `${ itemsKey }::${ typeDelay }::${ deleteDelay }::${ pauseDelay }::${ String(
		loop
	) }`;
	const fallbackFrame = useMemo(
		() => createFallbackFrame( stableItems ),
		[ stableItems ]
	);
	const [ frame, setFrame ] = useState< TypewriterFrame >( fallbackFrame );
	const timeoutRef = useRef< number | null >( null );
	const previousIsSelectedRef = useRef( isSelected );
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
				loop,
			} )
		) {
			return;
		}

		timeoutRef.current = window.setTimeout(
			() => {
				setFrame( ( currentFrame ) =>
					advanceFrame( currentFrame, {
						items: stableItems,
						loop,
					} )
				);
			},
			getFrameDelay( frame, {
				items: stableItems,
				loop,
				typeDelay,
				deleteDelay,
				pauseDelay,
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
		typeDelay,
	] );

	return (
		<div
			className="k-typewriter k-typewriter-editor"
			data-preview-state={ previewState }
		>
			<TagName className="k-typewriter__text k-typewriter-editor__preview">
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
