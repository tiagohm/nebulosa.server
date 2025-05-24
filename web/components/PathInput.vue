<script lang="ts" setup>
	import { useStorage } from '@vueuse/core'
	import { useDialog } from 'primevue/usedialog'
	import FloatInputText from './FloatInputText.vue'
	import IconButton from './IconButton.vue'
	import { filePicker } from './dialog'
	import type { PathInputProps } from './types'

	const props = defineProps<PathInputProps>()
	const path = useStorage<string>(`pathInput.${props.key}.path`, props.path || '')
	const dialog = useDialog()

	async function choose() {
		const paths = await filePicker(dialog, { header: 'Choose Path', data: { ...props, path: path.value } })

		if (paths?.length) {
			path.value = paths[0]
		}
	}

	defineExpose({ choose })
</script>

<template>
	<div class="mt-3 flex gap-2">
		<FloatInputText
			:label="label || 'Path'"
			:value="path"
			class="flex-1" />
		<IconButton
			icon="mdi mdi-folder-open"
			@click="choose()"
			v-tooltip.bottom="'Choose'" />
	</div>
</template>
