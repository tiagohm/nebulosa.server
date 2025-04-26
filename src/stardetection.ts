import Elysia from 'elysia'
import { astapDetectStars } from 'nebulosa/src/astap'
import type { StarDetection } from './types'

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
