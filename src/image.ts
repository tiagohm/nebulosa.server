import { Elysia, type Static, t } from 'elysia'
import cameras from '../data/cameras.json'
import telescopes from '../data/telescopes.json'

const OpenImageQuery = t.Object({
	path: t.String(),
	camera: t.Optional(t.String()),
})

export type OpenImage = Readonly<Static<typeof OpenImageQuery>>

const CloseImageQuery = t.Object({
	path: t.String(),
})

export type CloseImage = Readonly<Static<typeof CloseImageQuery>>

export const image = new Elysia({ prefix: '/image' })
	.post('/open', ({ query }) => openImage(query), { query: OpenImageQuery })
	.post('/close', ({ query }) => closeImage(query), { query: CloseImageQuery })
	.post('/save', () => saveImage())
	.post('/analyze', () => analyzeImage())
	.post('/annotate', () => annotateImage())
	.get('/coordinate-interpolation', () => coordinateInterpolation())
	.post('/statistics', () => statistics())
	.get('/fov-cameras', () => cameras)
	.get('/fov-telescopes', () => telescopes)

function openImage(q: OpenImage) {}

function closeImage(q: CloseImage) {}

function saveImage() {}

function analyzeImage() {}

function annotateImage() {}

function coordinateInterpolation() {}

function statistics() {}
