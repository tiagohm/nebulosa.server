import { Elysia } from 'elysia'
import { type Angle, deg, parseAngle } from 'nebulosa/src/angle'
import { AU_KM, SPEED_OF_LIGHT } from 'nebulosa/src/constants'
import type { CsvRow } from 'nebulosa/src/csv'
import { type DateTime, dateFrom } from 'nebulosa/src/datetime'
import { type Distance, meter } from 'nebulosa/src/distance'
import { Quantity, observer } from 'nebulosa/src/horizons'
import { ALTITUDE_POINTS_OF_BODY_TYPE, type AltitudePointsOfMoon, type AltitudePointsOfPlanet, type AltitudePointsOfSatellite, type AltitudePointsOfSkyObject, type AltitudePointsOfSun, POSITION_OF_BODY_TYPE, type PositionOfMoon, type PositionOfPlanet, type PositionOfSun } from './types'

const BODY_POSITIONS = new Map<string, Map<number, Readonly<BodyPosition>>>()

const HORIZONS_QUANTITIES: Quantity[] = [Quantity.ASTROMETRIC_RA_DEC, Quantity.APPARENT_RA_DEC, Quantity.APPARENT_AZ_EL, Quantity.VISUAL_MAG_SURFACE_BRGHT, Quantity.ONE_WAY_DOWN_LEG_LIGHT_TIME, Quantity.ILLUMINATED_FRACTION, Quantity.SUN_OBSERVER_TARGET_ELONG_ANGLE, Quantity.CONSTELLATION_ID]

export interface BodyPosition {
	rightAscensionJ2000: number
	declinationJ2000: number
	rightAscension: number
	declination: number
	azimuth: number
	altitude: number
	magnitude: number
	constellation: string
	distance: number
	distanceUnit: string
	illuminated: number
	elongation: number
	leading: boolean
}

export function atlas() {
	return new Elysia({ prefix: '/atlas' })
		.get('/sun/image', () => imageOfSun())
		.get('/sun/position', ({ query }) => positionOfSun(query), { query: POSITION_OF_BODY_TYPE })
		.get('/sun/altitude-points', ({ query }) => altitudePointsOfSun(query), { query: ALTITUDE_POINTS_OF_BODY_TYPE })
		.get('/earth/seasons', () => earthSeasons())
		.get('/moon/position', ({ query }) => positionOfMoon(query), { query: POSITION_OF_BODY_TYPE })
		.get('/moon/altitude-points', ({ query }) => altitudePointsOfMoon(query), { query: ALTITUDE_POINTS_OF_BODY_TYPE })
		.get('/moon/phases', () => moonPhases())
		.get('/twilight', () => twilight())
		.get('/planets/:code/position', ({ query, params: { code } }) => positionOfPlanet(code, query), { query: POSITION_OF_BODY_TYPE })
		.get('/planets/:code/altitude-points', ({ query, params: { code } }) => altitudePointsOfPlanet(code, query), { query: ALTITUDE_POINTS_OF_BODY_TYPE })
		.get('/minor-planets', () => searchMinorPlanet())
		.get('/minor-planets/close-approaches', () => closeApproachesForMinorPlanets())
		.get('/sky-objects', () => searchSkyObject())
		.get('/sky-objects/types', () => skyObjectTypes())
		.get('/sky-objects/:id/position', ({ query, params: { id } }) => positionOfSkyObject())
		.get('/sky-objects/:id/altitude-points', ({ query }) => altitudePointsOfSkyObject(query), { query: ALTITUDE_POINTS_OF_BODY_TYPE })
		.get('/satellites', () => searchSatellites())
		.get('/satellites/:id/position', ({ query, params: { id } }) => positionOfSatellite())
		.get('/satellites/:id/altitude-points', ({ query }) => altitudePointsOfSatellite(query), { query: ALTITUDE_POINTS_OF_BODY_TYPE })
}

export function imageOfSun() {}

export function positionOfSun(q: PositionOfSun) {
	return computeEphemeris('10', dateFrom(q.dateTime, true), deg(q.longitude), deg(q.latitude), meter(q.elevation))
}

export function altitudePointsOfSun(q: AltitudePointsOfSun) {
	return computeAltitudePoints('10', dateFrom(q.dateTime, true), q.stepSize)
}

function earthSeasons() {}

function positionOfMoon(q: PositionOfMoon) {
	return computeEphemeris('301', dateFrom(q.dateTime, true), deg(q.longitude), deg(q.latitude), meter(q.elevation))
}

function altitudePointsOfMoon(q: AltitudePointsOfMoon) {
	return computeAltitudePoints('301', dateFrom(q.dateTime, true), q.stepSize)
}

function moonPhases() {}

function twilight() {}

function positionOfPlanet(code: string, q: PositionOfPlanet) {
	return computeEphemeris(code, dateFrom(q.dateTime, true), deg(q.longitude), deg(q.latitude), meter(q.elevation))
}

function altitudePointsOfPlanet(code: string, q: AltitudePointsOfPlanet) {
	return computeAltitudePoints(code, dateFrom(q.dateTime, true), q.stepSize)
}

function searchMinorPlanet() {}

function closeApproachesForMinorPlanets() {}

function searchSkyObject() {}

function skyObjectTypes() {}

function positionOfSkyObject() {}

function altitudePointsOfSkyObject(q: AltitudePointsOfSkyObject) {}

function searchSatellites() {}

function positionOfSatellite() {}

function altitudePointsOfSatellite(q: AltitudePointsOfSatellite) {}

async function computeEphemeris(code: string, dateTime: DateTime, longitude: number, latitude: Angle, elevation: Distance) {
	const time = timeWithoutSeconds(dateTime)

	const position = BODY_POSITIONS.get(code)?.get(time)
	if (position) return position

	let startTime = dateTime.set('hour', 12).set('minute', 0).set('second', 0).set('millisecond', 0)
	if (dateTime.hour() < 12) startTime = startTime.subtract(1, 'day')
	const endTime = startTime.add(1, 'day')

	const ephemeris = await observer(code, 'coord', [longitude, latitude, elevation], startTime, endTime, HORIZONS_QUANTITIES)
	const positions = makeBodyPositionFromEphemeris(ephemeris!)
	if (!BODY_POSITIONS.has(code)) BODY_POSITIONS.set(code, new Map())
	const map = BODY_POSITIONS.get(code)!
	positions.forEach((e) => map.set(e[0], e[1]))
	return map.get(time)
}

function computeAltitudePoints(code: string, dateTime: DateTime, stepSizeInMinutes: number) {
	const positions = BODY_POSITIONS.get(code)!

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
