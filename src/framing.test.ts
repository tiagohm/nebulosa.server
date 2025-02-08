import { expect, test } from 'bun:test'
import type { HipsSurvey } from 'nebulosa/src/hips2fits'
import { framing } from './framing'

test('frame', async () => {
	const request = new Request('http://localhost/framing?hipsSurvey=CDS/P/DSS2/red&rightAscension=0&declination=0&width=400&height=400&fov=1')
	const response = await framing.handle(request)
	const frame = await response.bytes()

	expect(frame).toHaveLength(325440)
})

test('hipsSurveys', async () => {
	const request = new Request('http://localhost/framing/hips-surveys')
	const response = await framing.handle(request)
	const surveys = (await response.json()) as HipsSurvey[]

	expect(surveys).toHaveLength(116)
	expect(surveys[0].id).toBe('CDS/P/2MASS/H')
	expect(surveys[0].category).toBe('Image/Infrared/2MASS')
	expect(surveys[0].frame).toBe('equatorial')
	expect(surveys[0].regime).toBe('infrared')
	expect(surveys[0].bitpix).toBe(-32)
	expect(surveys[0].pixelScale).toBe(2.236e-4)
	expect(surveys[0].skyFraction).toBe(1)
})
