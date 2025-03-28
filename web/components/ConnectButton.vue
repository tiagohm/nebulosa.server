<script setup
        lang="ts">
        import IconButton from './IconButton.vue'
        import type { ConnectButtonProps } from './types'

        defineProps<ConnectButtonProps>()
</script>

<template>
    <IconButton :icon="connected ? 'close' : 'connection'"
                :severity="connected ? 'danger' : 'info'"
                v-tooltip.bottom="connected ? 'Disconnect' : 'Connect'" />
</template>
