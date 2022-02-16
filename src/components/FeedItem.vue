<template lang="pug">
component(:is="tag").feed-item
	a-picture.feed-item__image(
		:alt="alt"
		:src="src"
		:sources="sources"
		:vertical="true"
		:aspect-ratio="aspectRatio"
	)
	.feed-item__text
		div
			slot(name="title")
		slot(name='text')
</template>

<script lang="ts" setup>
import APicture from './APicture.vue'

interface Props {
	tag?: string
	alt: string
	src: string
	sources: {
		[key: string]: string
	}
	aspectRatio: string
}

withDefaults(defineProps<Props>(), {
	tag: 'article'
})
</script>

<style lang="stylus" scoped>
.feed-item
	display: grid
	grid-template-columns: repeat(8, 1fr)
	gap: 10px
	height: 903px
	min-height: 600px
	max-height: calc(100vh - 120px)

	@media (max-width: 830px)
		grid-template-columns: 1fr 1fr

	@media (max-width: 630px)
		grid-template-rows: 1fr min-content
		grid-template-columns: 1fr
		gap: 40px
		height: auto
		max-height: initial

.feed-item__text
	display: flex
	flex-direction: column
	grid-area: 1 / span 2
	gap: 40px
	justify-content: space-between

	@media (max-width: 830px)
		grid-area: 1 / span 1
		gap: 20px
		max-width: 180px

	@media (max-width: 630px)
		grid-area: 2 / 1
		justify-content: initial

.feed-item__image
	grid-column: 5 / span 4
	background: var(--a-color-placeholder)

	@media (max-width: 830px)
		grid-column: 2 / span 1
		height: 903px
		min-height: 600px
		max-height: calc(100vh - 120px)

	@media (max-width: 630px)
		grid-area: 1 / 1
		max-width: 335px
</style>
