<template lang="pug">
dl.a-dl
	dt
		slot(name="dt")
	dd
		slot(name="dd")
</template>

<style lang="stylus" scoped>
.a-dl
	display: grid
	grid-column: auto / span 2
	gap: 10px

	@media (max-width: 830px)
		max-width: 180px
		padding-bottom: 30px
</style>
