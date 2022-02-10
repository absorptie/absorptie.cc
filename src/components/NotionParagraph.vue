<script lang="ts">
import { defineComponent, h } from 'vue'
import type { PropType, VNodeChild } from 'vue'

import type { ArticleBlockParagraphContent } from '../../build/types'

export default defineComponent({
	props: {
		paragraph: {
			type: Array as PropType<ArticleBlockParagraphContent[]>,
			required: true
		}
	},
	setup (props) {
		return (): VNodeChild => h('p', props.paragraph.map(item => {
			return item.type === 'text'
				? item.content
				: h('a', {
					href: item.href,
					target: '_blank',
					rel: 'noopener'
				}, item.content)
		}))
	}
})
</script>
