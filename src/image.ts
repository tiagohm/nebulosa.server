import { Elysia } from 'elysia'

function openImage() {}

function closeImage() {}

function saveImage() {}

function analyzeImage() {}

function annotateImage() {}

function coordinateInterpolation() {}

function statistics() {}

function fovCameras() {}

function fovTelescopes() {}

export function image() {
	return new Elysia({ prefix: '/image' })
		.post('/open', () => openImage())
		.post('/close', () => closeImage())
		.post('/save', () => saveImage())
		.post('/analyze', () => analyzeImage())
		.post('/annotate', () => annotateImage())
		.get('/coordinate-interpolation', () => coordinateInterpolation())
		.post('/statistics', () => statistics())
		.get('/fov-cameras', () => fovCameras())
		.get('/fov-telescopes', () => fovTelescopes())
}
