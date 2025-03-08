import { expect, test } from 'bun:test'
import { type Framing, frame } from '../src/framing'

process.env.TZ = 'America/Sao_Paulo'

test('frame', async () => {
	const request: Framing = { hipsSurvey: 'CDS/P/DSS2/red', rightAscension: 0, declination: 0, width: 400, height: 400, fov: 1, rotation: 0 }
	const response = await frame(request)

	expect(response).toHaveLength(325440)
})
