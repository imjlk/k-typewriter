import { registerBlockType } from '@wordpress/blocks';
import type { BlockConfiguration } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import './style.scss';

import Edit from './edit';
import metadata from './block.json';
import save from './save';
import { SAMPLE_ITEMS, type TypewriterAttributes } from './shared';
import transforms from './transforms';

const translatedSampleItems = [
	__( '한 글자씩, 리듬 있게.', 'k-typewriter' ),
	__( 'Animate headlines in any language.', 'k-typewriter' ),
	__( 'Ship polished hero copy in minutes.', 'k-typewriter' ),
];

const translatedMetadata = {
	...metadata,
	example: {
		...metadata.example,
		attributes: {
			...metadata.example.attributes,
			items: translatedSampleItems.length
				? translatedSampleItems.slice( 0, 2 )
				: SAMPLE_ITEMS.slice( 0, 2 ),
		},
	},
} as const;

const blockSettings: Partial< BlockConfiguration< TypewriterAttributes > > = {
	edit: Edit,
	save,
	transforms,
};

registerBlockType( translatedMetadata.name, {
	...translatedMetadata,
	...blockSettings,
} );
