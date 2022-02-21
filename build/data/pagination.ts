import { promises as fs } from 'node:fs'
import { join } from 'node:path'

import { paginationsPath, articlesPath } from './dirs.js'
import { PAGE_SIZE } from './constants.js'
import { log } from './logger.js'
import type { ArticleMeta, PaginationFile, PreviewedArticle } from './types.js'

export async function removePagination (): Promise<void> {
	log('Removing old pagination…')
	await fs.rm(paginationsPath, { force: true, recursive: true })
}

export async function createPagination (
	articlesList: ArticleMeta[],
	prefix: string
): Promise<void> {
	log('Creating pagination…')

	// load previews
	let items = await Promise.all(
		articlesList.map<Promise<PreviewedArticle>>(async article => {
			let file = await fs.readFile(
				join(articlesPath, `${article.id}.json`),
				{ encoding: 'utf8' }
			)
			return {
				...article,
				preview: JSON.parse(file).preview
			}
		})
	)

	let pagination = items.reduce<PaginationFile[]>((pages, article) => {
		let prevPage = pages[pages.length - 2]
		let page = pages[pages.length - 1]
		if (page.items.length === 0 && pages.length > 1) {
			prevPage.next = true
		}
		let newLength = page.items.push(article)
		if (newLength === PAGE_SIZE) {
			pages.push({ items: [], next: false })
		}
		return pages
	}, [{ items: [], next: false }])

	let paginationPrefix = prefix.toLowerCase()
	let paginationPath = join(paginationsPath, paginationPrefix)

	for (let [index, page] of pagination.entries()) {
		let pageFile = `${index + 1}.json`
		let pagePath = join(paginationPath, pageFile)

		log(`Saving page ${index + 1} for "${paginationPrefix}" category…`)
		await fs.mkdir(paginationPath, { recursive: true })
		await fs.writeFile(
			pagePath,
			JSON.stringify(page, null, '\t'),
			'utf8'
		)
	}
}
