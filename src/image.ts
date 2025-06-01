import Elysia, { t, type Static } from 'elysia'
import fs from 'fs/promises'
import { readFits } from 'nebulosa/src/fits'
import { adf, debayer, horizontalFlip, invert, readImageFromFits, scnr, stf, verticalFlip, writeImageToFormat, type Image, type ImageFormat, type WriteImageToFormatOptions } from 'nebulosa/src/image'
import { fileHandleSource } from 'nebulosa/src/io'
import os from 'os'
import { join } from 'path'
import fovCameras from '../data/cameras.json' with { type: 'json' }
import fovTelescopes from '../data/telescopes.json' with { type: 'json' }
import type { ImageInfo } from './types'
import { X_IMAGE_INFO_HEADER } from './types'

const ImageStretchBody = t.Object({
	auto: t.Boolean({ default: true }),
	shadow: t.Integer(), // 0 - 65536
	highlight: t.Integer(), // 0 - 65536
	midtone: t.Integer(), // 0 - 65536
	meanBackground: t.Number(),
})

const ImageScnrBody = t.Object({
	channel: t.Optional(t.Union([t.Literal('RED'), t.Literal('GREEN'), t.Literal('BLUE')])),
	amount: t.Number(),
	method: t.Union([t.Literal('MAXIMUM_MASK'), t.Literal('ADDITIVE_MASK'), t.Literal('AVERAGE_NEUTRAL'), t.Literal('MAXIMUM_NEUTRAL'), t.Literal('MINIMUM_NEUTRAL')]),
})

const ImageAdjustmentBody = t.Object({
	enabled: t.Boolean(),
	normalize: t.Boolean(),
	brightness: t.Number(),
	gamma: t.Number(),
	saturation: t.Number(),
})

const ImageTransformationBody = t.Object({
	calibrationGroup: t.Optional(t.String()),
	debayer: t.Boolean(),
	stretch: ImageStretchBody,
	horizontalMirror: t.Boolean(),
	verticalMirror: t.Boolean(),
	invert: t.Boolean(),
	scnr: ImageScnrBody,
	useJPEG: t.Boolean(),
	adjustment: ImageAdjustmentBody,
})

const OpenImageBody = t.Object({
	path: t.Optional(t.String()),
	camera: t.Optional(t.String()),
	transformation: ImageTransformationBody,
})

const CloseImageBody = t.Object({
	id: t.String(),
})

export type ImageTransformation = Static<typeof ImageTransformationBody>
export type ImageScnr = Static<typeof ImageScnrBody>
export type ImageStretch = Static<typeof ImageStretchBody>
export type ImageAdjustment = Static<typeof ImageAdjustmentBody>

export type OpenImage = Static<typeof OpenImageBody>
export type CloseImage = Static<typeof CloseImageBody>

export class ImageService {
	async open(req: OpenImage) {
		if (req.path) {
			const handle = await fs.open(req.path)
			await using source = fileHandleSource(handle)
			const fits = await readFits(source)

			if (fits) {
				const image = await readImageFromFits(fits)

				if (image) {
					const id = Bun.MD5.hash(req.path, 'hex')
					const format = req.transformation.useJPEG ? 'jpeg' : 'png'
					const path = join(os.tmpdir(), `${id}.${format}`)
					const output = await this.transformImageAndSave(image, path, format, req.transformation)

					if (output) {
						const info: ImageInfo = {
							path,
							width: output.width,
							height: output.height,
							mono: output.channels === 1,
							metatada: image.metadata,
							transformation: req.transformation,
							headers: image.header,
							format,
						}

						return info
					}
				}
			}
		}

		return undefined
	}

	private transformImageAndSave(image: Image, path: string, format: ImageFormat, transformation: ImageTransformation) {
		if (transformation.debayer) {
			image = debayer(image) ?? image
		}

		if (transformation.horizontalMirror) {
			image = horizontalFlip(image)
		}
		if (transformation.verticalMirror) {
			image = verticalFlip(image)
		}

		if (transformation.scnr.channel) {
			const { channel, amount, method } = transformation.scnr
			image = scnr(image, channel, amount, method)
		}

		if (transformation.stretch.auto) {
			const [midtone, shadow, highlight] = adf(image, undefined, transformation.stretch.meanBackground)

			image = stf(image, midtone, shadow, highlight)

			transformation.stretch.midtone = midtone * 65536
			transformation.stretch.shadow = shadow * 65536
			transformation.stretch.highlight = highlight * 65536
		} else {
			const { midtone, shadow, highlight } = transformation.stretch
			image = stf(image, midtone / 65536, shadow / 65536, highlight / 65536)
		}

		if (transformation.invert) {
			image = invert(image)
		}

		const { adjustment } = transformation

		const options: WriteImageToFormatOptions = {
			format: format === 'jpeg' ? { quality: 70, chromaSubsampling: '4:4:4' } : format === 'png' ? { effort: 1 } : undefined,
			brightness: adjustment.enabled ? adjustment.brightness : undefined,
			normalize: adjustment.enabled ? adjustment.normalize : undefined,
			gamma: adjustment.enabled ? adjustment.gamma : undefined,
			saturation: adjustment.enabled ? adjustment.saturation : undefined,
		}

		return writeImageToFormat(image, path, format as never, options) // TODO: Handle FITS and XISF
	}

	save() {}

	analyze() {}

	annotate() {}

	coordinateInterpolation() {}

	statistics() {}
}

export function image(imageService: ImageService) {
	return new Elysia({ prefix: '/image' })
		.post(
			'/open',
			async ({ body, status }) => {
				const info = await imageService.open(body)

				if (info) {
					return new Response(Bun.file(info.path), {
						headers: { [X_IMAGE_INFO_HEADER]: JSON.stringify(info) },
					})
				} else {
					return status(500)
				}
			},
			{ body: OpenImageBody },
		)
		.post('/analyze', () => imageService.analyze())
		.post('/annotate', () => imageService.annotate())
		.post('/coordinateInterpolation', () => imageService.coordinateInterpolation())
		.post('/statistics', () => imageService.statistics())
		.get('/fovCameras', fovCameras)
		.get('/fovTelescopes', fovTelescopes)
}
