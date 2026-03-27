import {
	BlockControls,
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	SelectControl,
	TextareaControl,
	TextControl,
	ToolbarButton,
	ToolbarGroup,
	ToggleControl,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

import './editor.scss';

import EditorPreview from './editor-preview';
import {
	CURSOR_ANIMATION_MODES,
	getEffectiveFallbackText,
	getEffectiveSummaryText,
	INLINE_WIDTH_MODES,
	normalizeAttributes,
	START_DELAY_MODES,
	type ContentSourceMode,
	type CursorAnimationMode,
	type InlineWidthMode,
	type TextDirection,
	type TypewriterAttributes,
	TEXT_DIRECTIONS,
	TRANSITION_MODES,
	VALID_TAG_NAMES,
	VERTICAL_ALIGNMENTS,
} from './shared';

const tagNameOptions = VALID_TAG_NAMES.map( ( tagName ) => ( {
	label: tagName.toUpperCase(),
	value: tagName,
} ) );

const startDelayModeLabels = {
	'first-start': __( 'First start only', 'k-typewriter' ),
	'every-cycle': __( 'Every cycle', 'k-typewriter' ),
	'every-reentry': __( 'Every re-entry', 'k-typewriter' ),
} as const;

const startDelayModeOptions = START_DELAY_MODES.map( ( value ) => ( {
	label: startDelayModeLabels[ value ],
	value,
} ) );

const transitionModeLabels = {
	backspace: __( 'Backspace previous message', 'k-typewriter' ),
	restart: __( 'Restart from empty', 'k-typewriter' ),
} as const;

const transitionModeOptions = TRANSITION_MODES.map( ( value ) => ( {
	label: transitionModeLabels[ value ],
	value,
} ) );

const verticalAlignmentLabels = {
	top: __( 'Top', 'k-typewriter' ),
	middle: __( 'Middle', 'k-typewriter' ),
	bottom: __( 'Bottom', 'k-typewriter' ),
} as const;

const verticalAlignmentOptions = VERTICAL_ALIGNMENTS.map( ( value ) => ( {
	label: verticalAlignmentLabels[ value ],
	value,
} ) );

const textDirectionLabels = {
	auto: __( 'Auto', 'k-typewriter' ),
	ltr: __( 'Left to right', 'k-typewriter' ),
	rtl: __( 'Right to left', 'k-typewriter' ),
} as const;

const textDirectionOptions = TEXT_DIRECTIONS.map( ( value ) => ( {
	label: textDirectionLabels[ value ],
	value,
} ) );

const inlineWidthModeLabels = {
	auto: __( 'Auto', 'k-typewriter' ),
	characters: __( 'Characters (ch)', 'k-typewriter' ),
	measure: __( 'Measure longest message', 'k-typewriter' ),
} as const;

const inlineWidthModeOptions = INLINE_WIDTH_MODES.map( ( value ) => ( {
	label: inlineWidthModeLabels[ value ],
	value,
} ) );

const cursorAnimationModeLabels = {
	blink: __( 'Blink', 'k-typewriter' ),
	transition: __( 'Fade transition', 'k-typewriter' ),
} as const;

const cursorAnimationModeOptions = CURSOR_ANIMATION_MODES.map( ( value ) => ( {
	label: cursorAnimationModeLabels[ value ],
	value,
} ) );

const contentSourceOptions = [
	{
		label: __( 'Auto-generated', 'k-typewriter' ),
		value: 'auto',
	},
	{
		label: __( 'Custom override', 'k-typewriter' ),
		value: 'custom',
	},
] as const;

export default function Edit( {
	attributes,
	isSelected,
	setAttributes,
}: BlockEditProps< TypewriterAttributes > ) {
	const normalizedAttributes = normalizeAttributes( attributes );
	const [ isPreviewPaused, setIsPreviewPaused ] = useState( false );
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
		cursorOffsetX,
		cursorOffsetY,
		cursorBlinkSpeed,
		cursorTransitionSpeed,
		hideCursorWhenComplete,
		startOnView,
		pauseOnHover,
		fallbackMode,
		fallbackText,
		summaryMode,
		summaryText,
		tagName,
	} = normalizedAttributes;
	const blockProps = useBlockProps( {
		className: inlineLayout ? 'is-inline-layout' : undefined,
	} );
	const isPreviewPlaying = isSelected && ! isPreviewPaused;
	const effectiveFallbackText =
		getEffectiveFallbackText( normalizedAttributes );
	const effectiveSummaryText =
		getEffectiveSummaryText( normalizedAttributes );
	const fallbackSourceHelp =
		fallbackMode === 'auto'
			? __( 'Auto uses the first message.', 'k-typewriter' )
			: __(
					'Custom mode lets you keep a different first-paint message.',
					'k-typewriter'
			  );
	const summarySourceHelp =
		summaryMode === 'auto'
			? __(
					'Auto combines every message into a single summary.',
					'k-typewriter'
			  )
			: __(
					'Custom mode lets you write a shorter or more intentional summary.',
					'k-typewriter'
			  );

	useEffect( () => {
		if ( ! isSelected ) {
			setIsPreviewPaused( false );
		}
	}, [ isSelected ] );

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={
							isPreviewPlaying
								? 'controls-pause'
								: 'controls-play'
						}
						isPressed={ isPreviewPaused }
						label={
							isPreviewPlaying
								? __( 'Pause preview', 'k-typewriter' )
								: __( 'Play preview', 'k-typewriter' )
						}
						onClick={ () =>
							setIsPreviewPaused(
								( currentIsPreviewPaused ) =>
									! currentIsPreviewPaused
							)
						}
					/>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody
					initialOpen={ true }
					title={ __( 'Content', 'k-typewriter' ) }
				>
					<TextareaControl
						help={ __(
							'Write one message per line. Empty lines are ignored.',
							'k-typewriter'
						) }
						label={ __( 'Messages', 'k-typewriter' ) }
						rows={ 6 }
						value={ items.join( '\n' ) }
						onChange={ ( value ) =>
							setAttributes( {
								items: value
									.split( /\r?\n/u )
									.map( ( item ) => item.trim() )
									.filter( Boolean ),
							} )
						}
					/>
					<SelectControl
						help={ __(
							'Auto follows the current site or page direction. Choose LTR or RTL only when you want to override it.',
							'k-typewriter'
						) }
						label={ __( 'Text direction', 'k-typewriter' ) }
						options={ textDirectionOptions }
						value={ textDirection }
						onChange={ ( value ) =>
							setAttributes( {
								textDirection: value as TextDirection,
							} )
						}
					/>
					<ToggleControl
						help={ __(
							'Shrink the block to its content so it fits more naturally inside groups and flex layouts.',
							'k-typewriter'
						) }
						label={ __( 'Inline layout', 'k-typewriter' ) }
						checked={ inlineLayout }
						onChange={ ( value ) =>
							setAttributes( { inlineLayout: value } )
						}
					/>
					{ ! inlineLayout ? null : (
						<>
							<SelectControl
								help={ __(
									'Auto lets the block grow naturally. Characters uses an approximate ch width. Measure longest message uses the current font to reserve a steadier inline width.',
									'k-typewriter'
								) }
								label={ __(
									'Inline width reserve',
									'k-typewriter'
								) }
								options={ inlineWidthModeOptions }
								value={ inlineWidthMode }
								onChange={ ( value ) =>
									setAttributes( {
										inlineWidthMode:
											value as InlineWidthMode,
									} )
								}
							/>
							{ inlineWidthMode !== 'characters' ? null : (
								<RangeControl
									help={ __(
										'Reserve width using an approximate number of character columns.',
										'k-typewriter'
									) }
									label={ __(
										'Width in ch',
										'k-typewriter'
									) }
									max={ 80 }
									min={ 4 }
									step={ 1 }
									value={ inlineWidthCh }
									onChange={ ( value ) =>
										setAttributes( {
											inlineWidthCh:
												value ?? inlineWidthCh,
										} )
									}
								/>
							) }
						</>
					) }
					<SelectControl
						help={ __(
							'Choose a semantic text tag. Use H1 only when this block is the main page heading.',
							'k-typewriter'
						) }
						label={ __( 'Markup tag', 'k-typewriter' ) }
						options={ tagNameOptions }
						value={ tagName }
						onChange={ ( value ) =>
							setAttributes( {
								tagName:
									value as TypewriterAttributes[ 'tagName' ],
							} )
						}
					/>
					<RangeControl
						help={ __(
							'Reserve extra line height to reduce layout shift when longer messages wrap.',
							'k-typewriter'
						) }
						label={ __( 'Reserve lines', 'k-typewriter' ) }
						max={ 6 }
						min={ 1 }
						step={ 1 }
						value={ reserveLines }
						onChange={ ( value ) =>
							setAttributes( {
								reserveLines: value ?? reserveLines,
							} )
						}
					/>
					{ reserveLines <= 1 ? null : (
						<SelectControl
							help={ __(
								'Choose how the animated line sits inside the reserved height.',
								'k-typewriter'
							) }
							label={ __( 'Vertical align', 'k-typewriter' ) }
							options={ verticalAlignmentOptions }
							value={ verticalAlign }
							onChange={ ( value ) =>
								setAttributes( {
									verticalAlign:
										value as TypewriterAttributes[ 'verticalAlign' ],
								} )
							}
						/>
					) }
				</PanelBody>
				<PanelBody
					initialOpen={ false }
					title={ __( 'Fallback & Summary', 'k-typewriter' ) }
				>
					<div className="k-typewriter-editor__settings-section">
						<p className="k-typewriter-editor__settings-heading">
							{ __( 'Visible fallback', 'k-typewriter' ) }
						</p>
						<p className="k-typewriter-editor__settings-description">
							{ __(
								'Shown before animation starts, with reduced motion, and without JavaScript.',
								'k-typewriter'
							) }
						</p>
					</div>
					<SelectControl
						help={ fallbackSourceHelp }
						label={ __(
							'Visible fallback source',
							'k-typewriter'
						) }
						options={ contentSourceOptions }
						value={ fallbackMode }
						onChange={ ( value ) =>
							setAttributes( {
								fallbackMode: value as ContentSourceMode,
							} )
						}
					/>
					{ fallbackMode !== 'custom' ? null : (
						<TextControl
							help={ __(
								'Leave this empty to fall back to the first message.',
								'k-typewriter'
							) }
							label={ __( 'Fallback override', 'k-typewriter' ) }
							value={ fallbackText }
							onChange={ ( value ) =>
								setAttributes( { fallbackText: value } )
							}
						/>
					) }
					<div className="k-typewriter-editor__effective-card">
						<p className="k-typewriter-editor__effective-label">
							{ __(
								'Effective fallback preview:',
								'k-typewriter'
							) }
						</p>
						<p className="k-typewriter-editor__effective-value">
							{ effectiveFallbackText }
						</p>
					</div>
					<div className="k-typewriter-editor__settings-divider" />
					<div className="k-typewriter-editor__settings-section">
						<p className="k-typewriter-editor__settings-heading">
							{ __( 'Non-visual summary', 'k-typewriter' ) }
						</p>
						<p className="k-typewriter-editor__settings-description">
							{ __(
								'Used by assistive technology when you want a fuller summary of every message.',
								'k-typewriter'
							) }
						</p>
					</div>
					<SelectControl
						help={ summarySourceHelp }
						label={ __( 'Summary source', 'k-typewriter' ) }
						options={ contentSourceOptions }
						value={ summaryMode }
						onChange={ ( value ) =>
							setAttributes( {
								summaryMode: value as ContentSourceMode,
							} )
						}
					/>
					{ summaryMode !== 'custom' ? null : (
						<TextareaControl
							help={ __(
								'Leave this empty to auto-generate the summary from every message.',
								'k-typewriter'
							) }
							label={ __( 'Summary override', 'k-typewriter' ) }
							rows={ 3 }
							value={ summaryText }
							onChange={ ( value ) =>
								setAttributes( { summaryText: value } )
							}
						/>
					) }
					<div className="k-typewriter-editor__effective-card">
						<p className="k-typewriter-editor__effective-label">
							{ __(
								'Effective non-visual summary:',
								'k-typewriter'
							) }
						</p>
						<p className="k-typewriter-editor__effective-value">
							{ effectiveSummaryText }
						</p>
					</div>
				</PanelBody>
				<PanelBody
					initialOpen={ true }
					title={ __( 'Animation', 'k-typewriter' ) }
				>
					<RangeControl
						label={ __( 'Typing delay (ms)', 'k-typewriter' ) }
						max={ 300 }
						min={ 20 }
						step={ 10 }
						value={ typeDelay }
						onChange={ ( value ) =>
							setAttributes( { typeDelay: value ?? typeDelay } )
						}
					/>
					<SelectControl
						help={ __(
							'Choose whether each new message backspaces the previous one or restarts from an empty state.',
							'k-typewriter'
						) }
						label={ __( 'Transition mode', 'k-typewriter' ) }
						options={ transitionModeOptions }
						value={ transitionMode }
						onChange={ ( value ) =>
							setAttributes( {
								transitionMode:
									value as TypewriterAttributes[ 'transitionMode' ],
							} )
						}
					/>
					{ transitionMode !== 'backspace' ? null : (
						<RangeControl
							label={ __(
								'Deleting delay (ms)',
								'k-typewriter'
							) }
							max={ 240 }
							min={ 10 }
							step={ 10 }
							value={ deleteDelay }
							onChange={ ( value ) =>
								setAttributes( {
									deleteDelay: value ?? deleteDelay,
								} )
							}
						/>
					) }
					<RangeControl
						label={ __( 'Pause delay (ms)', 'k-typewriter' ) }
						max={ 4000 }
						min={ 200 }
						step={ 100 }
						value={ pauseDelay }
						onChange={ ( value ) =>
							setAttributes( {
								pauseDelay: value ?? pauseDelay,
							} )
						}
					/>
					<SelectControl
						help={ __(
							'Choose when the extra delay should run before animation continues.',
							'k-typewriter'
						) }
						label={ __( 'Start delay mode', 'k-typewriter' ) }
						options={ startDelayModeOptions }
						value={ startDelayMode }
						onChange={ ( value ) =>
							setAttributes( {
								startDelayMode:
									value as TypewriterAttributes[ 'startDelayMode' ],
							} )
						}
					/>
					<RangeControl
						label={ __( 'Start delay (ms)', 'k-typewriter' ) }
						max={ 5000 }
						min={ 0 }
						step={ 100 }
						value={ startDelay }
						onChange={ ( value ) =>
							setAttributes( {
								startDelay: value ?? startDelay,
							} )
						}
					/>
					<ToggleControl
						help={ __(
							'Clear the static fallback and type the first message from an empty state when animation begins.',
							'k-typewriter'
						) }
						label={ __(
							'Type first message from empty',
							'k-typewriter'
						) }
						checked={ startFromEmpty }
						onChange={ ( value ) =>
							setAttributes( { startFromEmpty: value } )
						}
					/>
					<ToggleControl
						help={ __(
							'Turn this off to stop on the final message instead of looping back to the beginning.',
							'k-typewriter'
						) }
						label={ __( 'Loop messages', 'k-typewriter' ) }
						checked={ loop }
						onChange={ ( value ) =>
							setAttributes( { loop: value } )
						}
					/>
					<ToggleControl
						label={ __( 'Start when visible', 'k-typewriter' ) }
						checked={ startOnView }
						onChange={ ( value ) =>
							setAttributes( { startOnView: value } )
						}
					/>
					<ToggleControl
						help={ __(
							'Pause the animation while the pointer is over the block.',
							'k-typewriter'
						) }
						label={ __( 'Pause on hover', 'k-typewriter' ) }
						checked={ pauseOnHover }
						onChange={ ( value ) =>
							setAttributes( { pauseOnHover: value } )
						}
					/>
				</PanelBody>
				<PanelBody
					initialOpen={ false }
					title={ __( 'Cursor', 'k-typewriter' ) }
				>
					<ToggleControl
						label={ __( 'Show cursor', 'k-typewriter' ) }
						checked={ showCursor }
						onChange={ ( value ) =>
							setAttributes( { showCursor: value } )
						}
					/>
					{ ! showCursor ? null : (
						<>
							<SelectControl
								help={ __(
									'Blink gives a crisp on-off cursor. Fade transition keeps the cursor softer and more fluid.',
									'k-typewriter'
								) }
								label={ __(
									'Cursor animation',
									'k-typewriter'
								) }
								options={ cursorAnimationModeOptions }
								value={ cursorAnimationMode }
								onChange={ ( value ) =>
									setAttributes( {
										cursorAnimationMode:
											value as CursorAnimationMode,
									} )
								}
							/>
							<RangeControl
								help={ __(
									'Adjust the cursor bar thickness relative to the current font size.',
									'k-typewriter'
								) }
								label={ __(
									'Cursor thickness',
									'k-typewriter'
								) }
								max={ 0.24 }
								min={ 0.04 }
								step={ 0.01 }
								value={ cursorWidth }
								onChange={ ( value ) =>
									setAttributes( {
										cursorWidth: value ?? cursorWidth,
									} )
								}
							/>
							{ cursorAnimationMode === 'blink' ? (
								<RangeControl
									help={ __(
										'Adjust how quickly the cursor blinks.',
										'k-typewriter'
									) }
									label={ __(
										'Cursor blink speed (ms)',
										'k-typewriter'
									) }
									max={ 2000 }
									min={ 200 }
									step={ 100 }
									value={ cursorBlinkSpeed }
									onChange={ ( value ) =>
										setAttributes( {
											cursorBlinkSpeed:
												value ?? cursorBlinkSpeed,
										} )
									}
								/>
							) : (
								<RangeControl
									help={ __(
										'Adjust how quickly the cursor fades in and out.',
										'k-typewriter'
									) }
									label={ __(
										'Cursor transition speed (ms)',
										'k-typewriter'
									) }
									max={ 2000 }
									min={ 200 }
									step={ 100 }
									value={ cursorTransitionSpeed }
									onChange={ ( value ) =>
										setAttributes( {
											cursorTransitionSpeed:
												value ?? cursorTransitionSpeed,
										} )
									}
								/>
							) }
							<RangeControl
								help={ __(
									'Move the cursor slightly left or right to match your font better.',
									'k-typewriter'
								) }
								label={ __(
									'Cursor horizontal offset',
									'k-typewriter'
								) }
								max={ 0.3 }
								min={ -0.3 }
								step={ 0.01 }
								value={ cursorOffsetX }
								onChange={ ( value ) =>
									setAttributes( {
										cursorOffsetX: value ?? cursorOffsetX,
									} )
								}
							/>
							<RangeControl
								help={ __(
									'Move the cursor slightly up or down to match your font better.',
									'k-typewriter'
								) }
								label={ __(
									'Cursor vertical offset',
									'k-typewriter'
								) }
								max={ 0.3 }
								min={ -0.3 }
								step={ 0.01 }
								value={ cursorOffsetY }
								onChange={ ( value ) =>
									setAttributes( {
										cursorOffsetY: value ?? cursorOffsetY,
									} )
								}
							/>
							<ToggleControl
								label={ __(
									'Hide cursor when complete',
									'k-typewriter'
								) }
								checked={ hideCursorWhenComplete }
								onChange={ ( value ) =>
									setAttributes( {
										hideCursorWhenComplete: value,
									} )
								}
							/>
						</>
					) }
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<EditorPreview
					attributes={ normalizedAttributes }
					isPreviewPaused={ isPreviewPaused }
					isSelected={ Boolean( isSelected ) }
				/>
			</div>
		</>
	);
}
