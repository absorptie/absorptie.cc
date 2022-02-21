import { constants, promises as fs } from 'node:fs'
import { join } from 'node:path'

import { createPagination, removePagination } from './pagination.js'
import { articlesPath, notionDir, paginationsPath } from './dirs.js'
import { NOTION_DATABASE_ID } from './constants.js'
import { createCategories } from './categories.js'
import { compileArticles } from './articles.js'
import { notion } from './notion.js'
import { log } from '../logger/index.js'
import type { ArticleMeta, DatabaseQueryFilter } from './types.js'

async function cleanupList (
	articlesList: ArticleMeta[]
): Promise<ArticleMeta[]> {
	log('Cleaning articles list…')
	try {
		await fs.access(articlesPath, constants.F_OK)

		let articlesFiles = await fs.readdir(articlesPath)
		let articlesIds = new Set(articlesList.map(article => article.id))
		let removeList = articlesFiles.filter(file => {
			return !articlesIds.has(file.split('.')[0])
		})

		if (removeList.length > 0) {
			log(
				`Status of ${removeList.length} article has been changed ` +
				'and they will be removed'
			)
			for (let filename of removeList) {
				log(`Removing article ${filename}`)
				await fs.rm(join(articlesPath, filename))
			}
		}
	} catch {}

	let articles: ArticleMeta[] = []

	for (let article of articlesList) {
		let articleFile = `${article.id}.json`
		let articlePath = join(articlesPath, articleFile)

		try {
			await fs.access(articlePath, constants.F_OK)

			let cachedArticle = JSON.parse(
				await fs.readFile(articlePath, { encoding: 'utf8' })
			)

			if (article.last_edited_time !== cachedArticle.last_edited_time) {
				articles.push(article)
			}
		} catch {
			articles.push(article)
		}
	}

	if (articles.length > 0) {
		log(
			`Content of ${articles.length} articles has been changed ` +
			'and they will be updated'
		)
	}

	return articles
}

export async function getArticlesList (category?: string): Promise<ArticleMeta[]> {
	log('Getting articles list from database…')
	let articles: ArticleMeta[] = []

	let filter: DatabaseQueryFilter = {
		and: [
			{
				property: 'Status',
				select: {
					equals: 'Published'
				}
			}
		]
	}
	if (category) {
		filter.and.push({
			property: 'Category',
			select: {
				equals: category
			}
		})
	}

	let run = true
	let cursor

	while (run) {
		let { results, next_cursor } = await notion.databases.query({
			database_id: NOTION_DATABASE_ID,
			start_cursor: cursor,
			filter
		})

		for (let page of results) {
			// thanks to fucking Notion
			if (!('created_time' in page)) continue
			if (page.properties.Name.type !== 'title') continue
			if (page.properties.Slug.type !== 'url') continue
			if (page.properties.Category.type !== 'select') continue
			if (page.properties.Author.type !== 'people') continue
			if (page.properties.Editor.type !== 'people') continue
			if (page.properties.Status.type !== 'select') continue

			// validate properties
			if (!page.properties.Category.select) continue
			if (!page.properties.Status.select) continue

			let article: ArticleMeta = {
				id: page.id,
				title: page.properties.Name.title[0].plain_text,
				slug: page.properties.Slug.url || page.id,
				category: page.properties.Category.select.name,
				status: page.properties.Status.select.name,
				created_time: page.created_time,
				last_edited_time: page.last_edited_time
			}

			if (
				page.properties.Author.people.length > 0 &&
				'name' in page.properties.Author.people[0] &&
				page.properties.Author.people[0].name
			) {
				article.author = page.properties.Author.people[0].name
			}

			if (
				page.properties.Editor.people.length > 0 &&
				'name' in page.properties.Editor.people[0] &&
				page.properties.Editor.people[0].name
			) {
				article.editor = page.properties.Editor.people[0].name
			}

			articles.push(article)
		}

		if (cursor) {
			cursor = next_cursor
		} else {
			run = false
		}
	}

	log(`Received ${articles.length} articles`)

	return articles
}

async function saveRenderingList (articles: ArticleMeta[]): Promise<void> {
	log('Saving rendering list…')
	let list = articles.map(article => `/${article.category}/${article.id}`)
	if (list.length > 0) {
		list.unshift('/')
	}
	await fs.writeFile(
		join(notionDir, './rendering.json'),
		JSON.stringify(list),
		{ encoding: 'utf8' }
	)
}

async function main (): Promise<void> {
	let start = Date.now()

	await fs.mkdir(articlesPath, { recursive: true })
	await fs.mkdir(paginationsPath, { recursive: true })

	let allArticlesList = await getArticlesList()
	let updatableArticlesList = await cleanupList(allArticlesList)
	await saveRenderingList(updatableArticlesList)
	await compileArticles(updatableArticlesList)

	if (updatableArticlesList.length > 0) {
		await removePagination()
		await createPagination(allArticlesList, 'feed')
		await createCategories()
		log(`Done in ${((Date.now() - start) / 1000).toFixed(2)}s.`)
	} else {
		log('Nothing to build')
	}
}

main()
