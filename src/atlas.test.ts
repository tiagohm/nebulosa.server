import { test } from 'bun:test'
import { atlas } from './atlas'

test('positionOfSun', async () => {
	const uri = encodeURI('http://localhost/atlas/sun/position?dateTime=2025-01-31T21:36:00&longitude=-45&latitude=-23&elevation=890&offsetInMinutes=-180')
	const request = new Request(uri)
	const response = await atlas.handle(request)
	console.log(await response.text())
})
