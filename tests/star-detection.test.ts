import { expect, test } from 'bun:test'
import os from 'os'
import { join } from 'path'
import { type StarDetection, detectStars } from '../src/star-detection'

process.env.TZ = 'America/Sao_Paulo'

const apod4 = Bun.file(join(os.tmpdir(), 'apod4.jpg'))

test.skip('detectStars', async () => {
	if (!(await apod4.exists())) {
		const response = await fetch('https://github.com/dstndstn/astrometry.net/blob/main/demo/apod4.jpg?raw=true')
		await Bun.write(apod4, response)
	}

	const request: StarDetection = {
		type: 'ASTAP',
		executable: 'astap',
		path: apod4.name!,
		timeout: 0,
		minSNR: 0,
		maxStars: 0,
		slot: 0,
	}

	const response = await detectStars(request)

	expect(response).toHaveLength(344)
})
