import './styles/base.styl'

import {
	createApp as createVueApp,
	createSSRApp,
	nextTick
} from 'vue'
import { createHead } from '@vueuse/head'
import type { HeadClient } from '@vueuse/head'
import type { App } from 'vue'

import { isBrowser } from './utils'
import { awaitFor } from './composables/await-for'
import { router } from './router'
import AbsorptieApp from './App.vue'
import ArticleView from './views/ArticleView.vue'
import IndexView from './views/IndexView.vue'

export interface CreateApp {
	app: App
	head: HeadClient
	openRoute: (url: string) => Promise<void>
}

async function openRoute (url: string): Promise<void> {
	router.store.open(url)
	await awaitFor(router.loading)
	await nextTick()
}

export function createApp (): CreateApp {
	let app = !import.meta.env.PROD
		? createVueApp(AbsorptieApp)
		: createSSRApp(AbsorptieApp)
	let head = createHead()

	app.use(head)

	app.component('IndexView', IndexView)
	app.component('ArticleView', ArticleView)

	return { app, head, openRoute }
}

if (isBrowser) {
	let { app } = createApp()
	awaitFor(router.loading).then(() => {
		app.mount('#absorptie')
	})
}
