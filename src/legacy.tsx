import { useBlockProps } from '@wordpress/block-editor';
import type { BlockConfiguration } from '@wordpress/blocks';

import type { LegacyAttributes, TypewriterAttributes } from './shared';
import { migrateLegacyAttributes } from './shared';

const legacyAttributes = {
	texts: {
		type: 'array',
		default: [ '여러개 테스트', '아무거나 입력', '테스트 중입니다' ],
	},
	text: {
		type: 'string',
		default: '',
	},
	testToggle: {
		type: 'boolean',
		default: false,
	},
};

function LegacySave( { attributes }: { attributes: LegacyAttributes } ) {
	const blockProps = useBlockProps.save();

	return (
		<div { ...blockProps }>
			<div
				className="typewriter-container"
				data-gutenberg-attributes={ JSON.stringify( attributes ) }
			/>
		</div>
	);
}

export const legacyBlockSettings: Pick<
	BlockConfiguration< TypewriterAttributes >,
	'deprecated'
> = {
	deprecated: [
		{
			attributes: legacyAttributes,
			migrate: migrateLegacyAttributes,
			save: LegacySave,
		},
	],
};
