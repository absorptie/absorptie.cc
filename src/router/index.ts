import { createRouter as createNanoRouter } from '@nanostores/router'
import { nextTick, ref, watch } from 'vue'
import { useStore } from '@nanostores/vue'
import type { DeepReadonly, InjectionKey, Ref } from 'vue'
import type { StoreValue } from 'nanostores'
import type { Router } from '@nanostores/router'

import type { CompiledArticle } from '../../build/data/types'
import { scrollToTop } from '../utils'

export interface Routes {
	'ArticleView': 'category' | 'id'
	'IndexView': 'category'
}

export interface VueRouter {
	page: DeepReadonly<Ref<StoreValue<Router<Routes>>>>
	component: Ref<string>
	data: Ref<CompiledArticle | undefined>
	loading: Promise<void>
}

export const RouterSymbol: InjectionKey<VueRouter> = Symbol('router')

export let routerStore = createNanoRouter<Routes>({
	'ArticleView': '/:category/:id',
	'IndexView': '/:category?'
})

function createVueRouter (): VueRouter {
	let page = useStore(routerStore)
	let component = ref('index-view')
	let data = ref()

	let init: () => void
	let loading = new Promise<void>(resolve => {
		init = resolve
	})

	watch(() => page.value?.route, async () => {
		data.value = undefined

		if (typeof page.value !== 'undefined') {
			if (page.value.route === 'ArticleView') {
				let id = page.value.params.id
				let module = await import(`../../notion/articles/${id}.json`)
				data.value = module.default
			}
			component.value = page.value.route
		}

		init()
		nextTick(scrollToTop)
	}, { immediate: true })

	return {
		page,
		component,
		data,
		loading
	}
}

export let router = createVueRouter()
