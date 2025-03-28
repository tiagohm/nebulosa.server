<script setup
        lang="ts">
        import { PanZoom, type PanZoomOptions } from '@/shared/pan-zoom'
        import { useTemplateRef } from 'vue'
        import type { ImageViewerProps } from './types'

        defineProps<ImageViewerProps>()

        const image = useTemplateRef('image')
        let panZoom: PanZoom | undefined

        function imageLoaded() {
            const wrapper = image.value!.parentElement
            const owner = wrapper?.parentElement

            // URL.revokeObjectURL(image.src)

            if (!panZoom && wrapper && owner) {
                const options: Partial<PanZoomOptions> = {
                    maxScale: 500,
                    canExclude: (e) => {
                        return !!e.tagName && (e.classList.contains('roi') || e.classList.contains('moveable-control'))
                    },
                    on: (event, detail) => {
                        if (event === 'panzoomzoom') {
                            // this.zoom.scale = detail.transformation.scale
                        }
                    }
                }

                panZoom = new PanZoom(wrapper, options)

                wrapper.addEventListener('wheel', (e) => {
                    if (e.shiftKey) {
                        // this.rotateWithWheel(e)
                    } else if (e.target === owner || e.target === wrapper || e.target === image.value /*|| e.target === this.roi().nativeElement*/ || (e.target as HTMLElement).tagName === 'circle') {
                        panZoom?.zoomWithWheel(e)
                    }
                })

                setTimeout(() => {
                    // this.resetZoom(true)
                })
            }
        }

        defineExpose({ imageLoaded })
</script>

<template>
    <div class="w-full h-full">
        <div class="inline-block"
             style="backface-visibility: hidden">
            <img ref="image"
                 class="select-none"
                 :src="src"
                 @load="imageLoaded()" />
        </div>
    </div>
</template>
