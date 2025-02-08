import { Elysia, type Static, t } from 'elysia'
import { deg, parseAngle } from 'nebulosa/src/angle'
import { hips2Fits, hipsSurveys } from 'nebulosa/src/hips2fits'

const FramingQuery = t.Object({
	hipsSurvey: t.String(),
	rightAscension: t.Union([t.String(), t.Number()]),
	declination: t.Union([t.String(), t.Number()]),
	width: t.Number({ minimum: 1, maximum: 7680 }),
	height: t.Number({ minimum: 1, maximum: 4320 }),
	fov: t.Optional(t.Number({ minimum: 0, maximum: 90 })),
	rotation: t.Optional(t.Number()),
})

type Framing = Static<typeof FramingQuery>

export const framing = new Elysia({ prefix: '/framing' })
	.get('/', ({ query }) => frame(query), { query: FramingQuery }) //
	.get('/hips-surveys', () => hipsSurveys())

export function frame(q: Framing) {
	const rightAscension = parseAngle(q.rightAscension, { isHour: true }) ?? 0
	const declination = parseAngle(q.declination) ?? 0
	q.fov = deg(q.fov || 1)
	return hips2Fits(q.hipsSurvey, rightAscension, declination, q)
}
