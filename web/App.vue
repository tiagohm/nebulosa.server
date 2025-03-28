<script setup
        lang="ts">
        import ConnectButton from '@/components/ConnectButton.vue'
        import FloatInputNumber from '@/components/FloatInputNumber.vue'
        import FloatInputText from '@/components/FloatInputText.vue'
        import IconButton from '@/components/IconButton.vue'
        import ImageViewer from '@/components/ImageViewer.vue'
        import TextButton from '@/components/TextButton.vue'
        import * as api from '@/shared/api'
        import { formatDate } from '@/shared/utils'
        import { useConnectionStore } from '@/stores/connection.store'
        import { onMounted, useTemplateRef } from 'vue'

        const connection = useConnectionStore()
        const menuPopover = useTemplateRef('menuPopover')
        const imageViewer = useTemplateRef('imageViewer')

        const menuPopoverItems = [
            { title: 'Camera', icon: new URL('@/assets/images/camera.png', import.meta.url).href },
            { title: 'Mount', icon: new URL('@/assets/images/telescope.png', import.meta.url).href },
            { title: 'Filter Wheel', icon: new URL('@/assets/images/filter-wheel.png', import.meta.url).href },
            { title: 'Focuser', icon: new URL('@/assets/images/focus.png', import.meta.url).href },
            { title: 'Rotator', icon: new URL('@/assets/images/rotate.png', import.meta.url).href },
            { title: 'Light Box', icon: new URL('@/assets/images/light.png', import.meta.url).href },
            { title: 'Dust Cap', icon: new URL('@/assets/images/lid.png', import.meta.url).href },
            { title: 'Guider', icon: new URL('@/assets/images/guider.png', import.meta.url).href },
            { title: 'Sky Atlas', icon: new URL('@/assets/images/atlas.png', import.meta.url).href },
            { title: 'Alignment', icon: new URL('@/assets/images/star.png', import.meta.url).href },
            { title: 'Sequencer', icon: new URL('@/assets/images/sequencer.png', import.meta.url).href },
            { title: 'Framing', icon: new URL('@/assets/images/framing.png', import.meta.url).href },
            { title: 'Auto Focus', icon: new URL('@/assets/images/auto-focus.png', import.meta.url).href },
            { title: 'Flat Wizard', icon: new URL('@/assets/images/flat-wizard.png', import.meta.url).href },
            { title: 'INDI', icon: new URL('@/assets/images/indi.png', import.meta.url).href },
            { title: 'Calculator', icon: new URL('@/assets/images/calculator.png', import.meta.url).href },
            { title: 'Settings', icon: new URL('@/assets/images/settings.png', import.meta.url).href },
            { title: 'About', icon: new URL('@/assets/images/about.png', import.meta.url).href },
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
        <!-- Connection Box -->

        <div class="flex flex-row items-center gap-3">
            <!-- New Connection Button -->

            <Button :text="true"
                    :rounded="true"
                    size="small"
                    severity="success"
                    v-tooltip.bottom="'New'"
                    @click="connection.add()">
                <i class="mdi mdi-plus" />
            </Button>

            <!-- Connection List -->

            <Select v-model="connection.current"
                    :options="connection.connections"
                    size="small"
                    :disabled="connection.connected || connection.connecting"
                    class="w-full">
                <template #value="item">
                    <div class="flex items-center justify-between">
                        <div class="flex flex-col justify-center">
                            <span>{{ item.value?.name }}</span>
                            <span class="text-xs">{{ item.value?.host }}:{{ item.value?.port }}</span>
                        </div>
                        <Tag severity="info"
                             :value="item?.value.type" />
                    </div>
                </template>
                <template #option="item">
                    <div class="w-full flex flex-row items-center justify-between gap-2">
                        <div class="flex flex-col justify-center">
                            <span class="font-bold">{{ item.option.name }}</span>
                            <span class="text-sm">{{ item.option.host }}:{{ item.option.port }}</span>
                            <span class="flex items-center gap-2">
                                <Tag severity="info"
                                     :value="item.option.type"
                                     class="max-w-fit" />
                                <span class="text-sm"> <i class="mdi mdi-clock" /> {{ formatDate(item.option.connectedAt, 'never') }}</span>
                            </span>
                        </div>
                        <div class="flex flex-col justify-center">
                            <IconButton icon="pencil"
                                        severity="info"
                                        v-tooltip.bottom="'Edit'"
                                        @click="connection.edit(item.option, $event)" />
                            <IconButton icon="delete"
                                        severity="danger"
                                        v-tooltip.bottom="'Remove'"
                                        @click="connection.remove(item.option, $event)" />
                        </div>
                    </div>
                </template>
            </Select>

            <!-- Connect Button -->

            <ConnectButton :connected="connection.connected"
                           :disabled="connection.connecting"
                           @click="connection.connectOrDisconnect()" />

            <!-- Menu -->

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
        </div>

        <div class="flex flex-row items-center justify-between gap-3 flex-1">
            <!-- Title -->

            <div class="flex flex-row items-center justify-center flex-1 draggable-region select-none h-full min-h-[37px]">
                <span class="font-bold">Nebulosa</span>
            </div>
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
