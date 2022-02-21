import { unref, watch } from 'vue'
import type { Ref } from 'vue'

export const isBrowser = typeof window !== 'undefined'

const prefetched = new Set<string>()
const createLink = (): HTMLLinkElement => document.createElement('link')

const viaDOM = (url: string): void => {
	let link = createLink()
	link.rel = 'prefetch'
	link.href = url
	document.head.append(link)
}

const viaXHR = (url: string): void => {
	let req = new XMLHttpRequest()
	req.open('GET', url, (req.withCredentials = true))
	req.send()
}

function prefetch (url: string): void {
	if (isBrowser) {
		let link = createLink()
		link.relList.supports('prefetch')
			? viaDOM(url)
			: viaXHR(url)
	}
}

function hrefToPath (href: string): string {
	let filePath = `${href}?import`

	if (import.meta.env.DEV) {
		filePath += `?t=${Date.now()}`
	}

	return filePath
}

export function usePrefetch (list: Ref<string[]>): void {
	if (!isBrowser) return

	let prefetching = true
	let idle = 'requestIdleCallback' in window
		? window.requestIdleCallback
		: setTimeout

	watch(list, () => {
		prefetching = true
	})

	idle(() => {
		if (!prefetching) return
		for (let id of unref(list)) {
			if (!prefetched.has(id)) {
				prefetched.add(id)
				prefetch(hrefToPath(`/notion/articles/${id}.json`))
			}
		}
		prefetching = false
	})
}
