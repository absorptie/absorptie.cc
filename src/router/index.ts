import { createRouter } from '@nanostores/router'

interface Routes {
	'IndexView': void
	// 'PostView': 'id'
}

export let router = createRouter<Routes>({
	'IndexView': '/'
})
