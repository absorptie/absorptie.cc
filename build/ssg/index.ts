import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { OutputAsset, OutputChunk } from 'rollup'

import { articlesPath, notionDir, paginationsPath } from '../data/dirs.js'
import { outDir, root, tempOutDir } from './dirs.js'
import { log, logger } from '../logger/index.js'
import { renderPage } from './render.js'
import { bundle } from './bundle.js'

async function build (): Promise<void> {
	try {
		let start = Date.now()

		logger.setPrefix('SSG')
		log('Getting pages list…')

		let pagesList: string[] = ['/']
		let input: Record<string, string> = {
			app: join(root, './src/main.ts')
		}

		let articlesFiles = await readdir(articlesPath)
		for (let filename of articlesFiles) {
			let articleId = filename.split('.json')[0]
			let filePath = join(articlesPath, filename)
			input[articleId] = filePath
			let article = await readFile(filePath, { encoding: 'utf8' })
			let category = JSON.parse(article).category.toLowerCase()
			pagesList.push(`/${category}/${articleId}`)
		}

		let paginationsFolders = await readdir(paginationsPath)
		for (let foldername of paginationsFolders) {
			let pages = await readdir(join(paginationsPath, foldername))
			for (let filename of pages) {
				let paginationId = filename.split('.json')[0]
				let inputKey = `${foldername}-${paginationId}`
				input[inputKey] = join(paginationsPath, foldername, filename)
			}
		}

		log(`Received ${pagesList.length} pages`)
		log('Getting rendering list…')

		let cache = new Set<string>(
			JSON.parse(
				await readFile(
					join(notionDir, './rendering.json'),
					{ encoding: 'utf8' }
				)
			)
		)
		pagesList = pagesList.filter(pageUrl => cache.has(pageUrl))

		if (pagesList.length === 0) {
			log('Nothing to render')
			return
		}

		log(`Only ${pagesList.length} pages should be rerendered`)

		let { clientResult, hashMap } = await bundle(input)

		let appChunk = clientResult.output.find(chunk => {
			return chunk.type === 'chunk' && chunk.isEntry
		}) as OutputChunk

		let cssChunk = clientResult.output.find(chunk => {
			return chunk.type === 'asset' && chunk.fileName.endsWith('.css')
		}) as OutputAsset

		let { createApp } = await import(join(tempOutDir, './app.js'))
		let manifest = JSON.parse(await readFile(join(tempOutDir, './ssr-manifest.json'), 'utf8'))

		log('Rendering pages…')
		for (let pageUrl of pagesList) {
			log('Rendering page', pageUrl)
			let html = await renderPage(
				createApp,
				appChunk,
				cssChunk,
				manifest,
				hashMap,
				pageUrl
			)
			let filePath = join(outDir, pageUrl)
			await mkdir(filePath, { recursive: true })
			await writeFile(join(filePath, './index.html'), html, 'utf8')
		}

		log(`Done in ${((Date.now() - start) / 1000).toFixed(2)}s.`)
	} catch (error) {
		console.error(error)
		throw error
	} finally {
		await rm(tempOutDir, { force: true, recursive: true })
	}
}

build()
