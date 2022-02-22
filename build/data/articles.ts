import { promises as fs } from 'node:fs'
import { join } from 'node:path'

import { articlesFolder, articlesPath } from './dirs.js'
import { cleanupBucketFolder } from './s3.js'
import { processImage } from './images.js'
import { notion } from './notion.js'
import { log } from '../logger/index.js'
import type {
	ArticleBlockParagraphContent,
	ArticleBlockColumnList,
	ArticleBlockImageItem,
	ArticleBlockParagraph,
	ArticleBlockColumn,
	ArticleBlockImage,
	ArticlePreview,
	ArticleBlockDL,
	ArticleSection,
	ArticleBlock,
	ArticleMeta,
	NotionBlockColumnList,
	NotionBlockParagraph,
	NotionBlockToggle,
	NotionBlockImage
} from './types.js'

function compileParagraphBlock (block: NotionBlockParagraph): ArticleBlockParagraph {
	return {
		id: block.id,
		type: block.type,
		content: block.paragraph.text.reduce<ArticleBlockParagraphContent[]>(
			(prev, current) => {
				// skip all except the text
				if (current.type === 'text') {
					if (!current.text.link) {
						// skip bold and other annotations
						// so, concat paragraph with previous paragraph
						if (
							prev.length > 0 &&
							prev[prev.length - 1].type === 'text'
						) {
							prev[prev.length - 1].content += current.text.content
						} else {
							prev.push({
								type: 'text',
								content: current.text.content
							})
						}
					} else {
						prev.push({
							type: 'link',
							content: current.text.content,
							href: current.text.link.url
						})
					}
				}
				return prev
			},
			[]
		)
	}
}

async function compileImageBlock (block: NotionBlockImage, articleId: string): Promise<ArticleBlockImage> {
	let content: ArticleBlockImageItem[] = []
	let alt = ''
	if (
		block.image.caption.length > 0 &&
		block.image.caption[0].type === 'text'
	) {
		alt = block.image.caption[0].text.content
	}
	if (block.image.type === 'file') {
		let processedImage = await processImage(block.image.file.url, articleId)
		content.push({ alt, ...processedImage })
	}
	return {
		id: block.id,
		type: 'image',
		content
	}
}

async function compileColumnList (
	block: NotionBlockColumnList,
	articleId: string
): Promise<ArticleBlockColumnList> {
	let { results: columnList } = await notion.blocks.children.list({
		block_id: block.id,
		page_size: 2
	})

	let content: ArticleBlockColumn[] = []

	for (let column of columnList) {
		let { results: [columnBlock] } = await notion.blocks.children.list({
			block_id: column.id,
			page_size: 1
		})

		let id = column.id

		// thanks to fucking Notion
		if (!('created_time' in columnBlock)) continue

		if (columnBlock.type === 'paragraph') {
			if (columnBlock.paragraph.text.length === 0) {
				content.push({
					id,
					type: 'column_placeholder'
				})
			} else {
				content.push({
					id,
					type: 'column_paragraph',
					content: compileParagraphBlock(columnBlock)
				})
			}
		} else if (columnBlock.type === 'image') {
			content.push({
				id,
				type: 'column_image',
				content: await compileImageBlock(columnBlock, articleId)
			})

			// set min aspect ratio for both images
			if (
				content.length === 2 &&
				content[0].type === 'column_image' &&
				content[1].type === 'column_image' &&
				content[0].content.content[0].aspectRatio !== content[1].content.content[0].aspectRatio
			) {
				content[0].content.content[0].aspectRatio = content[1].content.content[0].aspectRatio = Math.min(
					Number(content[0].content.content[0].aspectRatio),
					Number(content[1].content.content[0].aspectRatio)
				).toString()
			}
		}
	}

	return {
		id: block.id,
		type: 'column_list',
		content
	}
}

async function compileDL (block: NotionBlockToggle): Promise<ArticleBlockDL> {
	let { results: childrenBlockList } = await notion.blocks.children.list({
		block_id: block.id,
		page_size: 100
	})

	let dd: ArticleBlockParagraphContent[] = []
	for (let childrenBlock of childrenBlockList) {
		// thanks to fucking Notion
		if (!('created_time' in childrenBlock)) continue

		// skip all but paragraph
		if (childrenBlock.type !== 'paragraph') continue

		let paragraph = compileParagraphBlock(childrenBlock)

		// concat text with previous text
		if (
			dd.length > 0 &&
			dd[dd.length - 1].type === 'text' &&
			paragraph.content.length > 0 &&
			paragraph.content[0].type === 'text'
		) {
			dd[dd.length - 1].content += ` ${paragraph.content[0].content}`
			dd = [...dd, ...paragraph.content.slice(1)]
		} else {
			dd = [...dd, ...paragraph.content]
		}
	}

	return {
		id: block.id,
		type: 'dl',
		dt: block.toggle.text[0].plain_text,
		dd
	}
}

async function compileBlocks (articleId: string): Promise<ArticleBlock[]> {
	let blocks: ArticleBlock[] = []

	let run = true
	let cursor

	while (run) {
		let { results, next_cursor } = await notion.blocks.children.list({
			block_id: articleId,
			start_cursor: cursor,
			page_size: 100
		})

		for (let block of results) {
			// thanks to fucking Notion
			if (!('created_time' in block)) continue

			if (!block.has_children) {
				if (block.type === 'paragraph') {
					// compile paragraph
					blocks.push(compileParagraphBlock(block))
				} else if (block.type === 'image') {
					blocks.push(
						await compileImageBlock(block, articleId)
					)
				}
			}

			if (block.has_children) {
				if (block.type === 'column_list') {
					blocks.push(
						await compileColumnList(block, articleId)
					)
				} else if (block.type === 'toggle') {
					blocks.push(
						await compileDL(block)
					)
				}
			}
		}

		if (cursor) {
			cursor = next_cursor
		} else {
			run = false
		}
	}

	return blocks
}

function compileSections (blocks: ArticleBlock[]): ArticleSection[] {
	let nextSection = false
	return blocks.reduce<ArticleSection[]>((sections, block) => {
		if (
			block.type === 'paragraph' &&
			block.content.length === 0
		) {
			nextSection = true
		} else {
			if (nextSection) {
				nextSection = false
				sections.push({ direction: 'horizontal', blocks: [] })
			}
			if (block.type === 'column_list' || block.type === 'image') {
				sections[sections.length - 1].direction = 'vertical'
			}
			sections[sections.length - 1].blocks.push(block)
		}
		return sections
	}, [{ direction: 'horizontal', blocks: [] }])
}

async function compilePreview (
	blocks: ArticleBlock[],
	articleId: string
): Promise<ArticlePreview> {
	let text
	let image
	for (let block of blocks) {
		if (block.type === 'paragraph' && !text) {
			text = block.content.map(item => item.content).join(' ')
		} else if (block.type === 'image' && !image) {
			image = await processImage(block.content[0].src, articleId, {
				sizeKey: 'width',
				sizes: [300, 600, 900, 1200, 1800]
			})
			image.alt = block.content[0].alt
		}
		if (text && image) break
	}
	return { text, image }
}

export async function compileArticles (articlesList: ArticleMeta[]): Promise<void> {
	await fs.mkdir(articlesPath, { recursive: true })

	for (let article of articlesList) {
		log('Compiling article', article.id)
		await cleanupBucketFolder(article.id)
		let blocks = await compileBlocks(article.id)
		let sections = compileSections(blocks)
		let preview = await compilePreview(blocks, article.id)

		let articleFile = `${article.id}.json`
		let articlePath = join(articlesPath, articleFile)

		await fs.writeFile(
			articlePath,
			JSON.stringify({ ...article, preview, sections }, null, '\t'),
			'utf8'
		)
	}
}
