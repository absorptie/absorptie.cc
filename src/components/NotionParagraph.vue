<template lang="pug">
p
	template(v-for="item in paragraph")
		template(v-if="item.type === 'text'") {{ item.content }}
		template(v-else)
			a-link(:href="item.href") {{ item.content }}
</template>

<script lang="ts" setup>
import ALink from './ALink.vue'
import type { ArticleBlockParagraphContent } from '../../build/types'

defineProps<{
	paragraph: ArticleBlockParagraphContent[]
}>()
</script>
