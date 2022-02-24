import { renderHeadToString } from '@vueuse/head'
import { renderToString } from '@vue/server-renderer'
import type { OutputAsset, OutputChunk } from 'rollup'
import type { SSRContext } from '@vue/server-renderer'

import type { CreateApp } from '../../src/main.js'

export async function renderPage (
	createApp: () => CreateApp,
	appChunk: OutputChunk,
	cssChunk: OutputAsset,
	manifest: Record<string, string[]>,
	hashMap: string,
	url: string
): Promise<string> {
	let { app, head, openRoute } = createApp()
	await openRoute(url)

	let ctx: SSRContext = {}
	let content = await renderToString(app, ctx)
	let { headTags } = renderHeadToString(head)
	let preloadLinks = await renderPreloadLinks(ctx.modules, manifest)

	return `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				${headTags}
				<link rel="icon" href="/favicon.svg" type="image/svg+xml">
				<link rel="manifest" href="/manifest.webmanifest">
				<meta name="theme-color" content="#000000"  media="(prefers-color-scheme: dark)"/>
				<meta name="theme-color" content="#e5e5e5"  media="(prefers-color-scheme: light)"/>
				<meta property="og:url" content="https://absorptie.cc/">
				<meta property="og:type" content="website">
				<meta name="twitter:site" content="@absorptie">
				${preloadLinks}
				<link rel="stylesheet" href="/${cssChunk.fileName}">
			</head>
			<body>
				<div id="absorptie">${content}</div>
				<script>const __ABSORPTIE_HASH_MAP__ = JSON.parse(${hashMap})</script>
				<script type="module" src="/${appChunk.fileName}"></script>
			</body>
		</html>
	`.trim()
}

async function renderPreloadLinks (
	modules: string[],
	manifest: {
		[key: string]: string[] | undefined
	}
): Promise<string> {
	let html = ''
	let seen = new Set()
	modules.forEach(id => {
		let files = manifest[id]
		if (files) {
			files.forEach(file => {
				if (!seen.has(file)) {
					seen.add(file)
					html += renderPreloadLink(file)
				}
			})
		}
	})
	return html
}

function renderPreloadLink (file: string): string {
	let html = ''
	if (file.endsWith('.woff2')) {
		html += `<link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`
	}
	return html
}
