import { ref, unref, watchEffect } from 'vue'
import type { Ref } from 'vue'

export function useFetch<T> (url: Ref<string | null>): Ref<T | null> {
	let data = ref()

	function doFetch (): void {
		data.value = null
		let _url = unref(url)
		if (!_url) return
		fetch(_url)
			.then(res => res.json())
			.then(json => (data.value = json))
	}

	watchEffect(doFetch)

	return data
}
