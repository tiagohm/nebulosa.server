import { astapDetectStars } from 'nebulosa/src/astap'

export interface StarDetection {
	type: 'ASTAP' | 'PIXINSIGHT' | 'SIRIL'
	executable?: string
	path: string
	timeout: number
	minSNR: number
	maxStars: number
	slot: number
}

export async function detectStars(req: StarDetection) {
	if (req.type === 'ASTAP') {
		return await astapDetectStars(req.path, req)
	}

	return []
}
