import { registerBlockType } from '@wordpress/blocks';
import type { BlockConfiguration } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import metadata from './block.json';
import { legacyBlockSettings } from './legacy';
import save from './save';
import { LEGACY_BLOCK_NAME, type TypewriterAttributes } from './shared';

const blockSettings: Partial< BlockConfiguration< TypewriterAttributes > > = {
	edit: Edit,
	save,
	...legacyBlockSettings,
};

registerBlockType( metadata.name, blockSettings );

registerBlockType( LEGACY_BLOCK_NAME, {
	...metadata,
	...blockSettings,
	name: LEGACY_BLOCK_NAME,
	title: `${ metadata.title } (Legacy)`,
	supports: {
		...metadata.supports,
		inserter: false,
	},
} as BlockConfiguration< TypewriterAttributes > );
