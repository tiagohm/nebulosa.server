<script setup
        lang="ts">
        import type { MenuItemProps } from './types'

        defineProps<MenuItemProps>()
</script>

<template>
    <a class="flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-md p-1"
       :class="{ 'bg-green-800': item.selected && !item.disabled }"
       v-bind="props.action">
        <div class="flex items-center justify-between gap-2">
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
        </div>
        <Checkbox v-if="item.checkable"
                  v-model="item.checked"
                  @update:model-value="value => item.check?.(value, item)"
                  size="small"
                  variant="filled"
                  binary />
        <i v-if="item.items?.length"
           class="mdi mdi-menu-right" />
    </a>
</template>
