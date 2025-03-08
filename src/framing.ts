import { type Angle, deg, parseAngle } from 'nebulosa/src/angle'
import { hips2Fits } from 'nebulosa/src/hips2fits'

export interface Framing {
	hipsSurvey: string
	rightAscension: string | Angle
	declination: string | Angle
	width: number
	height: number
	fov: number // deg
	rotation: number // deg
}

export function frame(req: Framing) {
	const rightAscension = parseAngle(req.rightAscension, { isHour: true }) ?? 0
	const declination = parseAngle(req.declination) ?? 0
	req.fov = deg(req.fov || 1)
	req.rotation = deg(req.fov)
	return hips2Fits(req.hipsSurvey, rightAscension, declination, req)
}
