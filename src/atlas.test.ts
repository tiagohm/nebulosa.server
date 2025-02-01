import { expect, test } from 'bun:test'
import { type BodyPosition, atlas } from './atlas'

test('positionOfSun', async () => {
	const request = new Request('http://localhost/atlas/sun/position?dateTime=2025-01-31T21:36:00&longitude=-45&latitude=-23&elevation=890')
	const response = await atlas.handle(request)
	const position = (await response.json()) as BodyPosition

	expect(position.rightAscensionJ2000).toBeCloseTo(5.487010782848625, 12)
	expect(position.declinationJ2000).toBeCloseTo(-0.3004046745898624, 12)
	expect(position.rightAscension).toBeCloseTo(5.498210909724522, 12)
	expect(position.declination).toBeCloseTo(-0.30089179598409405, 12)
	expect(position.azimuth).toBeCloseTo(4.399644478917377, 12)
	expect(position.altitude).toBeCloseTo(0.03410675300357515, 12)
	expect(position.magnitude).toBeCloseTo(-26.774, 3)
	expect(position.constellation).toBe('CAP')
	expect(position.distance).toBeCloseTo(147408018.51227665, 6)
	expect(position.distanceUnit).toBe('km')
	expect(position.illuminated).toBe(100)
	expect(position.elongation).toBe(0)
	expect(position.leading).toBeFalse()
})

test('positionOfMoon', async () => {
	const request = new Request('http://localhost/atlas/moon/position?dateTime=2025-01-15T21:36:00&longitude=-45&latitude=-23&elevation=890')
	const response = await atlas.handle(request)
	const position = (await response.json()) as BodyPosition

	expect(position.rightAscensionJ2000).toBeCloseTo(2.510279836007113, 12)
	expect(position.declinationJ2000).toBeCloseTo(0.31919436571805776, 12)
	expect(position.rightAscension).toBeCloseTo(2.5051473462757734, 12)
	expect(position.declination).toBeCloseTo(0.31378681209660375, 12)
	expect(position.azimuth).toBeCloseTo(1.3910762481519514, 12)
	expect(position.altitude).toBeCloseTo(-0.4168798679935272, 12)
	expect(position.magnitude).toBeCloseTo(-12.062, 3)
	expect(position.constellation).toBe('LEO')
	expect(position.distance).toBeCloseTo(392259.4844096544, 6)
	expect(position.distanceUnit).toBe('km')
	expect(position.illuminated).toBeCloseTo(95.41058, 4)
	expect(position.elongation).toBeCloseTo(2.7085851928162596, 12)
	expect(position.leading).toBeTrue()
})

test('positionOfMars', async () => {
	const request = new Request('http://localhost/atlas/planets/499/position?dateTime=2025-01-31T21:36:00&longitude=-45&latitude=-23&elevation=890')
	const response = await atlas.handle(request)
	const position = (await response.json()) as BodyPosition

	expect(position.rightAscensionJ2000).toBeCloseTo(1.9632543785239203, 12)
	expect(position.declinationJ2000).toBeCloseTo(0.45620236293376226, 12)
	expect(position.rightAscension).toBeCloseTo(1.9688629940752043, 12)
	expect(position.declination).toBeCloseTo(0.45456541862831673, 12)
	expect(position.azimuth).toBeCloseTo(0.9525893087384896, 12)
	expect(position.altitude).toBeCloseTo(0.2125455679893387, 12)
	expect(position.magnitude).toBeCloseTo(-1.144, 3)
	expect(position.constellation).toBe('GEM')
	expect(position.distance).toBeCloseTo(102231147.20948215, 6)
	expect(position.distanceUnit).toBe('km')
	expect(position.illuminated).toBeCloseTo(98.69578, 4)
	expect(position.elongation).toBeCloseTo(2.75473169823899, 12)
	expect(position.leading).toBeFalse()
})

test('altitudePointsOfSun', async () => {
	let request = new Request('http://localhost/atlas/sun/position?dateTime=2025-01-31T21:36:00&longitude=-45&latitude=-23&elevation=890')
	await atlas.handle(request)

	request = new Request('http://localhost/atlas/sun/altitude-points?dateTime=2025-01-31T21:36:00&stepSize=5')
	const response = await atlas.handle(request)
	const points = (await response.json()) as number[]

	expect(points).toHaveLength(289)
	expect(points[0]).toBeCloseTo(0.7755328294268905, 12)
	expect(points[288]).toBeCloseTo(0.7736406830782184, 12)
})

test('altitudePointsOfMoon', async () => {
	let request = new Request('http://localhost/atlas/moon/position?dateTime=2025-01-15T21:36:00&longitude=-45&latitude=-23&elevation=890')
	await atlas.handle(request)

	request = new Request('http://localhost/atlas/moon/altitude-points?dateTime=2025-01-15T21:36:00&stepSize=5')
	const response = await atlas.handle(request)
	const points = (await response.json()) as number[]

	expect(points).toHaveLength(289)
	expect(points[0]).toBeCloseTo(-0.47675490641964197, 12)
	expect(points[288]).toBeCloseTo(-0.27032654292561814, 12)
})

test('altitudePointsOfMars', async () => {
	let request = new Request('http://localhost/atlas/planets/499/position?dateTime=2025-01-31T21:36:00&longitude=-45&latitude=-23&elevation=890')
	await atlas.handle(request)

	request = new Request('http://localhost/atlas/planets/499/altitude-points?dateTime=2025-01-31T21:36:00&stepSize=5')
	const response = await atlas.handle(request)
	const points = (await response.json()) as number[]

	expect(points).toHaveLength(289)
	expect(points[0]).toBeCloseTo(-1.127593682275471, 12)
	expect(points[288]).toBeCloseTo(-1.1481425780232144, 12)
})
