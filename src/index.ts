import { registerBlockType } from '@wordpress/blocks';
import type { BlockConfiguration } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import './style.scss';

import Edit from './edit';
import metadata from './block.json';
import { legacyBlockSettings } from './legacy';
import save from './save';
import { LEGACY_BLOCK_NAME, type TypewriterAttributes } from './shared';

const translatedDefaultItems = [
	__( '한 글자씩, 리듬 있게.', 'k-typewriter' ),
	__( 'Animate headlines in any language.', 'k-typewriter' ),
	__( 'Ship polished hero copy in minutes.', 'k-typewriter' ),
];

const translatedMetadata = {
	...metadata,
	attributes: {
		...metadata.attributes,
		items: {
			...metadata.attributes.items,
			default: translatedDefaultItems,
		},
	},
	example: {
		...metadata.example,
		attributes: {
			...metadata.example.attributes,
			items: translatedDefaultItems.slice( 0, 2 ),
		},
	},
} as const;

const blockSettings: Partial< BlockConfiguration< TypewriterAttributes > > = {
	edit: Edit,
	save,
	...legacyBlockSettings,
};

registerBlockType( translatedMetadata.name, {
	...translatedMetadata,
	...blockSettings,
} );

registerBlockType( LEGACY_BLOCK_NAME, {
	...translatedMetadata,
	...blockSettings,
	name: LEGACY_BLOCK_NAME,
	title: `${ translatedMetadata.title } (Legacy)`,
	supports: {
		...translatedMetadata.supports,
		inserter: false,
	},
} as BlockConfiguration< TypewriterAttributes > );
