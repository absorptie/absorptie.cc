import { createRouter as createNanoRouter } from '@nanostores/router'
import { nextTick, ref } from 'vue'
import type { Router } from '@nanostores/router'
import type { Ref } from 'vue'

import { preloadArticle } from '../composables/use-article'
import { preloadFeed } from '../composables/use-feed'
import { scrollToTop } from '../utils'

export interface Routes {
	'ArticleView': 'category' | 'id'
	'IndexView': 'category'
}

function createRouter (): {
	store: Router<Routes>
	component: Ref<string>
	loading: Ref<boolean>
} {
	let store = createNanoRouter<Routes>({
		'ArticleView': '/:category/:id',
		'IndexView': '/:category?'
	})
	let component = ref('index-view')
	let loading = ref(true)

	function switchPage (componentName: string): void {
		component.value = componentName
		loading.value = false
		nextTick(() => {
			scrollToTop()
		})
	}

	store.subscribe(page => {
		loading.value = true

		if (typeof page !== 'undefined') {
			if (page.route === 'ArticleView') {
				let id = page.params.id
				preloadArticle(id).then(() => {
					switchPage(page.route)
				})
			} else {
				let category = page.params.category || 'feed'
				preloadFeed(category, 1).then(() => {
					switchPage(page.route)
				})
			}
		}
	})

	return {
		store,
		component,
		loading
	}
}

export let router = createRouter()
