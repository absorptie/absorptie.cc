import { ImagePool } from '@squoosh/lib'
import { URL } from 'node:url'
import sizeOf from 'image-size'
import fetch from 'node-fetch'

import { uploadImage } from './s3.js'
import { log } from './logger.js'
import type { PreprocessedImages, ProcessedImage } from './types.js'

let cache: {
	[uid: string]: ProcessedImage | undefined
} = {}

async function downloadImage (url: string): Promise<Buffer> {
	let response = await fetch(url)
	if (!response.ok || !response.body) {
		throw new Error(`Unexpected response ${response.statusText}`)
	}
	let arrayBuffer = await response.arrayBuffer()
	return Buffer.from(arrayBuffer)
}

function getAspectRatio (buffer: Buffer): string {
	let size = sizeOf(buffer)
	if (!size.width || !size.height) return '0'
	return Number(size.width / size.height).toFixed(4)
}

interface PreprocessImageOptions {
	sizeKey: 'height' | 'width'
	sizes: number[]
}

const defaultPreprocessOptions: PreprocessImageOptions = {
	sizeKey: 'width',
	sizes: [385, 770, 1540]
}

async function preprocessImage (
	buffer: Buffer,
	opts: PreprocessImageOptions
): Promise<PreprocessedImages> {
	let images: PreprocessedImages = {}

	let pool = new ImagePool()
	let image

	for (let size of opts.sizes) {
		image = pool.ingestImage(buffer)
		await image.decoded
		await image.preprocess({
			resize: {
				enabled: true,
				[opts.sizeKey]: size
			}
		})
		await image.encode({
			mozjpeg: {},
			webp: {}
		})
		images[`${size}`] = image
	}

	await pool.close()

	return images
}

export async function processImage (
	url: string,
	s3folder: string,
	preprocessOpts: PreprocessImageOptions = defaultPreprocessOptions
): Promise<ProcessedImage> {
	let sources = {}
	let src

	let uid = new URL(url).pathname

	log('Processing image', uid)
	let isCached = cache[uid]
	if (isCached) return isCached

	let buffer = await downloadImage(url)
	let aspectRatio = getAspectRatio(buffer)
	let images = await preprocessImage(buffer, preprocessOpts)

	for (let [size, image] of Object.entries(images)) {
		for await (let encodedImage of Object.values(image.encodedWith)) {
			let extension = encodedImage.extension
			let _src = await uploadImage(
				Buffer.from(encodedImage.binary.buffer),
				extension,
				s3folder
			)
			let source = sources[`${extension}`] || (sources[`${extension}`] = [])
			source.push(`${_src} ${size}w`)

			if (
				!src &&
				extension === 'jpg' &&
				Number(size) === preprocessOpts.sizes[preprocessOpts.sizes.length - 1]
			) {
				src = _src
			}
		}
	}

	for (let [key, source] of Object.entries(sources)) {
		sources[key] = (source as string[]).join(', ')
	}

	cache[uid] = { src, sources, aspectRatio }
	return { src, sources, aspectRatio }
}
