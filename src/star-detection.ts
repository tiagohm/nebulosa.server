import Elysia from 'elysia'
import { astapDetectStars } from 'nebulosa/src/astap'

export interface StarDetection {
	type: 'ASTAP' | 'PIXINSIGHT' | 'SIRIL'
	executable?: string
	path: string
	timeout: number
	minSNR: number
	maxStars: number
	slot: number
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
