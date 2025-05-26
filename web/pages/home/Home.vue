<script setup lang="ts">
	import ConnectionBox from '@/components/connection/ConnectionBox.vue'
	import ImageViewer from '@/components/image/ImageViewer.vue'
	import FloatInputNumber from '@/components/ui/FloatInputNumber.vue'
	import FloatInputText from '@/components/ui/FloatInputText.vue'
	import IconButton from '@/components/ui/IconButton.vue'
	import TextButton from '@/components/ui/TextButton.vue'
	import * as api from '@/shared/api'
	import { filePicker } from '@/shared/dialog'
	import { useConnectionStore } from '@/stores/connection.store'
	import { useStorage } from '@vueuse/core'
	import { useDialog } from 'primevue/usedialog'
	import { onMounted, useTemplateRef } from 'vue'

	const connection = useConnectionStore()
	const menuPopover = useTemplateRef('menuPopover')
	const imageViewer = useTemplateRef('imageViewer')
	const dialog = useDialog()

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

	const imageOpenPath = useStorage('image.open.path', '')

	async function openImage() {
		const paths = await filePicker(dialog, { props: { header: 'Open Image' }, data: { path: imageOpenPath.value, filter: '*.{fits,fit,xisf}', mode: 'openFile' } })

		if (paths?.length) {
			imageOpenPath.value = paths[0]
			imageViewer.value?.open(paths[0])
		}
	}

	onMounted(() => {
		chooseActiveConnection()
	})
</script>

<template>
	<Toast position="bottom-center" />
	<DynamicDialog />

	<!-- Toolbar -->

	<div class="relative z-[1] flex w-full flex-row items-center justify-between gap-3 bg-[#101010] p-2">
		<ConnectionBox />

		<!-- Left Menu -->

		<IconButton
			icon="menu"
			@click="menuPopover?.toggle($event)"
			size="large"
			v-tooltip.bottom="'Menu'" />

		<IconButton
			icon="image-plus"
			@click="openImage()"
			size="large"
			v-tooltip.bottom="'Open image'" />

		<Popover ref="menuPopover">
			<div class="grid grid-cols-6">
				<Button
					v-for="item in menuPopoverItems"
					v-tooltip.bottom="item.title"
					:text="true"
					:key="item.title">
					<img
						:src="item.icon"
						width="28" />
				</Button>
			</div>
		</Popover>

		<div class="flex flex-1 flex-row items-center justify-between gap-3">
			<!-- Title -->

			<div class="flex h-full min-h-[37px] flex-1 flex-row items-center justify-center select-none">
				<span class="font-bold">Nebulosa</span>
			</div>

			<!-- Right Menu -->
		</div>
	</div>

	<!-- Content -->

	<ImageViewer ref="imageViewer" />

	<!-- Connection Dialog -->

	<Dialog
		modal
		v-model:visible="connection.showDialog"
		header="Connection"
		:style="{ width: '18rem', maxWidth: '95vw' }">
		<div class="mt-2 grid grid-cols-12 gap-3">
			<div class="col-span-full">
				<FloatInputText
					label="Name"
					maxlength="32"
					v-model="connection.edited!.name" />
			</div>
			<div class="col-span-7">
				<FloatInputText
					label="Host"
					maxlength="48"
					v-model="connection.edited!.host" />
			</div>
			<div class="col-span-5">
				<FloatInputNumber
					label="Port"
					:min="80"
					:max="65535"
					v-model="connection.edited!.port" />
			</div>
			<div class="col-span-full flex justify-end gap-2">
				<TextButton
					label="Save"
					icon="content-save"
					:disabled="!connection.edited?.host || !connection.edited?.name"
					@click="connection.save()" />
			</div>
		</div>
	</Dialog>
</template>

<style scoped></style>
