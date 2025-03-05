import { Elysia } from 'elysia'
import fs from 'fs/promises'
import { type Fits, readFits } from 'nebulosa/src/fits'
import { type Image, readImageFromFits, writeImageToFormat } from 'nebulosa/src/image'
import { fileHandleSource } from 'nebulosa/src/io'
import cameras from '../data/cameras.json'
import telescopes from '../data/telescopes.json'
import { CLOSE_IMAGE_TYPE, type CloseImage, IMAGE_TRANSFORMATION_TYPE, type ImageTransformation, OPEN_IMAGE_TYPE, type OpenImage } from './types'

export interface CachedImage {
	fits?: Fits
	image?: Image
}

export function image() {
	return new Elysia({ prefix: '/image' })
		.post('/open', ({ query, body }) => openImage(query, body), { query: OPEN_IMAGE_TYPE, body: IMAGE_TRANSFORMATION_TYPE })
		.post('/close', ({ query }) => closeImage(query), { query: CLOSE_IMAGE_TYPE })
		.post('/save', () => saveImage())
		.post('/analyze', () => analyzeImage())
		.post('/annotate', () => annotateImage())
		.get('/coordinate-interpolation', () => coordinateInterpolation())
		.post('/statistics', () => statistics())
		.get('/fov-cameras', () => cameras)
		.get('/fov-telescopes', () => telescopes)
}

const images = new Map<string, CachedImage>()

async function openImage(q: OpenImage, t: ImageTransformation) {
	const handle = await fs.open(q.path)
	const source = fileHandleSource(handle)
	const fits = await readFits(source)

	if (fits) {
		const image = await readImageFromFits(fits)

		if (image) {
			const id = Bun.randomUUIDv7()
			await writeImageToFormat(image, '', t.useJPEG ? 'jpeg' : 'png')
			images.set(id, { fits, image })
		}
	}
}

function closeImage(q: CloseImage) {
	images.delete(q.id)
}

function saveImage() {}

function analyzeImage() {}

function annotateImage() {}

function coordinateInterpolation() {}

function statistics() {}
