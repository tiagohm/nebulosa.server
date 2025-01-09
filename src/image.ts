import { Elysia, t } from 'elysia'
import cameras from '../data/cameras.json' with { type: 'json' }
import telescopes from '../data/telescopes.json' with { type: 'json' }

const OpenImageQuery = t.Object({
	path: t.String(),
	camera: t.Optional(t.String()),
})

function openImage(data: typeof OpenImageQuery.static) {
	//
}

const CloseImageQuery = t.Object({
	path: t.String(),
})

function closeImage(data: typeof CloseImageQuery.static) {
	//
}

function saveImage() {}

function analyzeImage() {}

function annotateImage() {}

function coordinateInterpolation() {}

function statistics() {}

export function image() {
	return new Elysia({ prefix: '/image' })
		.post('/open', ({ query }) => openImage(query), { query: OpenImageQuery })
		.post('/close', ({ query }) => closeImage(query), { query: CloseImageQuery })
		.post('/save', () => saveImage())
		.post('/analyze', () => analyzeImage())
		.post('/annotate', () => annotateImage())
		.get('/coordinate-interpolation', () => coordinateInterpolation())
		.post('/statistics', () => statistics())
		.get('/fov-cameras', () => cameras)
		.get('/fov-telescopes', () => telescopes)
}
