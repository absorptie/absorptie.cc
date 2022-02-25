import { NOTION_DATABASE_ID } from './constants.js'
import { createPagination } from './pagination.js'
import { getArticlesList } from './index.js'
import { notion } from './notion.js'
import { log } from '../logger/index.js'
import type { CategoriesList } from './types.js'

async function getCategoriesList (): Promise<CategoriesList> {
	let categories: CategoriesList = []

	let { properties } = await notion.databases.retrieve({
		database_id: NOTION_DATABASE_ID
	})

	// thanks to fucking Notion
	if (!('Category' in properties)) return []
	if (properties.Category.type !== 'select') return []

	categories = properties.Category.select.options.map(category => ({
		id: category.id as string,
		name: category.name
	}))

	log(`Received ${categories.length} categories`)

	return categories
}

export async function createCategories (): Promise<void> {
	let categories = await getCategoriesList()

	for (let category of categories) {
		let categoryArticlesList = await getArticlesList(category.name)
		if (categoryArticlesList.length === 0) return
		await createPagination(categoryArticlesList, category.name)
	}
}
