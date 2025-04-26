import type { BadgeProps } from 'primevue/badge'
import type { ButtonProps } from 'primevue/button'
import type { ContextMenuRouterBindProps } from 'primevue/contextmenu'
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

// biome-ignore lint/suspicious/noEmptyInterface:
export interface ImageViewerProps {}

export interface ExtendedMenuItemCommandEvent {
	originalEvent: Event
	item: ExtendedMenuItem
}

export interface ExtendedMenuItem {
	separator?: boolean
	label?: string | ((...args: unknown[]) => string)
	icon?: string
	disabled?: boolean | ((...args: unknown[]) => boolean)
	visible?: boolean | ((...args: unknown[]) => boolean)

	style?: unknown
	class?: unknown
	key?: string

	severity?: ButtonProps['severity']
	data?: unknown

	badge?: string
	badgeSeverity?: BadgeProps['severity']

	checkable?: boolean
	checked?: boolean

	selected?: boolean

	items?: ExtendedMenuItem[]

	command?: (event: ExtendedMenuItemCommandEvent) => void
	check?: (checked: boolean, item: MenuItemProps['item']) => void
}

export interface MenuItemProps {
	item: Omit<ExtendedMenuItem, 'separator' | 'data'>
	props: ContextMenuRouterBindProps
}

export const SEPARATOR_MENU_ITEM: Readonly<ExtendedMenuItem> = { separator: true }
