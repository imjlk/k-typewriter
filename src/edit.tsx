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
	VALID_TAG_NAMES,
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
		deleteDelay,
		pauseDelay,
		startDelay,
		startDelayMode,
		loop,
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
				</PanelBody>
				<PanelBody
					initialOpen={ false }
					title={ __( 'Fallback & Summary', 'k-typewriter' ) }
				>
					<SelectControl
						help={ __(
							'Choose what visitors see before animation starts, with reduced motion, and without JavaScript.',
							'k-typewriter'
						) }
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
					<TextControl
						disabled={ fallbackMode !== 'custom' }
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
					<p className="k-typewriter-editor__control-note">
						{ __( 'Effective fallback preview:', 'k-typewriter' ) }{ ' ' }
						<strong>{ effectiveFallbackText }</strong>
					</p>
					<SelectControl
						help={ __(
							'Choose the non-visual summary used for assistive technology. Auto mode combines every message.',
							'k-typewriter'
						) }
						label={ __( 'Summary source', 'k-typewriter' ) }
						options={ contentSourceOptions }
						value={ summaryMode }
						onChange={ ( value ) =>
							setAttributes( {
								summaryMode: value as ContentSourceMode,
							} )
						}
					/>
					<TextareaControl
						disabled={ summaryMode !== 'custom' }
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
					<p className="k-typewriter-editor__control-note">
						{ __(
							'Effective non-visual summary:',
							'k-typewriter'
						) }{ ' ' }
						<strong>{ effectiveSummaryText }</strong>
					</p>
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
					<RangeControl
						label={ __( 'Deleting delay (ms)', 'k-typewriter' ) }
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
