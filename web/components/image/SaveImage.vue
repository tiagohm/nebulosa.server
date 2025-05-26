<script lang="ts" setup>
	import PathInput from '@/components/ui/PathInput.vue'
	import type { SaveImageData } from '@/shared/types'
	import { useStorage } from '@vueuse/core'
	import type { ImageFormat } from 'nebulosa/src/image'
	import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions'
	import { type Ref, inject, onMounted, ref } from 'vue'

	const dialog = inject<Ref<DynamicDialogInstance>>('dialogRef')!
	const data = ref<SaveImageData>()
	const imageFormat = useStorage<ImageFormat>('saveImageDialog.format', 'fits')

	const IMAGE_FORMATS = [
		{ label: 'FITS', value: 'fits' },
		{ label: 'XISF', value: 'xisf' },
		{ label: 'PNG', value: 'png' },
		{ label: 'JPEG', value: 'jpeg' },
		{ label: 'WEBP', value: 'webp' },
	]

	onMounted(() => {
		data.value = dialog.value.data ?? {}
	})
</script>

<template>
	<div class="flex flex-col justify-center gap-4">
		<PathInput key="saveImageDialog" />

		<SelectButton
			option-label="label"
			option-value="value"
			size="small"
			v-model="imageFormat"
			:options="IMAGE_FORMATS" />
	</div>
</template>
