<script lang="ts" setup>
	import { useStorage } from '@vueuse/core'
	import type { ImageFormat } from 'nebulosa/src/image'
	import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions'
	import { type Ref, inject, onMounted, ref } from 'vue'
	import PathInput from './PathInput.vue'
	import type { SaveAsData } from './types'

	const dialog = inject<Ref<DynamicDialogInstance>>('dialogRef')!
	const data = ref<SaveAsData>()

	const imageFormat = useStorage<ImageFormat>('saveAs.format', 'fits')
	const imageFormatOptions = ref([
		{ label: 'FITS', value: 'fits' },
		{ label: 'XISF', value: 'xisf' },
		{ label: 'PNG', value: 'png' },
		{ label: 'JPEG', value: 'jpeg' },
		{ label: 'WEBP', value: 'webp' },
	])

	onMounted(() => {
		data.value = dialog.value.data ?? {}
	})
</script>

<template>
	<div class="flex flex-col justify-center gap-4">
		<PathInput key="saveAs" />

		<SelectButton
			option-label="label"
			option-value="value"
			size="small"
			v-model="imageFormat"
			:options="imageFormatOptions" />
	</div>
</template>
