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
	INLINE_WIDTH_CH_INPUT_MAX,
	INLINE_WIDTH_CH_MIN,
	INLINE_WIDTH_CH_SLIDER_MAX,
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
	'first-start': __( 'First start only', 'sbs-typing-effect-block' ),
	'every-cycle': __( 'Every cycle', 'sbs-typing-effect-block' ),
	'every-reentry': __( 'Every re-entry', 'sbs-typing-effect-block' ),
} as const;

const startDelayModeOptions = START_DELAY_MODES.map( ( value ) => ( {
	label: startDelayModeLabels[ value ],
	value,
} ) );

const transitionModeLabels = {
	backspace: __( 'Backspace previous message', 'sbs-typing-effect-block' ),
	restart: __( 'Restart from empty', 'sbs-typing-effect-block' ),
} as const;

const transitionModeOptions = TRANSITION_MODES.map( ( value ) => ( {
	label: transitionModeLabels[ value ],
	value,
} ) );

const verticalAlignmentLabels = {
	top: __( 'Top', 'sbs-typing-effect-block' ),
	middle: __( 'Middle', 'sbs-typing-effect-block' ),
	bottom: __( 'Bottom', 'sbs-typing-effect-block' ),
} as const;

const verticalAlignmentOptions = VERTICAL_ALIGNMENTS.map( ( value ) => ( {
	label: verticalAlignmentLabels[ value ],
	value,
} ) );

const textDirectionLabels = {
	auto: __( 'Auto', 'sbs-typing-effect-block' ),
	ltr: __( 'Left to right', 'sbs-typing-effect-block' ),
	rtl: __( 'Right to left', 'sbs-typing-effect-block' ),
} as const;

const textDirectionOptions = TEXT_DIRECTIONS.map( ( value ) => ( {
	label: textDirectionLabels[ value ],
	value,
} ) );

const inlineWidthModeLabels = {
	auto: __( 'Auto', 'sbs-typing-effect-block' ),
	characters: __( 'Characters (ch)', 'sbs-typing-effect-block' ),
	measure: __( 'Measure longest message', 'sbs-typing-effect-block' ),
} as const;

const inlineWidthModeOptions = INLINE_WIDTH_MODES.map( ( value ) => ( {
	label: inlineWidthModeLabels[ value ],
	value,
} ) );

const cursorAnimationModeLabels = {
	blink: __( 'Blink', 'sbs-typing-effect-block' ),
	transition: __( 'Fade transition', 'sbs-typing-effect-block' ),
} as const;

const cursorAnimationModeOptions = CURSOR_ANIMATION_MODES.map( ( value ) => ( {
	label: cursorAnimationModeLabels[ value ],
	value,
} ) );

const contentSourceOptions = [
	{
		label: __( 'Auto-generated', 'sbs-typing-effect-block' ),
		value: 'auto',
	},
	{
		label: __( 'Custom override', 'sbs-typing-effect-block' ),
		value: 'custom',
	},
] as const;

const messagesPlaceholder = [
	__( 'Add one message per line.', 'sbs-typing-effect-block' ),
	__( 'Animate headlines in any language.', 'sbs-typing-effect-block' ),
	__( 'Keep the first paint readable.', 'sbs-typing-effect-block' ),
].join( '\n' );

const fallbackPlaceholder = __(
	'Optional custom first-paint fallback text',
	'sbs-typing-effect-block'
);

const summaryPlaceholder = __(
	'Optional non-visual summary for assistive technology',
	'sbs-typing-effect-block'
);

const emptyPreviewPlaceholder = __(
	'Add one message per line to preview the animation.',
	'sbs-typing-effect-block'
);

export default function Edit( {
	attributes,
	isSelected,
	setAttributes,
}: BlockEditProps< TypewriterAttributes > ) {
	const normalizedAttributes = normalizeAttributes( attributes );
	const [ isPreviewPaused, setIsPreviewPaused ] = useState( false );
	const [ isEditingMessages, setIsEditingMessages ] = useState( false );
	const [ inlineWidthChInput, setInlineWidthChInput ] = useState( () =>
		String( normalizedAttributes.inlineWidthCh )
	);
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
		keepCursorAnimationOnComplete,
		startOnView,
		replayOnReentry,
		pauseOnHover,
		fallbackMode,
		fallbackText,
		summaryMode,
		summaryText,
		tagName,
	} = normalizedAttributes;
	const [ itemsDraft, setItemsDraft ] = useState( () => items.join( '\n' ) );
	const blockProps = useBlockProps( {
		className: inlineLayout ? 'is-inline-layout' : undefined,
	} );
	const isPreviewPlaying = isSelected && ! isPreviewPaused;
	const effectiveFallbackText =
		getEffectiveFallbackText( normalizedAttributes );
	const effectiveSummaryText =
		getEffectiveSummaryText( normalizedAttributes );
	const effectiveFallbackPreview =
		effectiveFallbackText ||
		__(
			'Uses the first message when available.',
			'sbs-typing-effect-block'
		);
	const effectiveSummaryPreview =
		effectiveSummaryText ||
		__(
			'Add messages to generate a non-visual summary.',
			'sbs-typing-effect-block'
		);
	const fallbackSourceHelp =
		fallbackMode === 'auto'
			? __( 'Auto uses the first message.', 'sbs-typing-effect-block' )
			: __(
					'Custom mode lets you keep a different first-paint message.',
					'sbs-typing-effect-block'
			  );
	const summarySourceHelp =
		summaryMode === 'auto'
			? __(
					'Auto combines every message into a single summary.',
					'sbs-typing-effect-block'
			  )
			: __(
					'Custom mode lets you write a shorter or more intentional summary.',
					'sbs-typing-effect-block'
			  );

	useEffect( () => {
		if ( ! isSelected ) {
			setIsPreviewPaused( false );
		}
	}, [ isSelected ] );

	useEffect( () => {
		if ( ! isEditingMessages ) {
			setItemsDraft( items.join( '\n' ) );
		}
	}, [ isEditingMessages, items ] );

	useEffect( () => {
		setInlineWidthChInput( String( inlineWidthCh ) );
	}, [ inlineWidthCh ] );

	const parseMessageDraft = ( value: string ) =>
		value
			.split( /\r?\n/u )
			.map( ( item ) => item.trim() )
			.filter( Boolean );

	const stopTextareaEnterPropagation = (
		event: KeyboardEvent & { stopPropagation: () => void }
	) => {
		if ( event.key === 'Enter' ) {
			event.stopPropagation();
		}
	};

	const commitInlineWidthInput = ( value: string ) => {
		const numericValue = Number.parseInt( value, 10 );

		if ( ! Number.isFinite( numericValue ) ) {
			setInlineWidthChInput( String( inlineWidthCh ) );
			return;
		}

		const nextValue = Math.min(
			INLINE_WIDTH_CH_INPUT_MAX,
			Math.max( INLINE_WIDTH_CH_MIN, numericValue )
		);

		setAttributes( { inlineWidthCh: nextValue } );
		setInlineWidthChInput( String( nextValue ) );
	};

	const syncInlineWidthInput = ( value: string ) => {
		setInlineWidthChInput( value );

		const numericValue = Number.parseInt( value, 10 );

		if ( ! Number.isFinite( numericValue ) ) {
			return;
		}

		setAttributes( {
			inlineWidthCh: Math.min(
				INLINE_WIDTH_CH_INPUT_MAX,
				Math.max( INLINE_WIDTH_CH_MIN, numericValue )
			),
		} );
	};

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
								? __(
										'Pause preview',
										'sbs-typing-effect-block'
								  )
								: __(
										'Play preview',
										'sbs-typing-effect-block'
								  )
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
					title={ __( 'Content', 'sbs-typing-effect-block' ) }
				>
					<TextareaControl
						help={ __(
							'Write one message per line. Empty lines are ignored.',
							'sbs-typing-effect-block'
						) }
						label={ __( 'Messages', 'sbs-typing-effect-block' ) }
						placeholder={ messagesPlaceholder }
						rows={ 6 }
						value={ itemsDraft }
						onBlur={ () => {
							const nextItems = parseMessageDraft( itemsDraft );
							setIsEditingMessages( false );
							setAttributes( { items: nextItems } );
							setItemsDraft( nextItems.join( '\n' ) );
						} }
						onChange={ ( value ) => {
							setItemsDraft( value );
							setAttributes( {
								items: parseMessageDraft( value ),
							} );
						} }
						onFocus={ () => setIsEditingMessages( true ) }
						onKeyDown={ stopTextareaEnterPropagation }
					/>
					<SelectControl
						help={ __(
							'Auto follows the current site or page direction. Choose LTR or RTL only when you want to override it.',
							'sbs-typing-effect-block'
						) }
						label={ __(
							'Text direction',
							'sbs-typing-effect-block'
						) }
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
							'sbs-typing-effect-block'
						) }
						label={ __(
							'Inline layout',
							'sbs-typing-effect-block'
						) }
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
									'sbs-typing-effect-block'
								) }
								label={ __(
									'Inline width reserve',
									'sbs-typing-effect-block'
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
								<>
									<RangeControl
										help={ __(
											'The slider goes up to 80ch. Enter a larger number directly when you need a wider inline reserve.',
											'sbs-typing-effect-block'
										) }
										label={ __(
											'Width in ch',
											'sbs-typing-effect-block'
										) }
										max={ INLINE_WIDTH_CH_SLIDER_MAX }
										min={ INLINE_WIDTH_CH_MIN }
										step={ 1 }
										value={ Math.min(
											inlineWidthCh,
											INLINE_WIDTH_CH_SLIDER_MAX
										) }
										onChange={ ( value ) =>
											setAttributes( {
												inlineWidthCh:
													value ?? inlineWidthCh,
											} )
										}
									/>
									<TextControl
										help={ __(
											'Use any value from 1 and up when you want a larger fixed width than the slider range.',
											'sbs-typing-effect-block'
										) }
										label={ __(
											'Width in ch input',
											'sbs-typing-effect-block'
										) }
										type="number"
										min={ INLINE_WIDTH_CH_MIN }
										value={ inlineWidthChInput }
										onBlur={ () =>
											commitInlineWidthInput(
												inlineWidthChInput
											)
										}
										onChange={ syncInlineWidthInput }
									/>
								</>
							) }
						</>
					) }
					<SelectControl
						help={ __(
							'Choose a semantic text tag. Use H1 only when this block is the main page heading.',
							'sbs-typing-effect-block'
						) }
						label={ __( 'Markup tag', 'sbs-typing-effect-block' ) }
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
							'Reserve extra line height so the layout stays steadier when longer messages wrap.',
							'sbs-typing-effect-block'
						) }
						label={ __(
							'Reserve lines',
							'sbs-typing-effect-block'
						) }
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
								'sbs-typing-effect-block'
							) }
							label={ __(
								'Vertical align',
								'sbs-typing-effect-block'
							) }
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
					title={ __(
						'Fallback & Summary',
						'sbs-typing-effect-block'
					) }
				>
					<div className="k-typewriter-editor__settings-section">
						<p className="k-typewriter-editor__settings-heading">
							{ __(
								'Visible fallback',
								'sbs-typing-effect-block'
							) }
						</p>
						<p className="k-typewriter-editor__settings-description">
							{ __(
								'Shown before animation starts, with reduced motion, and without JavaScript.',
								'sbs-typing-effect-block'
							) }
						</p>
					</div>
					<SelectControl
						help={ fallbackSourceHelp }
						label={ __(
							'Visible fallback source',
							'sbs-typing-effect-block'
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
								'sbs-typing-effect-block'
							) }
							label={ __(
								'Fallback override',
								'sbs-typing-effect-block'
							) }
							placeholder={ fallbackPlaceholder }
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
								'sbs-typing-effect-block'
							) }
						</p>
						<p className="k-typewriter-editor__effective-value">
							{ effectiveFallbackPreview }
						</p>
					</div>
					<div className="k-typewriter-editor__settings-divider" />
					<div className="k-typewriter-editor__settings-section">
						<p className="k-typewriter-editor__settings-heading">
							{ __(
								'Non-visual summary',
								'sbs-typing-effect-block'
							) }
						</p>
						<p className="k-typewriter-editor__settings-description">
							{ __(
								'Used by assistive technology when you want a fuller summary of every message.',
								'sbs-typing-effect-block'
							) }
						</p>
					</div>
					<SelectControl
						help={ summarySourceHelp }
						label={ __(
							'Summary source',
							'sbs-typing-effect-block'
						) }
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
								'sbs-typing-effect-block'
							) }
							label={ __(
								'Summary override',
								'sbs-typing-effect-block'
							) }
							onKeyDown={ stopTextareaEnterPropagation }
							placeholder={ summaryPlaceholder }
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
								'sbs-typing-effect-block'
							) }
						</p>
						<p className="k-typewriter-editor__effective-value">
							{ effectiveSummaryPreview }
						</p>
					</div>
				</PanelBody>
				<PanelBody
					initialOpen={ true }
					title={ __( 'Animation', 'sbs-typing-effect-block' ) }
				>
					<RangeControl
						label={ __(
							'Typing delay (ms)',
							'sbs-typing-effect-block'
						) }
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
							'sbs-typing-effect-block'
						) }
						label={ __(
							'Transition mode',
							'sbs-typing-effect-block'
						) }
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
								'sbs-typing-effect-block'
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
						label={ __(
							'Pause delay (ms)',
							'sbs-typing-effect-block'
						) }
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
							'sbs-typing-effect-block'
						) }
						label={ __(
							'Start delay mode',
							'sbs-typing-effect-block'
						) }
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
						label={ __(
							'Start delay (ms)',
							'sbs-typing-effect-block'
						) }
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
							'sbs-typing-effect-block'
						) }
						label={ __(
							'Type first message from empty',
							'sbs-typing-effect-block'
						) }
						checked={ startFromEmpty }
						onChange={ ( value ) =>
							setAttributes( { startFromEmpty: value } )
						}
					/>
					<ToggleControl
						help={ __(
							'Turn this off to stop on the final message instead of looping back to the beginning.',
							'sbs-typing-effect-block'
						) }
						label={ __(
							'Loop messages',
							'sbs-typing-effect-block'
						) }
						checked={ loop }
						onChange={ ( value ) =>
							setAttributes( { loop: value } )
						}
					/>
					{ loop || ! showCursor ? null : (
						<ToggleControl
							help={ __(
								'Keep the cursor animation running after the final message has finished.',
								'sbs-typing-effect-block'
							) }
							label={ __(
								'Keep cursor animation when complete',
								'sbs-typing-effect-block'
							) }
							checked={ keepCursorAnimationOnComplete }
							onChange={ ( value ) =>
								setAttributes( {
									keepCursorAnimationOnComplete: value,
								} )
							}
						/>
					) }
					<ToggleControl
						label={ __(
							'Start when visible',
							'sbs-typing-effect-block'
						) }
						checked={ startOnView }
						onChange={ ( value ) =>
							setAttributes( { startOnView: value } )
						}
					/>
					{ ! startOnView ? null : (
						<ToggleControl
							help={ __(
								'When the block leaves the viewport and becomes visible again, restart the animation from the beginning instead of resuming where it paused.',
								'sbs-typing-effect-block'
							) }
							label={ __(
								'Replay on re-entry',
								'sbs-typing-effect-block'
							) }
							checked={ replayOnReentry }
							onChange={ ( value ) =>
								setAttributes( {
									replayOnReentry: value,
								} )
							}
						/>
					) }
					<ToggleControl
						help={ __(
							'Pause the animation while the pointer is over the block.',
							'sbs-typing-effect-block'
						) }
						label={ __(
							'Pause on hover',
							'sbs-typing-effect-block'
						) }
						checked={ pauseOnHover }
						onChange={ ( value ) =>
							setAttributes( { pauseOnHover: value } )
						}
					/>
				</PanelBody>
				<PanelBody
					initialOpen={ false }
					title={ __( 'Cursor', 'sbs-typing-effect-block' ) }
				>
					<ToggleControl
						label={ __( 'Show cursor', 'sbs-typing-effect-block' ) }
						checked={ showCursor }
						onChange={ ( value ) =>
							setAttributes( { showCursor: value } )
						}
					/>
					{ ! showCursor ? null : (
						<>
							<ToggleControl
								label={ __(
									'Hide cursor when complete',
									'sbs-typing-effect-block'
								) }
								checked={ hideCursorWhenComplete }
								onChange={ ( value ) =>
									setAttributes( {
										hideCursorWhenComplete: value,
									} )
								}
							/>
							<SelectControl
								help={ __(
									'Blink gives a crisp on-off cursor. Fade transition keeps the cursor softer and more fluid.',
									'sbs-typing-effect-block'
								) }
								label={ __(
									'Cursor animation',
									'sbs-typing-effect-block'
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
									'sbs-typing-effect-block'
								) }
								label={ __(
									'Cursor thickness',
									'sbs-typing-effect-block'
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
							<RangeControl
								help={ __(
									'Adjust the cursor bar height relative to the current font size.',
									'sbs-typing-effect-block'
								) }
								label={ __(
									'Cursor height',
									'sbs-typing-effect-block'
								) }
								max={ 1.2 }
								min={ 0.6 }
								step={ 0.01 }
								value={ cursorHeight }
								onChange={ ( value ) =>
									setAttributes( {
										cursorHeight: value ?? cursorHeight,
									} )
								}
							/>
							{ cursorAnimationMode === 'blink' ? (
								<RangeControl
									help={ __(
										'Adjust how quickly the cursor blinks.',
										'sbs-typing-effect-block'
									) }
									label={ __(
										'Cursor blink speed (ms)',
										'sbs-typing-effect-block'
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
										'sbs-typing-effect-block'
									) }
									label={ __(
										'Cursor transition speed (ms)',
										'sbs-typing-effect-block'
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
									'sbs-typing-effect-block'
								) }
								label={ __(
									'Cursor horizontal offset',
									'sbs-typing-effect-block'
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
									'sbs-typing-effect-block'
								) }
								label={ __(
									'Cursor vertical offset',
									'sbs-typing-effect-block'
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
						</>
					) }
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<EditorPreview
					attributes={ normalizedAttributes }
					emptyPreviewPlaceholder={ emptyPreviewPlaceholder }
					isPreviewPaused={ isPreviewPaused }
					isSelected={ Boolean( isSelected ) }
				/>
			</div>
		</>
	);
}
