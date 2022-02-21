export const isBrowser = typeof window !== 'undefined'

export function scrollToTop (): void {
	isBrowser && window.scrollTo({ top: 0 })
}

function hrefToHashMapKey (href: string): string {
	let parts = href
		.replace('.json', '')
		.replace('../..', '')
		.replace('/notion', '')
		.replace('/articles', '')
		.replace('/pagination', '')
		.split('/')
	if (parts.length === 3) {
		return `${parts[1]}-${parts[2]}`
	}
	return parts[1]
}

export function hrefToPath (href: string): string {
	let filePath = `${href}?import`

	if (import.meta.env.DEV) {
		filePath += `?t=${Date.now()}`
	} else {
		let key = hrefToHashMapKey(href)
		if (isBrowser) {
			let hash = __ABSORPTIE_HASH_MAP__[key]
			filePath = `/assets/${key}.${hash}.js`
		} else {
			filePath = `./${key}.js`
		}
	}

	return filePath
}
