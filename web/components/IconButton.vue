<script setup
        lang="ts">
        import type { IconButtonProps } from './types'

        defineProps<IconButtonProps>()
</script>

<template>
    <Button :text="true"
            :rounded="true"
            v-bind="$attrs">
        <i :class="['mdi', `mdi-${icon}`]" />
    </Button>
</template>
