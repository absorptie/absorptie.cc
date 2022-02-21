<template lang="pug">
template(v-if="article")
	article.article
		h1.article__title {{ article.title }}
		feed-item.article__preview(
			v-if="article.sections[0].blocks[0].type === 'paragraph'"
			:alt="article.preview.image.alt"
			:src="article.preview.image.src"
			:sources="article.preview.image.sources"
			:vertical="true"
			:aspect-ratio="article.preview.image.aspectRatio"
		)
			template(#text)
				notion-paragraph.article__paragraph(
					:paragraph="article.sections[0].blocks[0].content"
				)
		section.article__section(
			v-for="section in article.sections.slice(1)"
			:class=`{ '--vertical': section.direction === 'vertical' }`
		)
			template(v-for="block in section.blocks")
				template(v-if="block.type === 'paragraph'")
					notion-paragraph.article__paragraph(:paragraph="block.content")
				template(v-else-if="block.type === 'image'")
					a-picture.article__image(
						v-for="{ sources, src, alt, aspectRatio } in block.content"
						:alt="alt"
						:src="src"
						:sources="sources"
						:aspect-ratio="aspectRatio"
					)
				template(v-else-if="block.type === 'column_list'")
					.article__column-list
						template(v-for="column in block.content")
							template(v-if="column.type === 'column_paragraph'")
								notion-paragraph.article__paragraph(:paragraph="column.content.content")
							template(v-else-if="column.type === 'column_image'")
								a-picture.article__image(
									v-for="{ sources, src, alt, aspectRatio } in column.content.content"
									:alt="alt"
									:src="src"
									:sources="sources"
									:half-width="true"
									:aspect-ratio="aspectRatio"
								)
							template(v-else-if="column.type === 'column_placeholder'")
				template(v-else-if="block.type === 'dl'")
					a-description-list
						template(#dt) {{ block.dt }}
						template(#dd)
							notion-paragraph(:paragraph="block.dd")
	section#credits
	a-description-list(v-if="article.author")
		template(#dt) Words by
		template(#dd) {{ article.author }}
	a-description-list(v-if="article.editor")
		template(#dt) Edited by
		template(#dd) {{ article.editor }}
</template>

<script lang="ts" setup>
import { useStore } from '@nanostores/vue'
import { computed } from 'vue'
import { useHead } from '@vueuse/head'

import ADescriptionList from '../components/ADescriptionList.vue'
import NotionParagraph from '../components/NotionParagraph.vue'
import FeedItem from '../components/FeedItem.vue'
import APicture from '../components/APicture.vue'
import { useArticle } from '../composables/use-article'
import { router } from '../router'

let page = useStore(router.store)
// @ts-ignore
let id = computed(() => page.value.params.id)
let article = useArticle(id)

useHead({
	title: computed(() => `${article.value?.title} on Absorptie`),
	meta: [
		{
			name: 'description',
			content: computed(() => article.value?.preview.text)
		}
	]
})
</script>

<style lang="stylus" scoped>
.article
	display: flex
	flex-direction: column
	gap: 301px

.article__title
	position: sticky
	top: 20px
	mix-blend-mode: difference

.article__preview
	margin-top: -321px

	@media (max-width: 630px)
		margin-top: 0

.article__section
	display: grid
	grid-template-columns: repeat(8, 1fr)
	gap: 10px

	@media (max-width: 830px)
		display: flex
		flex-direction: column

	&.--vertical
		.article__column-list
			grid-column: 1 / span 8

.article__paragraph
	grid-column: 1 / span 2
	padding-right: 5px

	@media (max-width: 830px)
		max-width: 180px
		padding-bottom: 20px

.article__image
	grid-column: 1 / span 8
	background: var(--a-color-placeholder)

.article__column-list
	display: grid
	grid-template-columns: repeat(4, 1fr)
	gap: 10px

	@media (max-width: 830px)
		display: flex
		flex-direction: column

	.article__paragraph
		grid-column: auto / span 1

	.article__image
		grid-column: auto / span 2

#credits
	display: grid
	grid-template-columns: repeat(8, 1fr)
	padding-bottom: 301px

	@media (max-width: 830px)
		display: flex
		flex-direction: column
</style>
