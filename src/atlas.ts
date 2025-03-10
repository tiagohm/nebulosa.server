import { type Angle, deg, parseAngle } from 'nebulosa/src/angle'
import { AU_KM, SPEED_OF_LIGHT } from 'nebulosa/src/constants'
import type { CsvRow } from 'nebulosa/src/csv'
import { type DateTime, dateFrom } from 'nebulosa/src/datetime'
import { type Distance, meter } from 'nebulosa/src/distance'
import { Quantity, observer } from 'nebulosa/src/horizons'

const BODY_POSITIONS = new Map<string, Map<number, Readonly<BodyPosition>>>()

const HORIZONS_QUANTITIES: Quantity[] = [Quantity.ASTROMETRIC_RA_DEC, Quantity.APPARENT_RA_DEC, Quantity.APPARENT_AZ_EL, Quantity.VISUAL_MAG_SURFACE_BRGHT, Quantity.ONE_WAY_DOWN_LEG_LIGHT_TIME, Quantity.ILLUMINATED_FRACTION, Quantity.SUN_OBSERVER_TARGET_ELONG_ANGLE, Quantity.CONSTELLATION_ID]

export interface PositionOfBody {
	dateTime: string
	longitude: number
	latitude: number
	elevation: number
}

export interface AltitudeChartOfBody {
	dateTime: string
	stepSize: number
}

export interface BodyPosition {
	readonly rightAscensionJ2000: number
	readonly declinationJ2000: number
	readonly rightAscension: number
	readonly declination: number
	readonly azimuth: number
	readonly altitude: number
	readonly magnitude: number
	readonly constellation: string
	readonly distance: number
	readonly distanceUnit: string
	readonly illuminated: number
	readonly elongation: number
	readonly leading: boolean
}

export function imageOfSun() {}

export function positionOfSun(req: PositionOfBody) {
	return computeEphemeris('10', dateFrom(req.dateTime, true), deg(req.longitude), deg(req.latitude), meter(req.elevation))
}

export function altitudeChartOfSun(req: AltitudeChartOfBody) {
	return computeAltitudeChart('10', dateFrom(req.dateTime, true), req.stepSize)
}

export function earthSeasons() {}

export function positionOfMoon(req: PositionOfBody) {
	return computeEphemeris('301', dateFrom(req.dateTime, true), deg(req.longitude), deg(req.latitude), meter(req.elevation))
}

export function altitudeChartOfMoon(req: AltitudeChartOfBody) {
	return computeAltitudeChart('301', dateFrom(req.dateTime, true), req.stepSize)
}

export function moonPhases() {}

export function twilight() {}

export function positionOfPlanet(code: string, req: PositionOfBody) {
	return computeEphemeris(code, dateFrom(req.dateTime, true), deg(req.longitude), deg(req.latitude), meter(req.elevation))
}

export function altitudeChartOfPlanet(code: string, req: AltitudeChartOfBody) {
	return computeAltitudeChart(code, dateFrom(req.dateTime, true), req.stepSize)
}

export function searchMinorPlanet() {}

export function closeApproachesForMinorPlanets() {}

export function searchSkyObject() {}

export function skyObjectTypes() {}

export function positionOfSkyObject(req: PositionOfBody, id: string) {}

export function altitudeChartOfSkyObject(req: AltitudeChartOfBody) {}

export function searchSatellites() {}

export function positionOfSatellite(req: PositionOfBody, id: string) {}

export function altitudeChartOfSatellite(req: AltitudeChartOfBody) {}

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
	return map.get(time)!
}

function computeAltitudeChart(code: string, dateTime: DateTime, stepSizeInMinutes: number) {
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
