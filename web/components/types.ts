import type { ButtonProps } from 'primevue/button'
import type { InputNumberProps } from 'primevue/inputnumber'
import type { InputTextProps } from 'primevue/inputtext'

export interface ConnectButtonProps extends /* @vue-ignore */ ButtonProps {
	connected: boolean
}

export interface FloatInputTextProps extends /* @vue-ignore */ InputTextProps {
	label: string
}

export interface FloatInputNumberProps extends /* @vue-ignore */ InputNumberProps {
	label: string
}

export interface IconButtonProps extends /* @vue-ignore */ Omit<ButtonProps, 'icon' | 'rounded' | 'text' | 'size'> {
	icon: string
}

export interface TextButtonProps extends /* @vue-ignore */ Omit<ButtonProps, 'icon' | 'rounded' | 'text' | 'size'> {
	icon: string
}

export interface ImageViewerProps {
	src: string
}
