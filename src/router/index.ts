import { createRouter } from '@nanostores/router'

interface Routes {
	'ArticleView': 'category' | 'id'
	'IndexView': 'category'
}

export let router = createRouter<Routes>({
	'ArticleView': '/:category/:id',
	'IndexView': '/:category?'
})
