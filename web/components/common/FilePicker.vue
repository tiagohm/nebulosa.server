<script setup lang="ts">
	import FloatInputText from '@/components/ui/FloatInputText.vue'
	import IconButton from '@/components/ui/IconButton.vue'
	import TextButton from '@/components/ui/TextButton.vue'
	import { createDirectory, listDirectory } from '@/shared/api'
	import type { FilePickerData } from '@/shared/types'
	import { formatDateTime } from '@/shared/utils'
	import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions'
	import type { MenuItem } from 'primevue/menuitem'
	import { type Ref, inject, onMounted, ref, toRaw } from 'vue'
	import type { FileEntry } from '../../src/types'

	const dialog = inject<Ref<DynamicDialogInstance>>('dialogRef')!
	const data = ref<FilePickerData>()
	const breadcrumb = ref<MenuItem[]>([])
	const history = ref<string[]>([])
	const entries = ref<FileEntry[]>([])
	const filteredEntries = ref<FileEntry[]>([])
	const filterText = ref('')
	const currentPath = ref('')
	const createFolderDialog = ref({ show: false, name: '' })
	const result = ref<string[]>([])

	async function open(path?: string) {
		const directory = await listDirectory({ filter: data.value?.filter, path, directoryOnly: data.value?.mode === 'openDirectory' })

		if (directory) {
			currentPath.value = directory.path
			entries.value = directory.entries
			filterDirectory()
			breadcrumb.value = []

			for (const item of directory.tree) {
				breadcrumb.value.push({
					icon: item.name ? undefined : 'mdi mdi-home',
					label: item.name,
					command: () => {
						if (item.path !== path) {
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

	function filterDirectory() {
		const text = filterText.value.trim().toLowerCase()

		if (text) {
			filteredEntries.value = entries.value.filter(({ name }) => name.toLowerCase().includes(text))
		} else {
			filteredEntries.value = entries.value
		}
	}

	async function createFolder() {
		const path = await createDirectory({ name: createFolderDialog.value.name.trim(), path: currentPath.value })

		if (path) {
			createFolderDialog.value.show = false
			refresh()
		}
	}

	function browseDirectory(entry: FileEntry, event?: Event) {
		event?.stopImmediatePropagation()
		if (currentPath.value) history.value.push(currentPath.value)
		return open(entry.path)
	}

	function backDirectory() {
		if (history.value.length) {
			const entry = history.value.pop()

			if (entry) {
				open(entry)
			}
		}
	}

	function selectEntry(entry: FileEntry) {
		if (data.value) {
			if (data.value.mode === 'openFile' && entry.directory) {
				browseDirectory(entry)
				return
			}

			if (data.value.multiple && data.value.mode !== 'save') {
				const path = entry.path

				if (path) {
					const index = result.value.indexOf(path)

					if (index >= 0) {
						result.value.splice(index, 1)
					} else {
						result.value.push(path)
					}
				}
			} else if (result.value[0] !== entry.path) {
				result.value[0] = entry.path
			} else {
				result.value.splice(0, 1)
			}
		}

		console.log(entry.path, result.value)
	}

	function refresh() {
		return open(data.value?.path)
	}

	function choose() {
		dialog?.value.close(toRaw(result.value))
	}

	onMounted(() => {
		data.value = dialog.value.data ?? {}
		return refresh()
	})
</script>

<template>
	<div class="flex flex-col gap-2">
		<div
			v-if="breadcrumb.length"
			class="flex flex-row items-center justify-between gap-2">
			<IconButton
				icon="arrow-left"
				:disabled="!history.length"
				v-tooltip.bottom="'Back'"
				@click="backDirectory()" />
			<Breadcrumb :model="breadcrumb" />
			<IconButton
				icon="folder-plus"
				v-tooltip.bottom="'New folder'"
				@click="createFolderDialog.show = true" />
			<IconButton
				icon="refresh"
				v-tooltip.bottom="'Refresh'"
				severity="info"
				@click="refresh()" />
		</div>

		<FloatInputText
			label="Filter"
			v-model="filterText"
			@keyup="filterDirectory()" />

		<VirtualScroller
			:items="filteredEntries"
			:itemSize="50"
			class="bg-surface-800 w-full rounded-md"
			style="height: 200px">
			<template v-slot:item="{ item, options }">
				<div
					class="hover:bg-surface-600 mx-2 my-1 flex cursor-pointer flex-row items-center justify-between gap-2 rounded-md p-2 text-sm"
					:class="{ '!bg-surface-500': result.includes(item.path) }"
					style="height: 50px"
					@click="selectEntry(item)">
					<div class="flex flex-row items-center gap-2">
						<i
							class="mdi"
							:class="{ 'mdi-file': !item.directory, 'mdi-folder': item.directory }" />
						<div class="text-sm font-bold">{{ item.name }}</div>
					</div>
					<div
						v-if="item.directory"
						class="flex flex-row items-center">
						<IconButton
							v-if="data!.mode !== 'openFile'"
							icon="folder-open"
							@click="browseDirectory(item, $event)"
							v-tooltip.bottom="'Browse'" />
					</div>
					<div
						v-else
						class="flex flex-col items-end justify-center gap-1">
						<span class="text-xs">{{ item.size }} B</span>
						<span class="text-xs">{{ formatDateTime(item.updatedAt) }}</span>
					</div>
				</div>
			</template>
		</VirtualScroller>

		<div class="mt-2 flex flex-row items-center justify-end">
			<TextButton
				icon="check"
				label="Choose"
				severity="success"
				:disabled="!result.length"
				:badge="result.length.toFixed(0)"
				@click="choose()" />
		</div>

		<Dialog
			modal
			v-model:visible="createFolderDialog.show"
			header="New Folder"
			:style="{ width: '18rem', maxWidth: '95vw' }">
			<div class="mt-2 grid grid-cols-12 gap-3">
				<div class="col-span-full">
					<FloatInputText
						label="Name"
						maxlength="32"
						v-model="createFolderDialog.name" />
				</div>
				<div class="col-span-full flex justify-end gap-2">
					<TextButton
						label="Create"
						icon="check"
						:disabled="!createFolderDialog.name.trim()"
						@click="createFolder()" />
				</div>
			</div>
		</Dialog>
	</div>
</template>
