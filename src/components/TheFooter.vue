<template lang="pug">
footer.footer
	a-description-list
		template(#dt) If you like what we do, support us with a regular donation. This will help us make the project better and release new content more frequently.
		template(#dd)
			a-link(href="https://gumroad.com/absorptie") Support us
	.footer__connect
		a-description-list
			template(#dt) We are open for collaboration and sponsorship.
			template(#dd)
				a-link(href="mailto:hello@absorptie.cc") Send request
		a-description-list
			template(#dt) Suggest to publish about something you love or were involved in creating.
			template(#dd)
				a-link(href="mailto:hello@absorptie.cc") Send submission
	.footer__follow
		a(href="/")
			img.footer__logo(src="../assets/logo.png" width="19" height="50")
		ul.footer__follow-list
			li
				a-link(href="https://instagram.com/absorptie") Instagram
			li
				a-link(href="https://facebook.com/absorptie") Facebook
			li
				a-link(href="https://twitter.com/absorptie") Twitter
			li
				a-link(href="https://t.me/absorptie") Telegram
			li
				a-link(href="https://pinterest.com/absorptie") Pinterest
			li
				a-link(href="https://vk.com/absorptie") VK
</template>

<script lang="ts" setup>
import ADescriptionList from './ADescriptionList.vue'
import ALink from './ALink.vue'
</script>

<style lang="stylus" scoped>
.footer
	display: grid
	grid-template-columns: repeat(8, 1fr)
	gap: 301px 10px

	@media (max-width: 830px)
		display: flex
		flex-direction: column

	> *
		grid-column: 1 / span 2

.footer__connect
	display: grid
	gap: 60px

.footer__follow
	display: grid
	gap: 60px

.footer__logo
	padding-left: 2px

.footer__follow-list
	display: flex
	gap: 20px

	@media (max-width: 830px)
		flex-wrap: wrap
</style>
