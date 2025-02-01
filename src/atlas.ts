import { Elysia, type Static, t } from 'elysia'
import { type Angle, deg } from 'nebulosa/src/angle'
import { type Distance, meter } from 'nebulosa/src/distance'
import { type ObserverTable, Quantity, observer } from 'nebulosa/src/horizons'

const LocationQuery = t.Object({
	longitude: t.Number(),
	latitude: t.Number(),
	elevation: t.Number(),
	offsetInMinutes: t.Number(),
})

export type Location = Readonly<Static<typeof LocationQuery>>

const DateTimeQuery = t.Object({
	dateTime: t.String(),
})

const PositionOfSunQuery = t.Composite([DateTimeQuery, LocationQuery])

export type PositionOfSun = Readonly<Static<typeof PositionOfSunQuery>>

export const atlas = new Elysia({ prefix: '/atlas' })
	.get('/sun/image', () => imageOfSun())
	.get('/sun/position', ({ query }) => positionOfSun(query), { query: PositionOfSunQuery })
	.get('/sun/altitude-points', () => altitudePointsOfSun())
	.get('/earth/seasons', () => earthSeasons())
	.get('/moon/position', () => positionOfMoon())
	.get('/moon/altitude-points', () => altitudePointsOfMoon())
	.get('/moon/phases', () => moonPhases())
	.get('/twilight', () => twilight())
	.get('/planets/{code}/position', () => positionOfPlanet())
	.get('/planets/{code}/altitude-points', () => altitudePointsOfPlanet())
	.get('/minor-planets', () => searchMinorPlanet())
	.get('/minor-planets/close-approaches', () => closeApproachesForMinorPlanets())
	.get('/sky-objects', () => searchSkyObject())
	.get('/sky-objects/types', () => skyObjectTypes())
	.get('/sky-objects/{id}/position', () => positionOfSkyObject())
	.get('/sky-objects/{id}/altitude-points', () => altitudePointsOfSkyObject())
	.get('/satellites', () => searchSatellites())
	.get('/satellites/{id}/position', () => positionOfSatellite())
	.get('/satellites/{id}/altitude-points', () => altitudePointsOfSatellite())

function imageOfSun() {}

const HORIZONS_QUANTITIES: Quantity[] = [Quantity.ASTROMETRIC_RA_DEC, Quantity.APPARENT_RA_DEC, Quantity.APPARENT_AZ_EL, Quantity.VISUAL_MAG_SURFACE_BRGHT, Quantity.ONE_WAY_DOWN_LEG_LIGHT_TIME, Quantity.ILLUMINATED_FRACTION, Quantity.SUN_OBSERVER_TARGET_ELONG_ANGLE, Quantity.CONSTELLATION_ID]

async function positionOfSun(q: PositionOfSun) {
	await computeEphemeris('10', new Date(q.dateTime), deg(q.longitude), deg(q.latitude), meter(q.elevation), q.offsetInMinutes)
}

function altitudePointsOfSun() {}

function earthSeasons() {}

function positionOfMoon() {}

function altitudePointsOfMoon() {}

function moonPhases() {}

function twilight() {}

function positionOfPlanet() {}

function altitudePointsOfPlanet() {}

function searchMinorPlanet() {}

function closeApproachesForMinorPlanets() {}

function searchSkyObject() {}

function skyObjectTypes() {}

function positionOfSkyObject() {}

function altitudePointsOfSkyObject() {}

function searchSatellites() {}

function positionOfSatellite() {}

function altitudePointsOfSatellite() {}

async function computeEphemeris(command: string, dateTime: Date, longitude: number, latitude: Angle, elevation: Distance, offsetInMinutes: number) {
	const startTime = new Date(dateTime.getTime() + offsetInMinutes * 60 * 1000)
	const endTime = new Date(startTime.getTime() + 86400000)
	const ephemeris = await observer(command, 'coord', [longitude, latitude, elevation], startTime, endTime, HORIZONS_QUANTITIES)
	makeBodyPositionFromEphemeris(ephemeris!)
}

function makeBodyPositionFromEphemeris(ephemeris: ObserverTable) {
	//
}
