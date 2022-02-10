<template lang="pug">
a.a-link(:href="href" target="_blank" rel="noopener")
	slot
</template>

<script lang="ts" setup>
defineProps<{ href: string }>()
</script>
