import { Elysia, type Static, t } from 'elysia'
import { type Angle, deg, parseAngle } from 'nebulosa/src/angle'
import { AU_KM, SPEED_OF_LIGHT } from 'nebulosa/src/constants'
import { type Distance, meter } from 'nebulosa/src/distance'
import { type ObserverTable, Quantity, observer } from 'nebulosa/src/horizons'

const LOCATION_QUERY = t.Object({ longitude: t.Number({ minimum: -180, maximum: 180 }), latitude: t.Number({ minimum: -90, maximum: 90 }), elevation: t.Number() })

const DATE_TIME_QUERY = t.Object({ dateTime: t.String() })

const POSITION_OF_BODY_QUERY = t.Composite([DATE_TIME_QUERY, LOCATION_QUERY])

const ALTITUDE_POINTS_OF_BODY_QUERY = t.Composite([DATE_TIME_QUERY, t.Object({ stepSize: t.Number({ minimum: 1, maximum: 60 }) })])

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

export type Location = Readonly<Static<typeof LOCATION_QUERY>>

export type PositionOfSun = Readonly<Static<typeof POSITION_OF_BODY_QUERY>>

export type PositionOfMoon = Readonly<Static<typeof POSITION_OF_BODY_QUERY>>

export type PositionOfPlanet = Readonly<Static<typeof POSITION_OF_BODY_QUERY>>

export type PositionOfSkyObject = Readonly<Static<typeof POSITION_OF_BODY_QUERY>>

export type PositionOfSatellite = Readonly<Static<typeof POSITION_OF_BODY_QUERY>>

export type AltitudePointsOfSun = Readonly<Static<typeof ALTITUDE_POINTS_OF_BODY_QUERY>>

export type AltitudePointsOfMoon = Readonly<Static<typeof ALTITUDE_POINTS_OF_BODY_QUERY>>

export type AltitudePointsOfPlanet = Readonly<Static<typeof ALTITUDE_POINTS_OF_BODY_QUERY>>

export type AltitudePointsOfSkyObject = Readonly<Static<typeof ALTITUDE_POINTS_OF_BODY_QUERY>>

export type AltitudePointsOfSatellite = Readonly<Static<typeof ALTITUDE_POINTS_OF_BODY_QUERY>>

export const atlas = new Elysia({ prefix: '/atlas' })
	.get('/sun/image', () => imageOfSun())
	.get('/sun/position', ({ query }) => positionOfSun(query), { query: POSITION_OF_BODY_QUERY })
	.get('/sun/altitude-points', ({ query }) => altitudePointsOfSun(query), { query: ALTITUDE_POINTS_OF_BODY_QUERY })
	.get('/earth/seasons', () => earthSeasons())
	.get('/moon/position', ({ query }) => positionOfMoon(query), { query: POSITION_OF_BODY_QUERY })
	.get('/moon/altitude-points', ({ query }) => altitudePointsOfMoon(query), { query: ALTITUDE_POINTS_OF_BODY_QUERY })
	.get('/moon/phases', () => moonPhases())
	.get('/twilight', () => twilight())
	.get('/planets/:code/position', ({ query, params: { code } }) => positionOfPlanet(code, query), { query: POSITION_OF_BODY_QUERY })
	.get('/planets/:code/altitude-points', ({ query, params: { code } }) => altitudePointsOfPlanet(code, query), { query: ALTITUDE_POINTS_OF_BODY_QUERY })
	.get('/minor-planets', () => searchMinorPlanet())
	.get('/minor-planets/close-approaches', () => closeApproachesForMinorPlanets())
	.get('/sky-objects', () => searchSkyObject())
	.get('/sky-objects/types', () => skyObjectTypes())
	.get('/sky-objects/:id/position', ({ query, params: { id } }) => positionOfSkyObject())
	.get('/sky-objects/:id/altitude-points', ({ query }) => altitudePointsOfSkyObject(query), { query: ALTITUDE_POINTS_OF_BODY_QUERY })
	.get('/satellites', () => searchSatellites())
	.get('/satellites/:id/position', ({ query, params: { id } }) => positionOfSatellite())
	.get('/satellites/:id/altitude-points', ({ query }) => altitudePointsOfSatellite(query), { query: ALTITUDE_POINTS_OF_BODY_QUERY })

function imageOfSun() {}

function positionOfSun(q: PositionOfSun) {
	return computeEphemeris('10', new Date(q.dateTime), deg(q.longitude), deg(q.latitude), meter(q.elevation))
}

function altitudePointsOfSun(q: AltitudePointsOfSun) {
	return computeAltitudePoints('10', new Date(q.dateTime), q.stepSize)
}

function earthSeasons() {}

function positionOfMoon(q: PositionOfMoon) {
	return computeEphemeris('301', new Date(q.dateTime), deg(q.longitude), deg(q.latitude), meter(q.elevation))
}

function altitudePointsOfMoon(q: AltitudePointsOfMoon) {
	return computeAltitudePoints('301', new Date(q.dateTime), q.stepSize)
}

function moonPhases() {}

function twilight() {}

function positionOfPlanet(code: string, q: PositionOfPlanet) {
	return computeEphemeris(code, new Date(q.dateTime), deg(q.longitude), deg(q.latitude), meter(q.elevation))
}

function altitudePointsOfPlanet(code: string, q: AltitudePointsOfPlanet) {
	return computeAltitudePoints(code, new Date(q.dateTime), q.stepSize)
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

async function computeEphemeris(code: string, date: Date, longitude: number, latitude: Angle, elevation: Distance) {
	const time = Math.trunc(date.getTime() / 1000)

	const position = BODY_POSITIONS.get(code)?.get(time)
	if (position) return position

	let startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0)
	if (date.getHours() < 12) startTime = new Date(startTime.getTime() - 86400000)
	const endTime = new Date(startTime.getTime() + 86400000)

	const ephemeris = await observer(code, 'coord', [longitude, latitude, elevation], startTime, endTime, HORIZONS_QUANTITIES)
	const positions = makeBodyPositionFromEphemeris(ephemeris!)
	if (!BODY_POSITIONS.has(code)) BODY_POSITIONS.set(code, new Map())
	const map = BODY_POSITIONS.get(code)!
	positions.forEach((e) => map.set(e[0], e[1]))
	return map.get(time)
}

function computeAltitudePoints(code: string, date: Date, stepSizeInMinutes: number) {
	const positions = BODY_POSITIONS.get(code)!

	let startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0)
	if (date.getHours() < 12) startTime = new Date(startTime.getTime() - 86400000)
	const time = Math.trunc(startTime.getTime() / 1000)
	const altitude: number[] = []

	altitude.push(positions.get(time)!.altitude)

	for (let i = stepSizeInMinutes; i <= 1440 - stepSizeInMinutes; i += stepSizeInMinutes) {
		altitude.push(positions.get(time + i * 60)!.altitude)
	}

	altitude.push(positions.get(time + 1440 * 60)!.altitude)

	return altitude
}

function makeBodyPositionFromEphemeris(ephemeris: ObserverTable): readonly [number, BodyPosition][] {
	return ephemeris.data.map((e) => {
		const lightTime = parseFloat(e[9]) || 0
		let distance = lightTime * (SPEED_OF_LIGHT * 0.06) // km
		let distanceUnit = 'km'

		if (distance <= 0) {
			distance = 0
		} else if (distance >= AU_KM) {
			distance /= AU_KM
			distanceUnit = 'AU'
		}

		return [
			Math.trunc(new Date(`${e[0]}Z`).getTime() / 1000),
			{
				rightAscensionJ2000: parseAngle(e[1]),
				declinationJ2000: parseAngle(e[2]),
				rightAscension: parseAngle(e[3]),
				declination: parseAngle(e[4]),
				azimuth: parseAngle(e[5]),
				altitude: parseAngle(e[6]),
				magnitude: parseFloat(e[7]),
				constellation: e[13].toUpperCase(),
				distance,
				distanceUnit,
				illuminated: parseFloat(e[10]),
				elongation: parseAngle(e[11]),
				leading: e[12] === '/L',
			} as BodyPosition,
		]
	})
}
