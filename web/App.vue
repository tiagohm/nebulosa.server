<script setup
        lang="ts">
        import FloatInputNumber from '@/components/FloatInputNumber.vue'
        import FloatInputText from '@/components/FloatInputText.vue'
        import IconButton from '@/components/IconButton.vue'
        import ImageViewer from '@/components/ImageViewer.vue'
        import TextButton from '@/components/TextButton.vue'
        import * as api from '@/shared/api'
        import { useConnectionStore } from '@/stores/connection.store'
        import { onMounted, useTemplateRef } from 'vue'
        import ConnectionBox from './components/ConnectionBox.vue'

        const connection = useConnectionStore()
        const menuPopover = useTemplateRef('menuPopover')
        const imageViewer = useTemplateRef('imageViewer')

        const menuPopoverItems = [
            { title: 'Camera', icon: 'camera.png' },
            { title: 'Mount', icon: 'telescope.png' },
            { title: 'Filter Wheel', icon: 'filter-wheel.png' },
            { title: 'Focuser', icon: 'focus.png' },
            { title: 'Rotator', icon: 'rotate.png' },
            { title: 'Light Box', icon: 'light.png' },
            { title: 'Dust Cap', icon: 'lid.png' },
            { title: 'Guider', icon: 'guider.png' },
            { title: 'Sky Atlas', icon: 'atlas.png' },
            { title: 'Alignment', icon: 'star.png' },
            { title: 'Sequencer', icon: 'sequencer.png' },
            { title: 'Framing', icon: 'framing.png' },
            { title: 'Auto Focus', icon: 'auto-focus.png' },
            { title: 'Flat Wizard', icon: 'flat-wizard.png' },
            { title: 'INDI', icon: 'indi.png' },
            { title: 'Calculator', icon: 'calculator.png' },
            { title: 'Settings', icon: 'settings.png' },
            { title: 'About', icon: 'about.png' },
        ]

        // Choose the active connection if it exists
        async function chooseActiveConnection() {
            // Fetch the available connections
            const statuses = await api.connections()

            if (statuses) {
                // Find the active connection and choose it
                for (const status of statuses) {
                    for (const conn of connection.connections) {
                        if (status.id === conn.status?.id || ((status.host === conn.host || status.ip === conn.host) && status.port === conn.port && status.type === conn.type)) {
                            conn.connectedAt ??= Date.now()
                            conn.status = status
                            connection.current = conn
                            connection.connected = true
                            break
                        }
                    }

                    if (connection.connected) break
                }
            }
        }

        onMounted(() => {
            chooseActiveConnection()
        })
</script>

<template>
    <Toast position="bottom-center" />

    <!-- Toolbar -->

    <div class="w-full flex flex-row items-center justify-between gap-3 p-2 relative z-[1] bg-[#101010]">
        <ConnectionBox />

        <!-- Left Menu -->

        <IconButton icon="menu"
                    @click="menuPopover?.toggle($event)"
                    size="large"
                    v-tooltip.bottom="'Menu'" />

        <IconButton icon="image-plus"
                    size="large"
                    v-tooltip.bottom="'Open image'" />

        <Popover ref="menuPopover">
            <div class="grid grid-cols-6">
                <Button v-for="(item) in menuPopoverItems"
                        v-tooltip.bottom="item.title"
                        :text="true"
                        :key="item.title">
                    <img :src="item.icon"
                         width="28" />
                </Button>
            </div>
        </Popover>

        <div class="flex flex-row items-center justify-between gap-3 flex-1">
            <!-- Title -->

            <div class="flex flex-row items-center justify-center flex-1 select-none h-full min-h-[37px]">
                <span class="font-bold">Nebulosa</span>
            </div>

            <!-- Right Menu -->
        </div>
    </div>

    <!-- Content -->

    <ImageViewer ref='imageViewer'
                 src="https://github.com/dstndstn/astrometry.net/blob/main/demo/apod4.jpg?raw=true" />

    <!-- Connection Dialog -->

    <Dialog modal
            v-model:visible="connection.showDialog"
            header="Connection"
            :style="{ width: '18rem', maxWidth: '95vw' }">
        <div class="grid grid-cols-12 gap-3 mt-2">
            <div class="col-span-full">
                <FloatInputText label="Name"
                                maxlength="32"
                                v-model="connection.edited!.name" />
            </div>
            <div class="col-span-7">
                <FloatInputText label="Host"
                                maxlength="48"
                                v-model="connection.edited!.host" />
            </div>
            <div class="col-span-5">
                <FloatInputNumber label="Port"
                                  :min="80"
                                  :max="65535"
                                  v-model="connection.edited!.port" />
            </div>
            <div class="col-span-full flex justify-end gap-2">
                <TextButton label="Cancel"
                            icon="close"
                            severity="danger"
                            @click="connection.showDialog = false" />
                <TextButton label="Save"
                            icon="content-save"
                            :disabled="!connection.edited?.host || !connection.edited?.name"
                            @click="connection.save()" />
            </div>
        </div>
    </Dialog>
</template>

<style scoped></style>
