<template lang="pug">
the-header
main.main
	component(:is="component")
the-footer
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { router } from './router'
import TheHeader from './components/TheHeader.vue'
import TheFooter from './components/TheFooter.vue'

const component = computed(() => router.component.value)
</script>

<style lang="stylus" scoped>
.main
	display: flex
	flex-direction: column
	gap: 301px
</style>
