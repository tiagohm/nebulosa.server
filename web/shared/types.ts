import type { BadgeProps } from 'primevue/badge'
import type { ButtonProps } from 'primevue/button'
import type { ContextMenuRouterBindProps } from 'primevue/contextmenu'
import type { DynamicDialogInstance, DynamicDialogOptions } from 'primevue/dynamicdialogoptions'
import type { InputNumberProps } from 'primevue/inputnumber'
import type { InputTextProps } from 'primevue/inputtext'
import type { ImageTransformation, ListDirectory } from '../../src/types'

// Dialog

export interface DynamicDialogOptionsWithData<T> extends DynamicDialogOptions {
	data?: T
}

export interface DynamicDialogOpener {
	readonly open: (content: unknown, options?: DynamicDialogOptions) => DynamicDialogInstance
}

export type FilePickerMode = 'openFile' | 'openDirectory' | 'save'

export interface FilePickerData extends ListDirectory {
	readonly multiple?: boolean
	readonly mode?: FilePickerMode
}

export interface SaveImageData extends Omit<ListDirectory, 'directoryOnly'> {
	readonly filename?: string
	readonly transformation?: ImageTransformation
}

// Components

export interface ConnectButtonProps extends /* @vue-ignore */ ButtonProps {
	readonly connected: boolean
}

export interface FloatInputTextProps extends /* @vue-ignore */ InputTextProps {
	readonly label: string
}

export interface FloatInputNumberProps extends /* @vue-ignore */ InputNumberProps {
	readonly label: string
}

export interface IconButtonProps extends /* @vue-ignore */ Omit<ButtonProps, 'icon' | 'rounded' | 'text' | 'size'> {
	readonly icon: string
}

export interface TextButtonProps extends /* @vue-ignore */ Omit<ButtonProps, 'icon' | 'rounded' | 'text' | 'size'> {
	readonly icon: string
}

export interface PathInputProps extends FilePickerData {
	readonly key: string
	readonly label?: string
}

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
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
