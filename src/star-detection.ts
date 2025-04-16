import Elysia from 'elysia'
import { astapDetectStars } from 'nebulosa/src/astap'

export type StarDetectionType = 'ASTAP' | 'PIXINSIGHT' | 'SIRIL'

export interface StarDetection {
	readonly type: StarDetectionType
	readonly executable?: string
	readonly path: string
	readonly timeout: number
	readonly minSNR: number
	readonly maxStars: number
	readonly slot: number
}

export class StarDetectionService {
	async detectStars(req: StarDetection) {
		if (req.type === 'ASTAP') {
			return await astapDetectStars(req.path, req)
		}

		return []
	}
}

export function starDetection(starDetectionService: StarDetectionService) {
	const app = new Elysia({ prefix: '/star-detection' })

	app.post('/', ({ body }) => {
		return starDetectionService.detectStars(body as never)
	})

	return app
}
