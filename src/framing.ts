import Elysia from 'elysia'
import { type Angle, deg, parseAngle } from 'nebulosa/src/angle'
import { hips2Fits } from 'nebulosa/src/hips2fits'
import hipsSurveys from '../data/hips-surveys.json' with { type: 'json' }

export interface Framing {
	readonly hipsSurvey: string
	readonly rightAscension: string | Angle
	readonly declination: string | Angle
	readonly width: number
	readonly height: number
	fov: number // deg
	rotation: number // deg
}

export class FramingService {
	frame(req: Framing) {
		const rightAscension = parseAngle(req.rightAscension, { isHour: true }) ?? 0
		const declination = parseAngle(req.declination) ?? 0
		req.fov = deg(req.fov || 1)
		req.rotation = deg(req.fov)
		return hips2Fits(req.hipsSurvey, rightAscension, declination, req)
	}
}

export function framing(framingService: FramingService) {
	const app = new Elysia({ prefix: '/framing' })

	app.get('/hips-surveys', hipsSurveys)

	return app
}
