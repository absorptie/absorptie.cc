import { nextTick, watch } from 'vue'
import type { Ref } from 'vue'

export async function awaitFor (source: Ref<boolean>): Promise<void> {
	let resolve: () => void
	let promise = new Promise<void>(_resolve => {
		resolve = _resolve
	})
	let stop = watch(source, () => {
		if (!source.value) {
			nextTick(() => stop)
			resolve()
		}
	}, { immediate: true })
	return promise
}
