
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import vite from 'vite'
import type { RollupOutput } from 'rollup'

import { prefetchHashMapPlugin } from './plugin.js'
import { tempOutDir } from './dirs.js'

export async function bundle (input: Record<string, string>): Promise<{
	clientResult: RollupOutput
	serverResult: RollupOutput
	hashMap: string
}> {
	let prefetchHashMap = Object.create(null)

	let clientResult = await vite.build({
		// don’t copy notion data files
		publicDir: false,
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
			minify: false
		}
	}) as RollupOutput

	let hashMap = JSON.stringify(JSON.stringify(prefetchHashMap))

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
