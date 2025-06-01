import Elysia, { t, type Static } from 'elysia'
import { deg, parseAngle } from 'nebulosa/src/angle'
import { hips2Fits } from 'nebulosa/src/hips2fits'
import hipsSurveys from '../data/hips-surveys.json' with { type: 'json' }

const FramingBody = t.Object({
	hipsSurvey: t.String(),
	rightAscension: t.Union([t.String(), t.Number()]),
	declination: t.Union([t.String(), t.Number()]),
	width: t.Number(),
	height: t.Number(),
	fov: t.Number(), // deg
	rotation: t.Number(), // deg
})

export type Framing = Static<typeof FramingBody>

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
	return (
		new Elysia({ prefix: '/framing' })
			// Framing
			.get('/hipsSurveys', hipsSurveys)
	)
}
