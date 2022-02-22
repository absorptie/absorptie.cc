<template lang="pug">
section.about
	article.about__article
		.about__article-column
			p An independent digital magazine about the design fundamentals. We carefully collect, research and publish various industry-relevant examples of architecture, interior, industrial and graphic design. Focusing on the expressive, the expressive and the constructive to delve more deeply into the aesthetic impact of color and form. Aiming to inspire more people to see, feel and understand. Showing the connection between the present and the past and revealing the importance of design in everyday life.
		.about__article-column
			p Initiated as a side project by a couple of independent designers, Eduard and Valery. We are open for collaboration and sponsorship. If you like what we do, support us with a regular donation. This will help us make the project better and release new content more frequently.
section.feed
	a.feed__link(
		v-for="article in items"
		:key="article.id"
		:href="article.category.toLowerCase() + '/' + article.id"
	)
		feed-item(
			:alt="article.preview.image.alt"
			:src="article.preview.image.src"
			:sources="article.preview.image.sources"
			:aspect-ratio="article.preview.image.aspectRatio"
		)
			template(#title)
				h2 {{ article.title }}
			template(#text)
				p {{ article.preview.text }}
div(ref="endOfFeedEl")
</template>

<script lang="ts" setup>
import { useIntersectionObserver } from '@vueuse/core'
import { useHead } from '@vueuse/head'
import { ref } from 'vue'

import { useFeed } from '../composables/use-feed'
import FeedItem from '../components/FeedItem.vue'

const endOfFeedEl = ref(null)
const category = ref('feed')

const { items, hasMore, loadMore } = useFeed(category)

useIntersectionObserver(
	endOfFeedEl,
	([{ isIntersecting }]) => {
		if (isIntersecting && hasMore.value) {
			loadMore()
		}
	}
)

useHead({
	title: 'Absorptie',
	meta: [
		{
			name: 'description',
			content: 'An independent digital magazine about the design fundamentals. We carefully collect, research and publish various industry-relevant examples of architecture, interior, industrial and graphic design. Focusing on the expressive, the expressive and the constructive to delve more deeply into the aesthetic impact of color and form.'
		}
	]
})
</script>

<style lang="stylus" scoped>
.about
	display: flex
	align-items: flex-end
	height: 633px
	min-height: 600px
	max-height: calc(100vh - 120px)

.about__article
	display: grid
	grid-template-columns: repeat(8, 1fr)
	gap: 10px

	@media (max-width: 830px)
		display: flex
		flex-direction: column
		gap: 20px

.about__article-column
	grid-area: 1 / span 2
	padding-right: 5px

	@media (max-width: 830px)
		max-width: 180px

.feed
	display: flex
	flex-direction: column
	gap: 301px

.feed__link
	text-decoration: none

.feed__link:hover
	color: inherit
</style>
