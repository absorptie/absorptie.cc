<template lang="pug">
.a-picture
	picture
		source(
			v-for="(source, key) in sources"
			:type="String(key)"
			:srcset="source"
			:sizes="sizes"
		)
		img.a-picture__img(
			:src="src"
			:alt="alt"
			loading="lazy"
		)
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
	alt: string
	src: string
	sources: {
		[key: string]: string
	}
	vertical?: boolean
	halfWidth?: boolean
	aspectRatio?: string
}>()

const sizes = computed(() => {
	if (props.vertical && props.aspectRatio) {
		let ar = Number(props.aspectRatio)
		return `сalc((100vh - 120px) * ${ar}), (max-height: 720px and min-width: 830px) calc(600px * ${ar})`
	}
	return props.halfWidth
		? 'calc(100vw - 2 * 30px), (max-width: 830px) 380px'
		: 'calc(100vw - 2 * 30px), (max-width: 830px) 770px'
})
</script>

<style lang="stylus" scoped>
.a-picture__img
	width: 100%
	height: 100%
	object-fit: cover
	aspect-ratio: v-bind('aspectRatio')
	vertical-align: middle
</style>
