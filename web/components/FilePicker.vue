<script setup
        lang="ts">
        import { listDirectory } from '@/shared/api'
        import { formatDateTime } from '@/shared/utils'
        import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions'
        import type { MenuItem } from 'primevue/menuitem'
        import { type Ref, inject, onMounted, ref, toRaw, watch } from 'vue'
        import type { FileEntry, ListDirectory } from '../../src/file-system'
        import IconButton from './IconButton.vue'
        import TextButton from './TextButton.vue'
        import type { FilePickerData } from './dialog'

        const entries = ref<FileEntry[]>([])
        const selected = ref<FileEntry>()
        const dialog = inject<Ref<DynamicDialogInstance>>('dialogRef')
        const breadcrumb = ref<MenuItem[]>([])
        const data = ref<FilePickerData>()

        const result = ref<string[]>([])

        async function open(path: string) {
            const req: ListDirectory = { filter: data.value?.filter, path, directoryOnly: data.value?.mode === 'openDirectory' }
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
                                open(item.path)
                            }
                        },
                    })
                }
            }
        }

        function browseDirectory(entry: FileEntry, event: Event) {
            event.stopImmediatePropagation()
            open(entry.path)
        }

        watch(selected, (actual, prev) => {
            if (data.value && data.value.mode !== 'save') {
                const current = actual ?? prev

                if (current && current.directory !== (data.value.mode === 'openDirectory')) {
                    return
                }

                if (data.value.multiple) {
                    const path = current?.path

                    if (path) {
                        const index = result.value.indexOf(path)

                        if (index >= 0) {
                            result.value.splice(index, 1)
                        } else {
                            result.value.push(path)
                        }
                    }
                } else if (actual) {
                    result.value[0] = actual.path
                } else {
                    result.value = []
                }
            }
        })

        function choose() {
            dialog?.value.close(toRaw(result.value))
        }

        onMounted(() => {
            data.value = dialog!.value.data ?? {}
            return open(data.value!.path!)
        })
</script>

<template>
    <div class="flex flex-col gap-2">
        <Breadcrumb :model="breadcrumb" />
        <Listbox v-model="selected"
                 :options="entries"
                 class="w-full"
                 list-style="max-height: 250px"
                 data-key="name"
                 filter
                 :filter-fields="['name']"
                 filter-placeholder="Filter">
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
                        :disabled="!result.length"
                        :badge="result.length.toFixed(0)"
                        @click="choose()" />
        </div>
    </div>
</template>
