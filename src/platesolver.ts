import Elysia, { type Static, t } from 'elysia'
import { arcsec, parseAngle } from 'nebulosa/src/angle'
import { astapPlateSolve } from 'nebulosa/src/astap'
import { localAstrometryNetPlateSolve, novaAstrometryNetPlateSolve } from 'nebulosa/src/astrometrynet'
import { type PlateSolution, fovFrom } from 'nebulosa/src/platesolver'

const PlateSolveStartBody = t.Object({
	id: t.String(),
	radius: t.Optional(t.Union([t.String(), t.Number()])),
	downsample: t.Optional(t.Integer()),
	timeout: t.Optional(t.Integer()),
	type: t.Union([t.Literal('ASTAP'), t.Literal('PIXINSIGHT'), t.Literal('ASTROMETRY_NET'), t.Literal('NOVA_ASTROMETRY_NET'), t.Literal('SIRIL')]),
	executable: t.String(),
	path: t.String(),
	focalLength: t.Number(),
	pixelSize: t.Number(),
	apiUrl: t.Optional(t.String()),
	apiKey: t.Optional(t.String()),
	slot: t.Optional(t.Integer()),
	blind: t.Boolean({ default: false }),
	ra: t.Union([t.String(), t.Number()]),
	dec: t.Union([t.String(), t.Number()]),
})

const PlateSolveStopBody = t.Object({
	id: t.String(),
})

export type PlateSolveStart = Static<typeof PlateSolveStartBody>
export type PlateSolveStop = Static<typeof PlateSolveStopBody>

export class PlateSolverService {
	private readonly tasks = new Map<string, AbortController>()

	async start(req: PlateSolveStart) {
		const ra = parseAngle(req.ra, { isHour: true })
		const dec = parseAngle(req.dec)
		const radius = req.blind || !req.radius ? 0 : parseAngle(req.radius)
		const fov = arcsec(fovFrom(req.focalLength, req.pixelSize))

		const aborter = new AbortController()
		this.tasks.set(req.id, aborter)

		let solver: Promise<PlateSolution | undefined> | undefined

		if (req.type === 'ASTAP') {
			solver = astapPlateSolve(
				req.path,
				{
					...req,
					fov,
					ra,
					dec,
					radius,
				},
				aborter.signal,
			)
		} else if (req.type === 'NOVA_ASTROMETRY_NET') {
			solver = novaAstrometryNetPlateSolve(
				req.path,
				{
					ra,
					dec,
					radius,
					scaleType: fov <= 0 ? 'ul' : 'ev',
					scaleEstimated: fov <= 0 ? undefined : fov,
					scaleError: fov <= 0 ? undefined : 10, // %
				},
				aborter.signal,
			)
		} else if (req.type === 'ASTROMETRY_NET') {
			solver = localAstrometryNetPlateSolve(
				req.path,
				{
					...req,
					fov,
					ra,
					dec,
					radius,
				},
				aborter.signal,
			)
		}

		if (solver) {
			try {
				const solution = await solver

				if (solution?.solved) {
					return solution
				}
			} finally {
				this.tasks.delete(req.id)
			}
		}

		return undefined
	}

	stop(req: PlateSolveStop) {
		this.tasks.get(req.id)?.abort()
	}
}

export function plateSolver(plateSolverService: PlateSolverService) {
	return (
		new Elysia({ prefix: '/plateSolver' })
			// Plate Solver
			.post('/start', ({ body }) => plateSolverService.start(body), { body: PlateSolveStartBody })
			.post('/stop', ({ body }) => plateSolverService.stop(body), { body: PlateSolveStopBody })
	)
}
