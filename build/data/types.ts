import type {
	ListBlockChildrenResponse,
	QueryDatabaseParameters
} from '@notionhq/client/build/src/api-endpoints'

export type NotionLBCR = ListBlockChildrenResponse['results'][0]
export type NotionBlockColumnList = Extract<NotionLBCR, { type: 'column_list' }>
export type NotionBlockParagraph = Extract<NotionLBCR, { type: 'paragraph' }>
export type NotionBlockToggle = Extract<NotionLBCR, { type: 'toggle' }>
export type NotionBlockImage = Extract<NotionLBCR, { type: 'image' }>

export type DatabaseQueryFilter = QueryDatabaseParameters['filter']

export type CategoriesList = Array<{
	id: string
	name: string
}>

export interface PaginationFile {
	items: PreviewedArticle[]
	next: boolean
}

export interface ArticleMeta {
	id: string
	title: string
	slug: string
	category: string
	author?: string
	editor?: string
	status: string
	created_time: string
	last_edited_time: string
}

export interface ArticlePreview {
	text: string
	image: ArticleBlockImageItem
}

export type PreviewedArticle = ArticleMeta & {
	preview: ArticlePreview
}

export type CompiledArticle = PreviewedArticle & {
	sections: ArticleSection[]
}

export interface ArticleBlockParagraphContentText {
	type: 'text'
	content: string
}

export interface ArticleBlockParagraphContentLink {
	type: 'link'
	content: string
	href: string
}

export type ArticleBlockParagraphContent =
	| ArticleBlockParagraphContentText
	| ArticleBlockParagraphContentLink

export interface ArticleBlockParagraph {
	id: string
	type: 'paragraph'
	content: ArticleBlockParagraphContent[]
}

export type ArticleBlockImageItem = ProcessedImage & {
	alt: string
}

export interface ArticleBlockImage {
	id: string
	type: 'image'
	content: ArticleBlockImageItem[]
}

export interface ArticleBlockDL {
	id: string
	type: 'dl'
	dt: string
	dd: ArticleBlockParagraphContent[]
}

export interface ArticleBlockColumnImage {
	id: string
	type: 'column_image'
	content: ArticleBlockImage
}

export interface ArticleBlockColumnParagraph {
	id: string
	type: 'column_paragraph'
	content: ArticleBlockParagraph
}

export interface ArticleBlockColumnPlaceholder {
	id: string
	type: 'column_placeholder'
}

export type ArticleBlockColumn =
	| ArticleBlockColumnPlaceholder
	| ArticleBlockColumnParagraph
	| ArticleBlockColumnImage

export interface ArticleBlockColumnList {
	id: string
	type: 'column_list'
	content: ArticleBlockColumn[]
}

export type ArticleBlock =
	| ArticleBlockColumnList
	| ArticleBlockParagraph
	| ArticleBlockImage
	| ArticleBlockDL

export interface ArticleSection {
	direction: 'horizontal' | 'vertical'
	blocks: ArticleBlock[]
}

export interface SquooshEncodeResult {
	optionsUsed: object
	binary: Uint8Array
	extension: string
	size: number
}

export interface SquooshEncodedWith {
	[key: string]: SquooshEncodeResult
}

export interface SquooshImage {
	encodedWith: Promise<SquooshEncodedWith>
}

export interface PreprocessedImages {
	[size: string]: SquooshImage
}

export interface ProcessedImage {
	src: string
	sources: {
		[key: string]: string
	}
	aspectRatio: string
}
