import type { DynamicDialogInstance, DynamicDialogOptions } from 'primevue/dynamicdialogoptions'
import { defineAsyncComponent } from 'vue'
import type { ListDirectory } from '../../src/file-system'

export interface DynamicDialogOpener {
	open: (content: unknown, options?: DynamicDialogOptions) => DynamicDialogInstance
}

export interface FileChooserData extends ListDirectory {
	multiple?: boolean
}

export interface FileChooserOptions {
	header: string
	data?: FileChooserData
}

const FileChooser = defineAsyncComponent(() => import('./FileChooser.vue'))

export function openFileChooser(dialog: DynamicDialogOpener, options?: FileChooserOptions) {
	dialog.open(FileChooser, {
		data: options?.data ?? {},
		props: {
			header: options?.header || 'File Chooser',
			modal: true,
		},
	})
}
