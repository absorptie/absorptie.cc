import { computed, ref, unref, watch } from 'vue'
import type { Ref } from 'vue'

import type { PreviewedArticle } from '../../build/data/types'
import { usePrefetch } from './use-prefetch'

export function useFeed (category: Ref<string>): {
	items: Ref<PreviewedArticle[]>
	hasMore: Ref<boolean>
	loadMore: () => void
} {
	let page = ref(1)
	let items = ref<PreviewedArticle[]>([])
	let hasMore = ref(false)

	function loadMore (): void {
		hasMore.value && page.value++
	}

	async function loadFeed (): Promise<void> {
		let module = await import(
			`../../notion/pagination/${unref(category)}/${unref(page)}.json`
		)
		items.value.push(...module.items)
		hasMore.value = module.next
	}

	loadFeed()

	watch([category, page], loadFeed)

	usePrefetch(
		computed(() => items.value.map(article => article.id))
	)

	return { items, hasMore, loadMore }
}
