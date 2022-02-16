import { DATABASE_ID, notion } from './notion.js'
import { createPagination } from './pagination.js'
import { getArticlesList } from './index.js'
import { log } from './logger.js'
import type { CategoriesList } from './types.js'

async function getCategoriesList (): Promise<CategoriesList> {
	log('Getting categories list from database…')
	let categories: CategoriesList = []

	let { properties } = await notion.databases.retrieve({
		database_id: DATABASE_ID
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
		log(`Getting articles list sorted by "${category.name}" category`)
		let categoryArticlesList = await getArticlesList(category.name)
		await createPagination(categoryArticlesList, category.name)
	}
}
