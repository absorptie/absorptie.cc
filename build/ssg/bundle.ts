
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import vite from 'vite'
import type { RollupOutput } from 'rollup'

import { prefetchHashMapPlugin } from './plugin.js'
import { tempOutDir } from './dirs.js'
import { log } from '../logger/index.js'

export async function bundle (input: Record<string, string>): Promise<{
	clientResult: RollupOutput
	serverResult: RollupOutput
	hashMap: string
}> {
	let prefetchHashMap = Object.create(null)

	log('Building client bundle…')
	let clientResult = await vite.build({
		plugins: [
			prefetchHashMapPlugin(prefetchHashMap)
		],
		build: {
			emptyOutDir: true,
			cssCodeSplit: false,
			rollupOptions: {
				input,
				preserveEntrySignatures: 'allow-extension'
			},
			minify: true
		}
	}) as RollupOutput

	log('Building server bundle…')
	let serverResult = await vite.build({
		// don’t copy notion data files
		publicDir: false,
		build: {
			ssr: true,
			outDir: tempOutDir,
			ssrManifest: true,
			emptyOutDir: true,
			cssCodeSplit: false,
			rollupOptions: {
				input,
				preserveEntrySignatures: 'allow-extension',
				output: {
					format: 'esm'
				}
			},
			minify: false
		}
	}) as RollupOutput

	let hashMap = JSON.stringify(JSON.stringify(prefetchHashMap))
	await writeFile(
		join(tempOutDir, './package.json'),
		JSON.stringify({ type: 'module' }),
		'utf8'
	)

	return {
		clientResult,
		serverResult,
		hashMap
	}
}
