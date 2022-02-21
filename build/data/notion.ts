import { Client } from '@notionhq/client'

import { NOTION_TOKEN, NOTION_VERSION } from './constants.js'

export const notion = new Client({
	auth: NOTION_TOKEN,
	notionVersion: NOTION_VERSION
})
