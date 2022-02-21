import { computed, ref, unref, watch } from 'vue'
import type { Ref } from 'vue'

import type { PaginationFile, PreviewedArticle } from '../../build/data/types'
import { usePrefetch } from './use-prefetch'
import { hrefToPath } from '../utils'

async function fetchModule (
	category: string,
	page: number
): Promise<PaginationFile> {
	let json = `../../notion/pagination/${category}/${page}.json`
	return import(/* @vite-ignore */ hrefToPath(json))
}

let preloaded = ref<PaginationFile[]>([])

export async function preloadFeed (
	category: string,
	pages: number
): Promise<void> {
	preloaded.value = []
	await Promise.all(
		Array.from(
			{ length: pages },
			(_, i) => fetchModule(category, i + 1).then(module => {
				preloaded.value.push(module)
			})
		)
	)
}

export function useFeed (category: Ref<string>): {
	items: Ref<PreviewedArticle[]>
	hasMore: Ref<boolean>
	loadMore: () => void
} {
	let page = ref(1)
	let items = ref<PreviewedArticle[]>([])
	let hasMore = ref(false)
	let isPreloaded = preloaded.value.length > 0

	if (isPreloaded) {
		page.value = preloaded.value.length
		items.value = preloaded.value.flatMap(item => item.items)
		hasMore.value = preloaded.value[preloaded.value.length - 1].next
	}

	function loadMore (): void {
		hasMore.value && page.value++
	}

	watch([category, page], async () => {
		let module = await fetchModule(unref(category), unref(page))
		items.value.push(...module.items)
		hasMore.value = module.next
	}, { immediate: !isPreloaded })

	usePrefetch(
		computed(() => items.value.map(article => article.id))
	)

	return { items, hasMore, loadMore }
}
