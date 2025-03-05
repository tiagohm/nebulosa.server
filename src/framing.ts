import { Elysia } from 'elysia'
import { deg, parseAngle } from 'nebulosa/src/angle'
import { hips2Fits, hipsSurveys } from 'nebulosa/src/hips2fits'
import { FRAMING_TYPE, type Framing } from './types'

export function framing() {
	return new Elysia({ prefix: '/framing' })
		.get('/', ({ query }) => frame(query), { query: FRAMING_TYPE }) //
		.get('/hips-surveys', () => hipsSurveys())
}

export function frame(q: Framing) {
	const rightAscension = parseAngle(q.rightAscension, { isHour: true }) ?? 0
	const declination = parseAngle(q.declination) ?? 0
	q.fov = deg(q.fov || 1)
	return hips2Fits(q.hipsSurvey, rightAscension, declination, q)
}
