<script setup lang="ts">
	import type { TextButtonProps } from '@/shared/types'

	defineProps<TextButtonProps>()
</script>

<template>
	<Button
		:text="true"
		size="small"
		:icon="`mdi mdi-${icon}`"
		v-bind="$attrs" />
</template>
