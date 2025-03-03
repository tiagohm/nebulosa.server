import { Elysia, type Static, t } from 'elysia'
import fs from 'fs/promises'
import { type Fits, readFits } from 'nebulosa/src/fits'
import { type Image, fromFits, toFormat } from 'nebulosa/src/image'
import { fileHandleSource } from 'nebulosa/src/io'
import cameras from '../data/cameras.json'
import telescopes from '../data/telescopes.json'

const OPEN_IMAGE_QUERY = t.Object({
	path: t.String(),
	camera: t.Optional(t.String()),
})

const CLOSE_IMAGE_QUERY = t.Object({
	id: t.String(),
})

const IMAGE_STRETCH_QUERY = t.Object({
	auto: t.Boolean(),
	shadow: t.Integer(),
	highlight: t.Integer(),
	midtone: t.Integer(),
	meanBackground: t.Number(),
})

const IMAGE_SCNR_QUERY = t.Object({
	channel: t.Union([t.Literal('GRAY'), t.Literal('RED'), t.Literal('GREEN'), t.Literal('BLUE')]),
	amount: t.Number(),
	method: t.Union([t.Literal('MAXIMUM_MASK'), t.Literal('ADDITIVE_MASK'), t.Literal('AVERAGE_NEUTRAL'), t.Literal('MAXIMUM_NEUTRAL'), t.Literal('MINIMUM_NEUTRAL')]),
})

const IMAGE_ADJUSTMENT_LEVEL_QUERY = t.Object({
	enabled: t.Boolean(),
	value: t.Number(),
})

const IMAGE_ADJUSTMENT_QUERY = t.Object({
	enabled: t.Boolean(),
	contrast: IMAGE_ADJUSTMENT_LEVEL_QUERY,
	brightness: IMAGE_ADJUSTMENT_LEVEL_QUERY,
	exposure: IMAGE_ADJUSTMENT_LEVEL_QUERY,
	gamma: IMAGE_ADJUSTMENT_LEVEL_QUERY,
	saturation: IMAGE_ADJUSTMENT_LEVEL_QUERY,
	fade: IMAGE_ADJUSTMENT_LEVEL_QUERY,
})

const IMAGE_TRANSFORMATION_QUERY = t.Object({
	force: t.Boolean(),
	calibrationGroup: t.Optional(t.String()),
	debayer: t.Boolean(),
	stretch: IMAGE_STRETCH_QUERY,
	mirrorHorizontal: t.Boolean(),
	mirrorVertical: t.Boolean(),
	invert: t.Boolean(),
	scnr: IMAGE_SCNR_QUERY,
	useJPEG: t.Boolean(),
	adjustment: IMAGE_ADJUSTMENT_QUERY,
})

export type ImageTransformation = Readonly<Static<typeof IMAGE_TRANSFORMATION_QUERY>>

export type OpenImage = Readonly<Static<typeof OPEN_IMAGE_QUERY>>

export type CloseImage = Readonly<Static<typeof CLOSE_IMAGE_QUERY>>

export interface CachedImage {
	fits?: Fits
	image?: Image
}

export function image() {
	return new Elysia({ prefix: '/image' })
		.post('/open', ({ query, body }) => openImage(query, body), { query: OPEN_IMAGE_QUERY, body: IMAGE_TRANSFORMATION_QUERY })
		.post('/close', ({ query }) => closeImage(query), { query: CLOSE_IMAGE_QUERY })
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
		const image = await fromFits(fits)

		if (image) {
			const id = Bun.randomUUIDv7()
			await toFormat(image, '', t.useJPEG ? 'jpeg' : 'png')
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
