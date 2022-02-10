<template lang="pug">
header.header
	nav.header__nav
		ul.header__list
			li.header__item.--title(
				:class="{ '--fixed': isFixedTitle }"
			)
				a.header__link(href="/" @click="scrollTop") Absorptie
			//- li.header__item.--feed
			//- 	a-select(
			//- 		v-if="showFeedCategories"
			//- 		v-model="feedCategory"
			//- 		:options="categories"
			//- 	)
			//- 	a.header__link(v-else href="/") Feed
			//- li.header__item.--shop
			//- 	a-select(
			//- 		v-if="showShopCategories"
			//- 		v-model="shopCategory"
			//- 		:options="shopCategories"
			//- 	)
			//- 	a.header__link(v-else href="/shop") Shop
</template>

<script lang="ts" setup>
import { computed } from 'vue'
// import { openPage } from '@nanostores/router'
import { useStore } from '@nanostores/vue'

// import categories from '../assets/categories.json'
// import ASelect from './ASelect.vue'
import { router } from '../router'

const page = useStore(router)
const isFixedTitle = computed(() => page.value?.route === 'IndexView')

// const feedCategory = computed({
// 	// @ts-ignore
// 	get: () => page.value?.params.category || '',
// 	set: value => {
// 		openPage(router, 'IndexView', { category: value })
// 	}
// })

// const shopCategory = computed({
// 	// @ts-ignore
// 	get: () => page.value?.params.category || '',
// 	set: value => {
// 		openPage(router, 'ShopView', { category: value })
// 	}
// })

// const showFeedCategories = computed(() => page.value?.route === 'IndexView')
// const showShopCategories = computed(() => page.value?.route === 'ShopView')

function scrollTop (): void {
	window.scrollTo({ top: 0 })
}
</script>

<style lang="stylus" scoped>
.header,
.header__nav,
.header__list
	height: 270px

.header__list
	display: grid
	grid-template-columns: repeat(8, 1fr)
	gap: 10px

	@media (max-width: 830px)
		grid-template-columns: 1fr auto auto

.header__item
	grid-column-end: span 2

	@media (max-width: 830px)
		& :deep(.a-select)
			text-align: right
			direction: rtl

	&.--title
		position: sticky
		top: 20px
		grid-column-end: span 2

	&.--feed
		grid-column-start: 5

	&.--shop
		grid-column-start: 7

		@media (max-width: 830px)
			justify-self: flex-end

	&.--fixed
		position: fixed

.header__link
	text-decoration: none
</style>
