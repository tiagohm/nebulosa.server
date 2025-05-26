<script setup lang="ts">
	import type { IconButtonProps } from '@/shared/types'

	defineProps<IconButtonProps>()
</script>

<template>
	<Button
		:text="true"
		:rounded="true"
		v-bind="$attrs">
		<i :class="`mdi mdi-${icon}`" />
	</Button>
</template>
