import type { Plugin } from 'vite'

const hashRE = /\.(\w+)\.js$/
const articleRE = /notion\/.+json$/

export function prefetchHashMapPlugin (
	hashMap: Record<string, string>
): Plugin {
	return {
		name: 'absorptie:prefetchHashMap',
		generateBundle (_, bundle): void {
			for (let name in bundle) {
				let chunk = bundle[name]
				if (
					chunk.type === 'chunk' &&
					chunk.facadeModuleId &&
					articleRE.test(chunk.facadeModuleId)
				) {
					let hash = chunk.fileName.match(hashRE)?.[1]
					if (hash) {
						let key = chunk.name.toLowerCase()
						hashMap[key] = hash
					}
				}
			}
		}
	}
}
