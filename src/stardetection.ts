import Elysia, { t, type Static } from 'elysia'
import { astapDetectStars } from 'nebulosa/src/astap'

const DetectStarsBody = t.Object({
	type: t.Union([t.Literal('ASTAP')]),
	executable: t.Optional(t.String()),
	path: t.String(),
	timeout: t.Integer(),
	minSNR: t.Integer(),
	maxStars: t.Integer(),
	slot: t.Integer(),
})

export type DetectStars = Static<typeof DetectStarsBody>

export class StarDetectionService {
	async detectStars(req: DetectStars) {
		if (req.type === 'ASTAP') {
			return await astapDetectStars(req.path, req)
		}

		return []
	}
}

export function starDetection(starDetectionService: StarDetectionService) {
	return (
		new Elysia({ prefix: '/starDetection' })
			// Star Detection
			.post('/', ({ body }) => starDetectionService.detectStars(body), { body: DetectStarsBody })
	)
}
