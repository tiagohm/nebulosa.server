<script setup lang="ts">
	import { createDirectory, listDirectory } from '@/shared/api'
	import { formatDateTime } from '@/shared/utils'
	import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions'
	import type { MenuItem } from 'primevue/menuitem'
	import { type Ref, inject, onMounted, ref, toRaw, watch } from 'vue'
	import type { FileEntry, ListDirectory } from '../../src/types'
	import FloatInputText from './FloatInputText.vue'
	import IconButton from './IconButton.vue'
	import TextButton from './TextButton.vue'
	import type { FilePickerData } from './dialog'

	interface NewFolderDialog {
		showDialog: boolean
		name: string
	}

	const entries = ref<FileEntry[]>([])
	const selected = ref<FileEntry>()
	const dialog = inject<Ref<DynamicDialogInstance>>('dialogRef')
	const currentPath = ref('')
	const breadcrumb = ref<MenuItem[]>([])
	const data = ref<FilePickerData>()
	const newFolder = ref<NewFolderDialog>({ showDialog: false, name: '' })

	const result = ref<string[]>([])

	async function open(path: string) {
		const req: ListDirectory = { filter: data.value?.filter, path, directoryOnly: data.value?.mode === 'openDirectory' }
		const fs = await listDirectory(req)

		if (fs) {
			currentPath.value = fs.path
			entries.value = fs.entries

			breadcrumb.value = []

			for (const item of fs.tree) {
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

			if (breadcrumb.value.length >= 4) {
				breadcrumb.value[breadcrumb.value.length - 2].label = '...'
				breadcrumb.value.splice(2, breadcrumb.value.length - 4)
			}
		}
	}

	async function createFolder() {
		const path = await createDirectory({ name: newFolder.value.name.trim(), path: currentPath.value })

		if (path) {
			newFolder.value.showDialog = false
			refresh()
		}
	}

	function browseDirectory(entry: FileEntry, event: Event) {
		event.stopImmediatePropagation()
		open(entry.path)
	}

	function refresh() {
		return open(data.value!.path!)
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
		return refresh()
	})
</script>

<template>
	<div class="flex flex-col gap-2">
		<div
			v-if="breadcrumb.length"
			class="flex flex-row items-center justify-between gap-2">
			<Breadcrumb :model="breadcrumb" />
			<IconButton
				icon="folder-plus"
				v-tooltip.bottom="'New folder'"
				@click="newFolder.showDialog = true" />
			<IconButton
				icon="refresh"
				v-tooltip.bottom="'Refresh'"
				severity="info"
				@click="refresh()" />
		</div>
		<Listbox
			v-model="selected"
			:options="entries"
			class="w-full"
			list-style="max-height: 250px"
			data-key="name"
			filter
			:filter-fields="['name']"
			filter-placeholder="Filter"
			empty-message="Empty directory">
			<template #option="item">
				<div class="flex w-full flex-row items-center justify-between gap-2">
					<div class="flex flex-row items-center gap-2">
						<i
							class="mdi"
							:class="{ 'mdi-file': !item.option.directory, 'mdi-folder': item.option.directory }" />
						<div class="text-sm font-bold">{{ item.option.name }}</div>
					</div>
					<div
						v-if="item.option.directory"
						class="flex flex-row items-center">
						<IconButton
							icon="folder-open"
							@click="browseDirectory(item.option, $event)"
							v-tooltip.bottom="'Browse'" />
					</div>
					<div
						v-else
						class="flex flex-col items-end justify-center gap-1">
						<span class="text-xs">{{ item.option.size }} B</span>
						<span class="text-xs">{{ formatDateTime(item.option.updatedAt) }}</span>
					</div>
				</div>
			</template>
		</Listbox>
		<div class="flex flex-row items-center justify-end">
			<TextButton
				icon="check"
				label="Choose"
				:disabled="!result.length"
				:badge="result.length.toFixed(0)"
				@click="choose()" />
		</div>

		<Dialog
			modal
			v-model:visible="newFolder.showDialog"
			header="New Folder"
			:style="{ width: '18rem', maxWidth: '95vw' }">
			<div class="mt-2 grid grid-cols-12 gap-3">
				<div class="col-span-full">
					<FloatInputText
						label="Name"
						maxlength="32"
						v-model="newFolder.name" />
				</div>
				<div class="col-span-full flex justify-end gap-2">
					<TextButton
						label="Create"
						icon="check"
						:disabled="!newFolder.name.trim()"
						@click="createFolder()" />
				</div>
			</div>
		</Dialog>
	</div>
</template>
