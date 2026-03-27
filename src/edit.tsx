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
	getEffectiveFallbackText,
	getEffectiveSummaryText,
	normalizeAttributes,
	START_DELAY_MODES,
	type ContentSourceMode,
	type TypewriterAttributes,
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
	const blockProps = useBlockProps();
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
		startFromEmpty,
		showCursor,
		startOnView,
		fallbackMode,
		fallbackText,
		summaryMode,
		summaryText,
		tagName,
	} = normalizedAttributes;
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
						label={ __( 'Loop messages', 'k-typewriter' ) }
						checked={ loop }
						onChange={ ( value ) =>
							setAttributes( { loop: value } )
						}
					/>
					<ToggleControl
						label={ __( 'Show cursor', 'k-typewriter' ) }
						checked={ showCursor }
						onChange={ ( value ) =>
							setAttributes( { showCursor: value } )
						}
					/>
					<ToggleControl
						label={ __( 'Start when visible', 'k-typewriter' ) }
						checked={ startOnView }
						onChange={ ( value ) =>
							setAttributes( { startOnView: value } )
						}
					/>
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
