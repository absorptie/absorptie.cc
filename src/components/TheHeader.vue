<template lang="pug">
header.header
	nav.header__nav
		ul.header__list
			li.header__item.--title(
				:class="{ '--fixed': isFixed }"
			)
				a.header__link(href="/" @click="scrollToTop") Absorptie
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useStore } from '@nanostores/vue'

import { scrollToTop } from '../utils'
import { routerStore } from '../router'

const page = useStore(routerStore)
const isFixed = computed(() => page.value?.route === 'IndexView')
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
		mix-blend-mode: difference

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
