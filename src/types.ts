import type { TLiteral, TUnion } from '@sinclair/typebox'
import { type Static, t as T } from 'elysia'

// https://github.com/sinclairzx81/typebox/issues/105#issuecomment-917385119
export type IntoStringLiteralUnion<T> = { [K in keyof T]: T[K] extends string ? TLiteral<T[K]> : never }

export function StringLiteralUnion<T extends string[]>(values: [...T]): TUnion<IntoStringLiteralUnion<T>> {
	return T.Union(values.map((value) => T.Literal(value))) as TUnion<IntoStringLiteralUnion<T>>
}

export const ANGLE_TYPE = T.Union([T.String(), T.Number()])

export const LOCATION_TYPE = T.Object({
	longitude: T.Number({ minimum: -180, maximum: 180 }),
	latitude: T.Number({ minimum: -90, maximum: 90 }),
	elevation: T.Number(),
})

export const DATE_TIME_TYPE = T.Object({
	dateTime: T.String(),
})

export const OPEN_IMAGE_TYPE = T.Object({
	path: T.String(),
	camera: T.Optional(T.String()),
})

export const CLOSE_IMAGE_TYPE = T.Object({
	id: T.String(),
})

export const IMAGE_STRETCH_TYPE = T.Object({
	auto: T.Boolean(),
	shadow: T.Integer(),
	highlight: T.Integer(),
	midtone: T.Integer(),
	meanBackground: T.Number(),
})

export const IMAGE_SCNR_TYPE = T.Object({
	channel: StringLiteralUnion(['GRAY', 'RED', 'GREEN', 'BLUE']),
	amount: T.Number(),
	method: StringLiteralUnion(['MAXIMUM_MASK', 'ADDITIVE_MASK', 'AVERAGE_NEUTRAL', 'MAXIMUM_NEUTRAL', 'MINIMUM_NEUTRAL']),
})

export const IMAGE_ADJUSTMENT_LEVEL_TYPE = T.Object({
	enabled: T.Boolean(),
	value: T.Number(),
})

export const IMAGE_ADJUSTMENT_TYPE = T.Object({
	enabled: T.Boolean(),
	contrast: IMAGE_ADJUSTMENT_LEVEL_TYPE,
	brightness: IMAGE_ADJUSTMENT_LEVEL_TYPE,
	exposure: IMAGE_ADJUSTMENT_LEVEL_TYPE,
	gamma: IMAGE_ADJUSTMENT_LEVEL_TYPE,
	saturation: IMAGE_ADJUSTMENT_LEVEL_TYPE,
	fade: IMAGE_ADJUSTMENT_LEVEL_TYPE,
})

export const IMAGE_TRANSFORMATION_TYPE = T.Object({
	force: T.Boolean(),
	calibrationGroup: T.Optional(T.String()),
	debayer: T.Boolean(),
	stretch: IMAGE_STRETCH_TYPE,
	mirrorHorizontal: T.Boolean(),
	mirrorVertical: T.Boolean(),
	invert: T.Boolean(),
	scnr: IMAGE_SCNR_TYPE,
	useJPEG: T.Boolean(),
	adjustment: IMAGE_ADJUSTMENT_TYPE,
})

export const POSITION_OF_BODY_TYPE = T.Composite([DATE_TIME_TYPE, LOCATION_TYPE])

export const ALTITUDE_POINTS_OF_BODY_TYPE = T.Composite([
	DATE_TIME_TYPE,
	T.Object({
		stepSize: T.Number({ minimum: 1, maximum: 60 }),
	}),
])

export const FRAMING_TYPE = T.Object({
	hipsSurvey: T.String(),
	rightAscension: ANGLE_TYPE,
	declination: ANGLE_TYPE,
	width: T.Number({ minimum: 1, maximum: 7680 }),
	height: T.Number({ minimum: 1, maximum: 4320 }),
	fov: T.Optional(T.Number({ minimum: 0, maximum: 90 })),
	rotation: T.Optional(T.Number()),
})

export type ImageStretch = Readonly<Static<typeof IMAGE_STRETCH_TYPE>>

export type ImageScnr = Readonly<Static<typeof IMAGE_SCNR_TYPE>>

export type ImageAdjustmentLevel = Readonly<Static<typeof IMAGE_ADJUSTMENT_LEVEL_TYPE>>

export type ImageAdjustment = Readonly<Static<typeof IMAGE_ADJUSTMENT_TYPE>>

export type ImageTransformation = Readonly<Static<typeof IMAGE_TRANSFORMATION_TYPE>>

export type OpenImage = Readonly<Static<typeof OPEN_IMAGE_TYPE>>

export type CloseImage = Readonly<Static<typeof CLOSE_IMAGE_TYPE>>

export type Location = Readonly<Static<typeof LOCATION_TYPE>>

export type PositionOfSun = Readonly<Static<typeof POSITION_OF_BODY_TYPE>>

export type PositionOfMoon = Readonly<Static<typeof POSITION_OF_BODY_TYPE>>

export type PositionOfPlanet = Readonly<Static<typeof POSITION_OF_BODY_TYPE>>

export type PositionOfSkyObject = Readonly<Static<typeof POSITION_OF_BODY_TYPE>>

export type PositionOfSatellite = Readonly<Static<typeof POSITION_OF_BODY_TYPE>>

export type AltitudePointsOfSun = Readonly<Static<typeof ALTITUDE_POINTS_OF_BODY_TYPE>>

export type AltitudePointsOfMoon = Readonly<Static<typeof ALTITUDE_POINTS_OF_BODY_TYPE>>

export type AltitudePointsOfPlanet = Readonly<Static<typeof ALTITUDE_POINTS_OF_BODY_TYPE>>

export type AltitudePointsOfSkyObject = Readonly<Static<typeof ALTITUDE_POINTS_OF_BODY_TYPE>>

export type AltitudePointsOfSatellite = Readonly<Static<typeof ALTITUDE_POINTS_OF_BODY_TYPE>>

export type Framing = Static<typeof FRAMING_TYPE>
