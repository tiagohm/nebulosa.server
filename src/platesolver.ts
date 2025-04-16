import Elysia from 'elysia'
import { type Angle, arcsec, deg, parseAngle } from 'nebulosa/src/angle'
import { astapPlateSolve } from 'nebulosa/src/astap'
import { type Parity, type PlateSolution, fovFrom } from 'nebulosa/src/platesolver'

export type PlateSolverType = 'ASTAP' | 'PIXINSIGHT' | 'ASTROMETRY_NET' | 'ASTROMETRY_NET_ONLINE' | 'SIRIL'

export interface PlateSolveStart {
	readonly id: string
	readonly type: PlateSolverType
	readonly executable?: string
	readonly path: string
	readonly downsample?: number
	readonly focalLength: number
	readonly pixelSize: number
	readonly apiUrl?: string
	readonly apiKey?: string
	readonly timeout?: number
	readonly slot?: number
	readonly blind: boolean
	readonly centerRA: string | number // hours
	readonly centerDEC: string | number // deg
	readonly radius: number // deg
}

export interface PlateSolveStop {
	readonly id: string
}

export interface PlateSolved {
	readonly solved: boolean
	readonly orientation?: number
	readonly scale?: number
	readonly rightAscension?: Angle
	readonly declination?: Angle
	readonly width?: number
	readonly height?: number
	readonly radius?: number
	readonly parity?: Parity
}

export class PlateSolverService {
	private readonly aborters = new Map<string, AbortController>()

	async start(req: PlateSolveStart): Promise<PlateSolved> {
		const ra = parseAngle(req.centerRA, { isHour: true })
		const dec = parseAngle(req.centerDEC)
		const radius = req.blind ? 0 : deg(req.radius)

		const aborter = new AbortController()
		this.aborters.set(req.id, aborter)

		let solver: Promise<PlateSolution | undefined> | undefined

		if (req.type === 'ASTAP') {
			solver = astapPlateSolve(
				req.path,
				{
					...req,
					fov: arcsec(fovFrom(req.focalLength, req.pixelSize)),
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
				this.aborters.delete(req.id)
			}
		}

		return { solved: false }
	}

	stop(req: PlateSolveStop) {
		this.aborters.get(req.id)?.abort()
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
