<script setup
        lang="ts">
        import ConnectButton from '@/components/ConnectButton.vue'
        import IconButton from '@/components/IconButton.vue'
        import { formatDateTime } from '@/shared/utils'
        import { useConnectionStore } from '@/stores/connection.store'

        const connection = useConnectionStore()
</script>

<template>
    <div class="flex flex-row items-center gap-3">
        <!-- New Button -->

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
                            <span class="text-sm"> <i class="mdi mdi-clock" /> {{ formatDateTime(item.option.connectedAt, 'never') }}</span>
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
    </div>
</template>
