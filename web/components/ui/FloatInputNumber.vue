<script setup lang="ts">
	import type { FloatInputNumberProps } from '@/shared/types'
	import { useTemplateRef } from 'vue'

	defineProps<FloatInputNumberProps>()

	const input = useTemplateRef('input')

	function wheeled(event: WheelEvent) {
		const delta = event.deltaY || event.deltaX

		if (delta === 0 || !input.value) return

		const { min, max, disabled, readonly, step, modelValue: value } = input.value.$props

		if (disabled || readonly || value === null || value === undefined) return

		const increment = step ?? 1
		const direction = -Math.sign(delta)
		const nextValue = value + increment * direction

		if (nextValue !== value) {
			if ((min === undefined || nextValue >= min) && (max === undefined || nextValue <= max)) {
				// biome-ignore lint/suspicious/noExplicitAny:
				;(input.value as any).spin(event, direction)
			}
		}

		event.stopImmediatePropagation()
	}
</script>

<template>
	<FloatLabel variant="on">
		<InputNumber
			size="small"
			:show-buttons="true"
			:allow-empty="false"
			class="w-full"
			v-bind="$attrs"
			ref="input"
			@wheel="wheeled($event)" />
		<label>{{ label }}</label>
	</FloatLabel>
</template>
