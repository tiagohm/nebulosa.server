import { defineAsyncComponent } from 'vue'
import type { DynamicDialogOpener, DynamicDialogOptionsWithData, FilePickerData, SaveImageData } from './types'

export function openDialog<T>(dialog: DynamicDialogOpener, content: unknown, options?: DynamicDialogOptionsWithData<unknown>) {
	return new Promise<T>((resolve) => {
		dialog.open(content, {
			...options,
			props: { ...options?.props, modal: true, draggable: true, blockScroll: true },
			onClose: (result) => {
				options?.onClose?.(result)
				resolve(result?.data)
			},
		})
	})
}

// File Picker

export const FilePicker = defineAsyncComponent(() => import('@/components/common/FilePicker.vue'))

export function filePicker(dialog: DynamicDialogOpener, options?: DynamicDialogOptionsWithData<FilePickerData>) {
	return openDialog<string[] | undefined>(dialog, FilePicker, options)
}

// Save Image

export const SaveImage = defineAsyncComponent(() => import('@/components/image/SaveImage.vue'))

export function saveImage(dialog: DynamicDialogOpener, options?: DynamicDialogOptionsWithData<SaveImageData>) {
	return openDialog<string | undefined>(dialog, SaveImage, { ...options, props: { ...options?.props, header: options?.props?.header || 'Save Image' }, data: { ...options?.data, mode: 'save' } })
}
