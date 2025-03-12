import fs from 'fs/promises'
import { type Fits, readFits } from 'nebulosa/src/fits'
import { type Image, type ImageChannel, readImageFromFits, writeImageToFormat } from 'nebulosa/src/image'
import { fileHandleSource } from 'nebulosa/src/io'

export interface ImageStretch {
	auto: boolean
	shadow: number // 0 - 65535
	highlight: number // 0 - 65535
	midtone: number // 0 - 65535
	meanBackground: number
}

export interface ImageScnr {
	channel: ImageChannel
	amount: number
	method: 'MAXIMUM_MASK' | 'ADDITIVE_MASK' | 'AVERAGE_NEUTRAL' | 'MAXIMUM_NEUTRAL' | 'MINIMUM_NEUTRAL'
}

export interface ImageAdjustmentLevel {
	enabled: boolean
	value: number
}

export interface ImageAdjustment {
	enabled: boolean
	contrast: ImageAdjustmentLevel
	brightness: ImageAdjustmentLevel
	exposure: ImageAdjustmentLevel
	gamma: ImageAdjustmentLevel
	saturation: ImageAdjustmentLevel
	fade: ImageAdjustmentLevel
}

export interface ImageTransformation {
	force: boolean
	calibrationGroup?: string
	debayer: boolean
	stretch: ImageStretch
	mirrorHorizontal: boolean
	mirrorVertical: boolean
	invert: boolean
	scnr: ImageScnr
	useJPEG: boolean
	adjustment: ImageAdjustment
}

export interface OpenImage {
	path: string
	camera?: string
	transformation: ImageTransformation
}

export interface CloseImage {
	id: string
}

interface CachedImage {
	fits?: Fits
	image?: Image
}

export class ImageService {
	private readonly images = new Map<string, CachedImage>()

	async open(req: OpenImage) {
		const handle = await fs.open(req.path)
		const source = fileHandleSource(handle)
		const fits = await readFits(source)

		if (fits) {
			const image = await readImageFromFits(fits)

			if (image) {
				const id = Bun.randomUUIDv7()
				await writeImageToFormat(image, '', req.transformation.useJPEG ? 'jpeg' : 'png')
				this.images.set(id, { fits, image })
			}
		}
	}

	close(q: CloseImage) {
		this.images.delete(q.id)
	}

	save() {}

	analyze() {}

	annotate() {}

	coordinateInterpolation() {}

	statistics() {}
}
