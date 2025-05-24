import { defineAsyncComponent } from 'vue'
import type { DynamicDialogOpener, DynamicDialogOptionsWithData, FilePickerData, SaveAsData } from './types'

export function openDialog<T>(dialog: DynamicDialogOpener, content: unknown, options?: DynamicDialogOptionsWithData<unknown>) {
	return new Promise<T>((resolve) => {
		dialog.open(content, {
			...options,
			props: { ...options?.props, modal: true },
			onClose: (result) => {
				options?.onClose?.(result)
				resolve(result?.data)
			},
		})
	})
}

// File Picker

export const FilePicker = defineAsyncComponent(() => import('./FilePicker.vue'))

export function filePicker(dialog: DynamicDialogOpener, options?: DynamicDialogOptionsWithData<FilePickerData>) {
	return openDialog<string[] | undefined>(dialog, FilePicker, options)
}

// Save As

export const SaveAs = defineAsyncComponent(() => import('./SaveAs.vue'))

export function saveAs(dialog: DynamicDialogOpener, options?: DynamicDialogOptionsWithData<SaveAsData>) {
	return openDialog<string | undefined>(dialog, SaveAs, { ...options, props: { ...options?.props, header: options?.props?.header || 'Save As' }, data: { ...options?.data, mode: 'save' } })
}
