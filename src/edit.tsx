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
	normalizeAttributes,
	type TypewriterAttributes,
	VALID_TAG_NAMES,
} from './shared';

const tagNameOptions = VALID_TAG_NAMES.map( ( tagName ) => ( {
	label: tagName.toUpperCase(),
	value: tagName,
} ) );

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
		loop,
		showCursor,
		startOnView,
		tagName,
	} = normalizedAttributes;
	const isPreviewPlaying = isSelected && ! isPreviewPaused;

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
