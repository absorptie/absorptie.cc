import { Client } from '@notionhq/client'
import dotenv from 'dotenv'

dotenv.config()

export const DATABASE_ID = process.env.NOTION_DATABASE_ID as string

export const notion = new Client({
	auth: process.env.NOTION_TOKEN,
	notionVersion: process.env.NOTION_VERSION
})
