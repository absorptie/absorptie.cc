import { ref, unref, watch } from 'vue'
import type { Ref } from 'vue'

import { hrefToPath } from '../utils'
import type { CompiledArticle } from '../../build/data/types'

async function fetchModule (id: string): Promise<{
	default: CompiledArticle
}> {
	let json = `../../notion/articles/${id}.json`
	return import(/* @vite-ignore */ hrefToPath(json))
}

let preloaded = ref<CompiledArticle>()

export async function preloadArticle (id: string): Promise<void> {
	preloaded.value = undefined
	let module = await fetchModule(id)
	preloaded.value = module.default
}

export function useArticle (id: Ref<string>): Ref<CompiledArticle | undefined> {
	let article = ref<CompiledArticle | undefined>(preloaded.value)
	let isPreloaded = preloaded.value

	watch(id, async () => {
		if (!id.value) return
		let module = await fetchModule(unref(id))
		article.value = module.default
	}, { immediate: !isPreloaded })

	return preloaded
}
