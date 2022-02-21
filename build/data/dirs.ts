import { join } from 'node:path'

export const articlesFolder = './articles'
export const paginationsFolder = './pagination'

export const root = process.cwd()
export const notionDir = join(root, './notion')
export const articlesPath = join(notionDir, articlesFolder)
export const paginationsPath = join(notionDir, paginationsFolder)
