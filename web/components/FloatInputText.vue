<script setup
        lang="ts">
        import type { FloatInputTextProps } from './types'

        defineProps<FloatInputTextProps>()
</script>

<template>
    <FloatLabel variant="on">
        <InputText size="small"
                   class="w-full"
                   v-bind="$attrs" />
        <label>{{ label }}</label>
    </FloatLabel>
</template>
