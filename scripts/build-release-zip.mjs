import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname( fileURLToPath( import.meta.url ) );
const repoRoot = resolve( __dirname, '..' );

const pluginSlug = 'sbs-typing-effect-block';
const zipName = `${ pluginSlug }.zip`;
const tempRoot = join( repoRoot, '.tmp-release' );
const stagingRoot = join( tempRoot, pluginSlug );
const zipPath = join( repoRoot, zipName );

const releaseEntries = [
	'build',
	'includes',
	'languages',
	'patterns',
	'playground',
	'readme.txt',
	'sbs-typing-effect-block.php',
];

rmSync( tempRoot, { force: true, recursive: true } );
rmSync( zipPath, { force: true } );
mkdirSync( stagingRoot, { recursive: true } );

for ( const entry of releaseEntries ) {
	const sourcePath = join( repoRoot, entry );

	if ( ! existsSync( sourcePath ) ) {
		throw new Error( `Missing release entry: ${ entry }` );
	}

	cpSync( sourcePath, join( stagingRoot, entry ), {
		force: true,
		recursive: true,
	} );
}

execFileSync( 'zip', [ '-rq', zipPath, pluginSlug ], {
	cwd: tempRoot,
	stdio: 'inherit',
} );

console.log( `Created ${ zipPath }` );
