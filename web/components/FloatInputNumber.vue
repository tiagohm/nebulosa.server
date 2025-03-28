<script setup
        lang="ts">
        import { useTemplateRef } from 'vue'
        import type { FloatInputNumberProps } from './types'

        defineProps<FloatInputNumberProps>()

        const input = useTemplateRef('input')

        function wheeled(event: WheelEvent) {
            const delta = event.deltaY || event.deltaX

            if (delta === 0 || !input.value) return

            const { min, max, disabled, readonly, step, modelValue: value } = input.value.$props

            if (disabled || readonly || value === null || value === undefined) return

            const increment = step ?? 1
            const newValue = value + (Math.sign(delta) < 0 ? increment : -increment)

            if (newValue !== value) {
                if ((min === undefined || newValue >= min) && (max === undefined || newValue <= max)) {
                    input.value.$props.modelValue = newValue
                }
            }

            event.stopImmediatePropagation()
        }
</script>

<template>
    <FloatLabel variant="on">
        <InputNumber size="small"
                     :show-buttons="true"
                     :allow-empty="false"
                     class="w-full"
                     v-bind="$attrs"
                     ref="input"
                     @wheel="wheeled($event)" />
        <label>{{ label }}</label>
    </FloatLabel>
</template>
