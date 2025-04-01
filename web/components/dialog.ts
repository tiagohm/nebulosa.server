import type { DynamicDialogInstance, DynamicDialogOptions } from 'primevue/dynamicdialogoptions'
import { defineAsyncComponent } from 'vue'
import type { ListDirectory } from '../../src/file-system'

export interface DynamicDialogOpener {
	open: (content: unknown, options?: DynamicDialogOptions) => DynamicDialogInstance
}

// File Chooser

export type FilePickerMode = 'openFile' | 'openDirectory' | 'save'

export interface FilePickerData extends ListDirectory {
	readonly multiple?: boolean
	readonly mode?: FilePickerMode
}

export interface FilePickerOptions extends DynamicDialogOptions {
	readonly data?: FilePickerData
}

const FilePicker = defineAsyncComponent(() => import('./FilePicker.vue'))

export function openFilePicker(dialog: DynamicDialogOpener, options?: FilePickerOptions) {
	return new Promise<string[] | undefined>((resolve) => {
		dialog.open(FilePicker, {
			...options,
			props: { ...options?.props, modal: true },
			onClose: (result) => {
				options?.onClose?.(result)
				resolve(result?.data)
			},
		})
	})
}
