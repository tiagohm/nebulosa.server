import { expect, test } from 'bun:test'
// biome-ignore format:
import { type PositionOfBody, altitudeChartOfMoon, altitudeChartOfPlanet, altitudeChartOfSun, positionOfMoon, positionOfPlanet, positionOfSun } from '../src/atlas'

process.env.TZ = 'America/Sao_Paulo'

test('positionOfSun', async () => {
	const request: PositionOfBody = { dateTime: '2025-01-31T21:36:00', longitude: -45, latitude: -23, elevation: 890 }
	const response = await positionOfSun(request)

	expect(response.rightAscensionJ2000).toBeCloseTo(5.487010782848625, 12)
	expect(response.declinationJ2000).toBeCloseTo(-0.3004046745898624, 12)
	expect(response.rightAscension).toBeCloseTo(5.498210909724522, 12)
	expect(response.declination).toBeCloseTo(-0.30089179598409405, 12)
	expect(response.azimuth).toBeCloseTo(4.399644478917377, 12)
	expect(response.altitude).toBeCloseTo(0.03410675300357515, 12)
	expect(response.magnitude).toBeCloseTo(-26.774, 3)
	expect(response.constellation).toBe('CAP')
	expect(response.distance).toBeCloseTo(147408018.51227665, 6)
	expect(response.distanceUnit).toBe('km')
	expect(response.illuminated).toBe(100)
	expect(response.elongation).toBe(0)
	expect(response.leading).toBeFalse()
})

test('positionOfMoon', async () => {
	const request: PositionOfBody = { dateTime: '2025-01-15T21:36:00', longitude: -45, latitude: -23, elevation: 890 }
	const response = await positionOfMoon(request)

	expect(response.rightAscensionJ2000).toBeCloseTo(2.510279836007113, 12)
	expect(response.declinationJ2000).toBeCloseTo(0.31919436571805776, 12)
	expect(response.rightAscension).toBeCloseTo(2.5051473462757734, 12)
	expect(response.declination).toBeCloseTo(0.31378681209660375, 12)
	expect(response.azimuth).toBeCloseTo(1.3910762481519514, 12)
	expect(response.altitude).toBeCloseTo(-0.4168798679935272, 12)
	expect(response.magnitude).toBeCloseTo(-12.062, 3)
	expect(response.constellation).toBe('LEO')
	expect(response.distance).toBeCloseTo(392259.4844096544, 6)
	expect(response.distanceUnit).toBe('km')
	expect(response.illuminated).toBeCloseTo(95.41058, 4)
	expect(response.elongation).toBeCloseTo(2.7085851928162596, 12)
	expect(response.leading).toBeTrue()
})

test('positionOfMars', async () => {
	const request: PositionOfBody = { dateTime: '2025-01-31T21:36:00', longitude: -45, latitude: -23, elevation: 890 }
	const response = await positionOfPlanet('499', request)

	expect(response.rightAscensionJ2000).toBeCloseTo(1.9632543785239203, 12)
	expect(response.declinationJ2000).toBeCloseTo(0.45620236293376226, 12)
	expect(response.rightAscension).toBeCloseTo(1.9688629940752043, 12)
	expect(response.declination).toBeCloseTo(0.45456541862831673, 12)
	expect(response.azimuth).toBeCloseTo(0.9525893087384896, 12)
	expect(response.altitude).toBeCloseTo(0.2125455679893387, 12)
	expect(response.magnitude).toBeCloseTo(-1.144, 3)
	expect(response.constellation).toBe('GEM')
	expect(response.distance).toBeCloseTo(102231147.20948215, 6)
	expect(response.distanceUnit).toBe('km')
	expect(response.illuminated).toBeCloseTo(98.69578, 4)
	expect(response.elongation).toBeCloseTo(2.75473169823899, 12)
	expect(response.leading).toBeFalse()
})

test('altitudePointsOfSun', async () => {
	const request: PositionOfBody = { dateTime: '2025-01-31T15:36:00', longitude: -45, latitude: -23, elevation: 890 }
	await positionOfSun(request)
	const response = altitudeChartOfSun({ ...request, stepSize: 5 })

	expect(response).toHaveLength(289)
	expect(response[0]).toBeCloseTo(0.7755328294268905, 12)
	expect(response[288]).toBeCloseTo(0.773640665624926, 12)
})

test('altitudePointsOfMoon', async () => {
	const request: PositionOfBody = { dateTime: '2025-01-15T21:36:00', longitude: -45, latitude: -23, elevation: 890 }
	await positionOfMoon(request)
	const response = altitudeChartOfMoon({ ...request, stepSize: 5 })

	expect(response).toHaveLength(289)
	expect(response[0]).toBeCloseTo(-0.47675490641964197, 12)
	expect(response[288]).toBeCloseTo(-0.27032654292561814, 12)
})

test('altitudePointsOfMars', async () => {
	const request: PositionOfBody = { dateTime: '2025-01-31T21:36:00', longitude: -45, latitude: -23, elevation: 890 }
	await positionOfPlanet('499', request)
	const response = altitudeChartOfPlanet('499', { ...request, stepSize: 5 })

	expect(response).toHaveLength(289)
	expect(response[0]).toBeCloseTo(-1.127593682275471, 12)
	expect(response[288]).toBeCloseTo(-1.1481425780232144, 12)
})
