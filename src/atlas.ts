import Elysia, { type Static, t } from 'elysia'
import { type Angle, deg, parseAngle } from 'nebulosa/src/angle'
import { AU_KM, SPEED_OF_LIGHT } from 'nebulosa/src/constants'
import type { CsvRow } from 'nebulosa/src/csv'
import { type DateTime, dateFrom } from 'nebulosa/src/datetime'
import { type Distance, meter } from 'nebulosa/src/distance'
import { Quantity, observer } from 'nebulosa/src/horizons'
import type { BodyPosition } from './types'

const HORIZONS_QUANTITIES: Quantity[] = [Quantity.ASTROMETRIC_RA_DEC, Quantity.APPARENT_RA_DEC, Quantity.APPARENT_AZ_EL, Quantity.VISUAL_MAG_SURFACE_BRGHT, Quantity.ONE_WAY_DOWN_LEG_LIGHT_TIME, Quantity.ILLUMINATED_FRACTION, Quantity.SUN_OBSERVER_TARGET_ELONG_ANGLE, Quantity.CONSTELLATION_ID]

const ComputePositionBody = t.Object({
	dateTime: t.String(),
	longitude: t.Number(),
	latitude: t.Number(),
	elevation: t.Number(),
})

const AltitudeChartBody = t.Object({
	dateTime: t.String(),
	stepSize: t.Integer(),
})

export type ComputePosition = Static<typeof ComputePositionBody>
export type AltitudeChart = Static<typeof AltitudeChartBody>

export class AtlasService {
	private readonly positions = new Map<string, Map<number, Readonly<BodyPosition>>>()

	imageOfSun() {}

	positionOfSun(req: ComputePosition) {
		return this.computeEphemeris('10', dateFrom(req.dateTime, true), deg(req.longitude), deg(req.latitude), meter(req.elevation))
	}

	altitudeChartOfSun(req: AltitudeChart) {
		return this.computeAltitudeChart('10', dateFrom(req.dateTime, true), req.stepSize)
	}

	earthSeasons() {}

	positionOfMoon(req: ComputePosition) {
		return this.computeEphemeris('301', dateFrom(req.dateTime, true), deg(req.longitude), deg(req.latitude), meter(req.elevation))
	}

	altitudeChartOfMoon(req: AltitudeChart) {
		return this.computeAltitudeChart('301', dateFrom(req.dateTime, true), req.stepSize)
	}

	moonPhases() {}

	twilight() {}

	positionOfPlanet(code: string, req: ComputePosition) {
		return this.computeEphemeris(code, dateFrom(req.dateTime, true), deg(req.longitude), deg(req.latitude), meter(req.elevation))
	}

	altitudeChartOfPlanet(code: string, req: AltitudeChart) {
		return this.computeAltitudeChart(code, dateFrom(req.dateTime, true), req.stepSize)
	}

	searchMinorPlanet() {}

	closeApproachesForMinorPlanets() {}

	searchSkyObject() {}

	skyObjectTypes() {}

	positionOfSkyObject(req: ComputePosition, id: string) {}

	altitudeChartOfSkyObject(req: AltitudeChart) {}

	searchSatellites() {}

	positionOfSatellite(req: ComputePosition, id: string) {}

	altitudeChartOfSatellite(req: AltitudeChart) {}

	private async computeEphemeris(code: string, dateTime: DateTime, longitude: number, latitude: Angle, elevation: Distance) {
		const time = timeWithoutSeconds(dateTime)

		const position = this.positions.get(code)?.get(time)
		if (position) return position

		let startTime = dateTime.set('hour', 12).set('minute', 0).set('second', 0).set('millisecond', 0)
		if (dateTime.hour() < 12) startTime = startTime.subtract(1, 'day')
		const endTime = startTime.add(1, 'day')

		const ephemeris = await observer(code, 'coord', [longitude, latitude, elevation], startTime, endTime, HORIZONS_QUANTITIES)
		const positions = makeBodyPositionFromEphemeris(ephemeris!)
		if (!this.positions.has(code)) this.positions.set(code, new Map())
		const map = this.positions.get(code)!
		positions.forEach((e) => map.set(e[0], e[1]))
		return map.get(time)!
	}

	private computeAltitudeChart(code: string, dateTime: DateTime, stepSizeInMinutes: number) {
		const positions = this.positions.get(code)!

		let startTime = dateTime.set('hour', 12).set('minute', 0).set('second', 0).set('millisecond', 0)
		if (dateTime.hour() < 12) startTime = startTime.subtract(1, 'day')
		const time = timeWithoutSeconds(startTime)
		const altitude: number[] = []

		altitude.push(positions.get(time)!.altitude)

		for (let i = stepSizeInMinutes; i <= 1440 - stepSizeInMinutes; i += stepSizeInMinutes) {
			altitude.push(positions.get(time + i * 60)!.altitude)
		}

		altitude.push(positions.get(time + 1440 * 60)!.altitude)

		return altitude
	}
}

function makeBodyPositionFromEphemeris(ephemeris: CsvRow[]): readonly [number, BodyPosition][] {
	ephemeris.splice(0, 1)

	return ephemeris.map((e) => {
		const lightTime = parseFloat(e[11]) || 0
		let distance = lightTime * (SPEED_OF_LIGHT * 0.06) // km
		let distanceUnit = 'km'

		if (distance <= 0) {
			distance = 0
		} else if (distance >= AU_KM) {
			distance /= AU_KM
			distanceUnit = 'AU'
		}

		return [
			timeWithoutSeconds(dateFrom(`${e[0]}Z`)),
			{
				rightAscensionJ2000: parseAngle(e[3]),
				declinationJ2000: parseAngle(e[4]),
				rightAscension: parseAngle(e[5]),
				declination: parseAngle(e[6]),
				azimuth: parseAngle(e[7]),
				altitude: parseAngle(e[8]),
				magnitude: parseFloat(e[9]),
				constellation: e[15].toUpperCase(),
				distance,
				distanceUnit,
				illuminated: parseFloat(e[12]),
				elongation: parseAngle(e[13]),
				leading: e[14] === '/L',
			} as BodyPosition,
		]
	})
}

function timeWithoutSeconds(dateTime: DateTime) {
	const seconds = dateTime.unix()
	const remaining = Math.trunc(seconds % 60)
	return seconds - remaining
}

// '/sun/image'
// '/earth/seasons'
// '/moon/phases'
// '/twilight'
// '/minor-planets'
// '/minor-planets/close-approaches'
// '/sky-objects'
// '/sky-objects/types'
// '/sky-objects/:id/position'
// '/sky-objects/:id/altitude-chart'
// '/satellites'
// '/satellites/:id/position'
// '/satellites/:id/altitude-chart'

export function atlas(atlasService: AtlasService) {
	return new Elysia({ prefix: '/atlas' })
		.post('/sun/position', ({ body }) => atlasService.positionOfSun(body), { body: ComputePositionBody })
		.post('/sun/altitudeChart', ({ body }) => atlasService.altitudeChartOfSun(body), { body: AltitudeChartBody })
		.post('/moon/position', ({ body }) => atlasService.positionOfMoon(body), { body: ComputePositionBody })
		.post('/moon/altitudeChart', ({ body }) => atlasService.altitudeChartOfMoon(body), { body: AltitudeChartBody })
		.post('/planets/:code/position', ({ params, body }) => atlasService.positionOfPlanet(params.code, body), { body: ComputePositionBody })
		.post('/planets/:code/altitudeChart', ({ params, body }) => atlasService.altitudeChartOfPlanet(params.code, body), { body: AltitudeChartBody })
}
