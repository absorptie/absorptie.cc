import { join } from 'node:path'

export const root = process.cwd()
export const outDir = join(root, './dist')
export const template = join(root, './index.html')
export const tempOutDir = join(root, './node_modules/.absorptie/ssg')
