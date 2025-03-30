<script setup
        lang="ts">
        import { listDirectory } from '@/shared/api'
        import { formatDateTime } from '@/shared/utils'
        import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions'
        import type { MenuItem } from 'primevue/menuitem'
        import { type Ref, inject, onMounted, ref } from 'vue'
        import type { FileEntry, ListDirectory } from '../../src/file-system'
        import IconButton from './IconButton.vue'
        import TextButton from './TextButton.vue'
        import type { FileChooserData } from './dialog'

        const entries = ref<FileEntry[]>([])
        const selectedEntry = ref<FileEntry>()
        const dialog = inject<Ref<DynamicDialogInstance>>('dialogRef')
        const breadcrumb = ref<MenuItem[]>([])
        const data = ref<FileChooserData>()

        async function open(req: ListDirectory) {
            const fileSystem = await listDirectory(req)

            if (fileSystem) {
                entries.value = fileSystem.entries

                breadcrumb.value = []

                for (const item of fileSystem.tree) {
                    breadcrumb.value.push({
                        icon: item.name ? undefined : 'mdi mdi-home',
                        label: item.name,
                        command: () => {
                            if (item.path !== req.path) {
                                open({ path: item.path, filter: req.filter })
                            }
                        },
                    })
                }
            }
        }

        function browseDirectory(entry: FileEntry, event: Event) {
            event.stopImmediatePropagation()
            open({ path: entry.path, filter: dialog!.value.data.filter })
        }

        onMounted(() => {
            data.value = dialog!.value.data
            return open(data.value!)
        })
</script>

<template>
    <div class="flex flex-col gap-2">
        <Breadcrumb :model="breadcrumb" />
        <Listbox v-model="selectedEntry"
                 :options="entries"
                 class="w-full"
                 listStyle="max-height: 250px"
                 filter
                 :filterFields="['name']"
                 filterPlaceholder="Filter">
            <template #option="item">
                <div class="w-full flex flex-row gap-2 items-center justify-between">
                    <div class="flex flex-row items-center gap-2">
                        <i class="mdi"
                           :class="{ 'mdi-file': !item.option.directory, 'mdi-folder': item.option.directory }" />
                        <div class="text-sm font-bold">{{ item.option.name }}</div>
                    </div>
                    <div v-if="item.option.directory"
                         class="flex flex-row items-center">
                        <IconButton icon="folder-open"
                                    @click="browseDirectory(item.option, $event)"
                                    v-tooltip.bottom="'Browse'" />
                    </div>
                    <div v-else
                         class="flex flex-col justify-center items-end gap-1">
                        <span class="text-xs">{{ item.option.size }} B</span>
                        <span class="text-xs">{{ formatDateTime(item.option.updatedAt) }}</span>
                    </div>
                </div>
            </template>
        </Listbox>
        <div class="flex flex-row justify-end items-center">
            <TextButton icon="check"
                        label="Choose"
                        :disabled="!selectedEntry" />
        </div>
    </div>
</template>
