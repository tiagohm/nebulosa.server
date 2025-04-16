import Elysia from 'elysia'
import { unlinkSync } from 'fs'
import fs from 'fs/promises'
import type { Angle } from 'nebulosa/src/angle'
import { type Bitpix, type Fits, type FitsHeader, readFits } from 'nebulosa/src/fits'
import { type CfaPattern, type Image, type ImageChannel, readImageFromFits, writeImageToFormat } from 'nebulosa/src/image'
import { fileHandleSource } from 'nebulosa/src/io'
import os from 'os'
import { join } from 'path'
import fovCameras from '../data/cameras.json' with { type: 'json' }
import fovTelescopes from '../data/telescopes.json' with { type: 'json' }

export const X_IMAGE_INFO_HEADER = 'X-Image-Info'

export interface ImageStretch {
	readonly auto: boolean
	readonly shadow: number // 0 - 65535
	readonly highlight: number // 0 - 65535
	readonly midtone: number // 0 - 65535
	readonly meanBackground: number
}

export interface ImageScnr {
	readonly channel: ImageChannel
	readonly amount: number
	readonly method: 'MAXIMUM_MASK' | 'ADDITIVE_MASK' | 'AVERAGE_NEUTRAL' | 'MAXIMUM_NEUTRAL' | 'MINIMUM_NEUTRAL'
}

export interface ImageAdjustmentLevel {
	readonly enabled: boolean
	readonly value: number
}

export interface ImageAdjustment {
	readonly enabled: boolean
	readonly contrast: ImageAdjustmentLevel
	readonly brightness: ImageAdjustmentLevel
	readonly exposure: ImageAdjustmentLevel
	readonly gamma: ImageAdjustmentLevel
	readonly saturation: ImageAdjustmentLevel
	readonly fade: ImageAdjustmentLevel
}

export interface ImageTransformation {
	readonly force: boolean
	readonly calibrationGroup?: string
	readonly debayer: boolean
	readonly stretch: ImageStretch
	readonly mirrorHorizontal: boolean
	readonly mirrorVertical: boolean
	readonly invert: boolean
	readonly scnr: ImageScnr
	readonly useJPEG: boolean
	readonly adjustment: ImageAdjustment
}

export interface OpenImage {
	readonly id?: string
	readonly path?: string
	readonly camera?: string
	readonly transformation: ImageTransformation
}

export interface CloseImage {
	readonly id: string
}

interface CachedImage {
	fits?: Fits
	image?: Image
	paths: Partial<Record<'jpeg' | 'png', string>>
	info: ImageInfo
}

interface ImageInfo {
	readonly id: string
	path: string
	readonly width: number
	readonly height: number
	readonly mono: boolean
	readonly bayer?: CfaPattern
	readonly stretch: Omit<ImageStretch, 'auto' | 'meanBackground'>
	readonly rightAscension?: Angle
	readonly declination?: Angle
	readonly solved: boolean
	readonly headers: FitsHeader
	readonly bitpix: Bitpix
}

export class ImageService {
	private readonly images = new Map<string, CachedImage>()

	async open(req: OpenImage) {
		if (req.path) {
			const handle = await fs.open(req.path)
			const source = fileHandleSource(handle)
			const fits = await readFits(source)

			if (fits) {
				const image = await readImageFromFits(fits)

				if (image) {
					const id = Bun.MD5.hash(req.path, 'hex')
					const format = req.transformation.useJPEG ? 'jpeg' : 'png'
					const path = join(os.tmpdir(), `${id}.${format}`)
					const outputInfo = await writeImageToFormat(image, path, format)

					if (outputInfo) {
						const info: ImageInfo = {
							id,
							path,
							width: outputInfo.width,
							height: outputInfo.height,
							mono: outputInfo.channels === 1,
							bayer: image.metadata.bayer,
							stretch: req.transformation.stretch,
							solved: false,
							headers: image.header,
							bitpix: image.metadata.bitpix,
						}

						this.images.set(id, { fits, image, paths: { [format]: path }, info })

						return info
					}
				}
			}
		} else if (req.id) {
			const image = this.images.get(req.id)

			if (image?.image) {
				const format = req.transformation.useJPEG ? 'jpeg' : 'png'
				const path = join(os.tmpdir(), `${req.id}.${format}`)

				image.paths[format] = path
				image.info.path = path

				if (await writeImageToFormat(image.image, path, format)) {
					return image.info
				}
			}
		}

		return undefined
	}

	close(req: CloseImage) {
		const image = this.images.get(req.id)

		if (image) {
			for (const format in image.paths) {
				const path = image.paths[format as never]
				path && unlinkSync(path)
			}

			this.images.delete(req.id)
		}
	}

	save() {}

	analyze() {}

	annotate() {}

	coordinateInterpolation() {}

	statistics() {}
}

export function image(imageService: ImageService) {
	const app = new Elysia({ prefix: '/image' })

	app.post('/open', async ({ body, set, error }) => {
		const info = await imageService.open(body as never)

		if (info) {
			set.headers[X_IMAGE_INFO_HEADER] = JSON.stringify(info)
			return new Response(Bun.file(info.path))
		} else {
			return error(500)
		}
	})

	app.post('/close', ({ body }) => {
		return imageService.close(body as never)
	})

	app.post('/analyze', () => {
		return imageService.analyze()
	})

	app.post('/annotate', () => {
		return imageService.annotate()
	})

	app.post('/coordinate-interpolation', () => {
		return imageService.coordinateInterpolation()
	})

	app.post('/statistics', () => {
		return imageService.statistics()
	})

	app.get('/fov-cameras', fovCameras)
	app.get('/fov-telescopes', fovTelescopes)

	return app
}
