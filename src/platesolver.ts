import Elysia from 'elysia'
import { arcsec, deg, parseAngle } from 'nebulosa/src/angle'
import { astapPlateSolve } from 'nebulosa/src/astap'
import { localAstrometryNetPlateSolve, novaAstrometryNetPlateSolve } from 'nebulosa/src/astrometrynet'
import { type PlateSolution, fovFrom } from 'nebulosa/src/platesolver'
import type { PlateSolveStart, PlateSolveStop, PlateSolved } from './types'

export class PlateSolverService {
	private readonly tasks = new Map<string, AbortController>()

	async start(req: PlateSolveStart): Promise<PlateSolved> {
		const ra = parseAngle(req.ra, { isHour: true })
		const dec = parseAngle(req.dec)
		const radius = req.blind || !req.radius ? 0 : deg(req.radius)
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

		return { solved: false }
	}

	stop(req: PlateSolveStop) {
		this.tasks.get(req.id)?.abort()
	}
}

export function plateSolver(plateSolverService: PlateSolverService) {
	const app = new Elysia({ prefix: '/plate-solver' })

	app.post('/start', ({ body }) => {
		return plateSolverService.start(body as never)
	})

	app.post('/stop', ({ body }) => {
		return plateSolverService.stop(body as never)
	})

	return app
}
