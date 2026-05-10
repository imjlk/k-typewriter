import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const root = process.cwd();

const iconPath = path.join( root, '.wordpress-org', 'icon-256x256.png' );
const frontPath = path.join( root, 'output', 'playwright', 'inline-card.png' );
const editorPath = path.join(
	root,
	'output',
	'playwright',
	'editor-inline-focused-5.png'
);
const retinaBannerPath = path.join(
	root,
	'.wordpress-org',
	'banner-1544x500.png'
);

function toDataUri( buffer ) {
	return `data:image/png;base64,${ buffer.toString( 'base64' ) }`;
}

const [ iconBuffer, frontBuffer, editorBuffer ] = await Promise.all( [
	fs.readFile( iconPath ),
	fs.readFile( frontPath ),
	fs.readFile( editorPath ),
] );

const iconSrc = toDataUri( iconBuffer );
const frontSrc = toDataUri( frontBuffer );
const editorSrc = toDataUri( editorBuffer );

const browser = await chromium.launch( { headless: true } );
const page = await browser.newPage( {
	viewport: { width: 1544, height: 500 },
	deviceScaleFactor: 1,
} );

await page.setContent( `<!doctype html>
<html>
	<head>
		<meta charset="utf-8" />
		<style>
			:root {
				color-scheme: light;
			}

			* {
				box-sizing: border-box;
			}

			body {
				margin: 0;
				background:
					radial-gradient(circle at 82% 12%, rgba(255, 149, 104, 0.22), transparent 18%),
					linear-gradient(135deg, #f8f4ea 0%, #eef3ff 100%);
				font-family: Inter, "Segoe UI", system-ui, sans-serif;
			}

			.banner {
				width: 1544px;
				height: 500px;
				padding: 44px 52px;
				display: grid;
				grid-template-columns: 1.08fr 0.92fr;
				gap: 28px;
				overflow: hidden;
			}

			.copy {
				display: flex;
				flex-direction: column;
				justify-content: center;
				min-width: 0;
			}

			.meta {
				display: flex;
				align-items: center;
				gap: 16px;
				margin-bottom: 26px;
			}

			.icon {
				width: 54px;
				height: 54px;
				border-radius: 16px;
				box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
			}

			.eyebrow {
				font-size: 14px;
				font-weight: 800;
				letter-spacing: 0.22em;
				text-transform: uppercase;
				color: #6b7280;
			}

			h1 {
				margin: 0;
				font-family: Georgia, "Times New Roman", serif;
				font-size: 70px;
				line-height: 0.98;
				letter-spacing: -0.03em;
				color: #101827;
			}

			.subtitle {
				margin-top: 20px;
				max-width: 720px;
				font-size: 26px;
				line-height: 1.42;
				color: #334155;
				font-weight: 500;
			}

			.pills {
				display: flex;
				flex-wrap: wrap;
				gap: 12px;
				margin-top: 24px;
			}

			.pill {
				padding: 10px 16px;
				border-radius: 999px;
				font-size: 16px;
				font-weight: 700;
				color: #111827;
				background: rgba(255, 255, 255, 0.72);
				border: 1px solid rgba(15, 23, 42, 0.08);
				backdrop-filter: blur(10px);
			}

			.stage {
				position: relative;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.stage::before {
				content: "";
				position: absolute;
				inset: 38px 28px 22px 108px;
				border-radius: 32px;
				background: linear-gradient(160deg, #111827 0%, #1e293b 100%);
				box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
			}

			.front-card,
			.editor-card {
				position: absolute;
				background: rgba(255, 255, 255, 0.96);
				border-radius: 24px;
				box-shadow: 0 24px 48px rgba(15, 23, 42, 0.16);
				overflow: hidden;
			}

			.front-card {
				width: 620px;
				padding: 18px 18px 12px;
				top: 86px;
				left: 32px;
				transform: rotate(-1.1deg);
			}

			.editor-card {
				width: 420px;
				padding: 16px;
				right: 18px;
				bottom: 26px;
				transform: rotate(2.2deg);
			}

			.label {
				font-size: 12px;
				font-weight: 800;
				letter-spacing: 0.18em;
				text-transform: uppercase;
				color: #6b7280;
				margin-bottom: 10px;
			}

			.front-card img,
			.editor-card img {
				width: 100%;
				display: block;
				border-radius: 16px;
			}

			.front-caption {
				margin-top: 10px;
				font-size: 16px;
				line-height: 1.45;
				color: #475569;
				font-weight: 600;
			}

			.editor-chip {
				position: absolute;
				right: 26px;
				top: 22px;
				padding: 8px 12px;
				border-radius: 999px;
				font-size: 12px;
				font-weight: 800;
				letter-spacing: 0.16em;
				text-transform: uppercase;
				color: #f8f4ea;
				background: #ff8c5a;
				box-shadow: 0 10px 24px rgba(255, 140, 90, 0.28);
			}
		</style>
	</head>
	<body>
		<section class="banner">
			<div class="copy">
				<div class="meta">
					<img class="icon" src="${ iconSrc }" alt="" />
					<div class="eyebrow">WordPress block plugin</div>
				</div>
				<h1>Stroke by stroke<br />typing effect Block</h1>
				<div class="subtitle">Theme-friendly animated text for Gutenberg, with multilingual headlines, inline keyword rotators, and polished starter patterns.</div>
				<div class="pills">
					<div class="pill">Inline layout</div>
					<div class="pill">Viewport start</div>
					<div class="pill">SSR fallback</div>
				</div>
			</div>
			<div class="stage">
				<div class="front-card">
					<div class="label">Front end</div>
					<img src="${ frontSrc }" alt="" />
					<div class="front-caption">A clean inline typewriter pattern that stays inside the rhythm of the surrounding layout.</div>
				</div>
				<div class="editor-card">
					<div class="label">Editor</div>
					<img src="${ editorSrc }" alt="" />
				</div>
				<div class="editor-chip">Edit + publish</div>
			</div>
		</section>
	</body>
</html>` );

await page.screenshot( { path: retinaBannerPath } );
await browser.close();
