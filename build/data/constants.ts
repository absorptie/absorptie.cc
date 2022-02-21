import dotenv from 'dotenv'

dotenv.config()

export const PAGE_SIZE = 2

export const NOTION_TOKEN = process.env.ABSORPTIE_NOTION_TOKEN as string
export const NOTION_VERSION = process.env.ABSORPTIE_NOTION_VERSION as string
export const NOTION_DATABASE_ID = process.env.ABSORPTIE_NOTION_DATABASE_ID as string

export const AWS_ACCESS_KEY_ID = process.env.ABSORPTIE_AWS_ACCESS_KEY_ID as string
export const AWS_SECRET_ACCESS_KEY = process.env.ABSORPTIE_AWS_SECRET_ACCESS_KEY as string
