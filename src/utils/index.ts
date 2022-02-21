export const isBrowser = typeof window !== 'undefined'

export function scrollToTop (): void {
	isBrowser && window.scrollTo({ top: 0 })
}
