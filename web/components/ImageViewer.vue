<script setup
        lang="ts">
        import { openImage } from '@/shared/api'
        import { PanZoom, type PanZoomOptions } from '@/shared/pan-zoom'
        import { useStorage } from '@vueuse/core'
        import { ref, useTemplateRef } from 'vue'
        import { type Camera, DEFAULT_IMAGE_TRANSFORMATION, type ImageInfo } from '../../src/types'
        import MenuItem from './MenuItem.vue'
        import { type ExtendedMenuItem, type ImageViewerProps, SEPARATOR_MENU_ITEM } from './types'

        defineProps<ImageViewerProps>()

        interface LoadedImage {
            readonly image: HTMLImageElement
            info: ImageInfo
            readonly wrapper: HTMLDivElement
            readonly owner: HTMLElement
            readonly camera?: Camera
            panZoom?: PanZoom
        }

        const wrapper = useTemplateRef('wrapper')
        const images = new Map<string, LoadedImage>()
        const transformation = useStorage('image.transformation', structuredClone(DEFAULT_IMAGE_TRANSFORMATION))

        const contextMenu = useTemplateRef('contextMenu')
        const contextMenuItems = ref<ExtendedMenuItem[]>([
            {
                label: 'Save as...',
                icon: 'mdi mdi-content-save',
                command: () => {
                    // this.saveAs.subFrame.width ||= this.imageInfo?.width ?? 0
                    // this.saveAs.subFrame.height ||= this.imageInfo?.height ?? 0
                    // this.saveAs.showDialog = true
                },
            },
            SEPARATOR_MENU_ITEM,
            {
                label: 'Plate Solve',
                icon: 'mdi mdi-sigma',
                command: () => {
                    // this.solver.showDialog = true
                },
            },
            SEPARATOR_MENU_ITEM,
            {
                label: 'Stretch',
                icon: 'mdi mdi-chart-histogram',
                command: () => {
                    // this.stretch.showDialog = true
                },
            },
            {
                label: 'Auto stretch',
                icon: 'mdi mdi-auto-fix',
                selected: true,
                command: () => {
                    // return this.toggleStretch()
                },
            },
            {
                label: 'SCNR',
                icon: 'mdi mdi-palette',
                disabled: true,
                command: () => {
                    // this.scnr.showDialog = true
                },
            },
            {
                label: 'Debayer',
                icon: 'mdi mdi-collage',
                command: () => {
                    // this.transformation.debayer = !this.transformation.debayer
                    // this.debayerMenuItem.selected = this.transformation.debayer
                    // this.savePreference()
                    // return this.loadImage()
                },
            },
            {
                label: 'Transformation',
                icon: 'mdi mdi-image-edit',
                items: [
                    {
                        label: 'Adjustment',
                        icon: 'mdi mdi-palette',
                        command: () => {
                            // this.adjustment.showDialog = true
                        },
                    },
                    {
                        label: 'Horizontal mirror',
                        icon: 'mdi mdi-flip-horizontal',
                        command: () => {
                            // this.transformation.mirrorHorizontal = !this.transformation.mirrorHorizontal
                            // this.horizontalMirrorMenuItem.selected = this.transformation.mirrorHorizontal
                            // this.savePreference()
                            // return this.loadImage()
                        },
                    },
                    {
                        label: 'Vertical mirror',
                        icon: 'mdi mdi-flip-vertical',
                        command: () => {
                            // this.transformation.mirrorVertical = !this.transformation.mirrorVertical
                            // this.verticalMirrorMenuItem.selected = this.transformation.mirrorVertical
                            // this.savePreference()
                            // return this.loadImage()
                        },
                    },
                    {
                        label: 'Invert',
                        icon: 'mdi mdi-invert-colors',
                        command: () => {
                            // return this.invertImage()
                        },
                    },
                    {
                        label: 'Rotate',
                        icon: 'mdi mdi-rotate-right',
                        command: () => {
                            // this.rotation.showDialog = true
                        },
                    },
                ],
            },
            SEPARATOR_MENU_ITEM,
            {
                label: 'Overlay',
                icon: 'mdi mdi-layers',
                items: [
                    {
                        label: 'Crosshair',
                        icon: 'mdi mdi-bullseye',
                        command: () => {
                            // this.toggleCrosshair()
                        },
                    },
                    {
                        label: 'Annotate',
                        icon: 'mdi mdi-marker',
                        disabled: true,
                        command: () => {
                            // this.annotation.showDialog = true
                        },
                        // check: (event) => {
                        // 	this.annotation.visible = !!event.checked
                        // },
                    },
                    {
                        label: 'Detect stars',
                        icon: 'mdi mdi-creation',
                        disabled: false,
                        checkable: false,
                        command: () => {
                            // this.starDetector.showDialog = true
                        },
                        // check: (event) => {
                        // 	this.starDetector.visible = !!event.checked
                        // },
                    },
                    {
                        label: 'ROI',
                        icon: 'mdi mdi-select',
                        command: () => {
                            // this.toggleROI()
                        },
                    },
                    {
                        label: 'Field of View',
                        icon: 'mdi mdi-camera-metering-spot',
                        command: () => {
                            // this.fov.showDialog = !this.fov.showDialog

                            // if (this.fov.showDialog) {
                            // 	this.fov.fovs.forEach((e) => this.computeFOV(e))
                            // }
                        },
                    },
                ],
            },
            {
                icon: 'mdi mdi-chart-histogram',
                label: 'Statistics',
                command: () => {
                    // this.statistics.showDialog = true
                    // return this.computeStatistics()
                },
            },
            {
                icon: 'mdi mdi-list-box',
                label: 'FITS Header',
                command: () => {
                    // this.headers.showDialog = true
                },
            },
            SEPARATOR_MENU_ITEM,
            {
                label: 'Point mount here',
                icon: 'mdi mdi-telescope',
                disabled: true,
                command: () => {
                    // const path = this.imagePath

                    // if (path) {
                    //     void this.executeMount((mount) => {
                    //         return this.api.pointMountHere(mount, path, this.mouseMountCoordinate)
                    //     })
                    // }
                },
            },
            {
                label: 'Frame at this coordinate',
                icon: 'mdi mdi-image',
                disabled: true,
                command: () => {
                    // const coordinate = this.mouseCoordinate.interpolator?.interpolate(this.mouseMountCoordinate.x, this.mouseMountCoordinate.y, false, false)

                    // if (coordinate) {
                    // 	void this.frame(coordinate)
                    // }
                },
            },
        ])

        function imageLoaded(image: LoadedImage) {
            URL.revokeObjectURL(image.image.src)

            if (!image.panZoom && image.wrapper && image.owner) {
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

                image.panZoom = new PanZoom(image.wrapper, options)

                image.wrapper.addEventListener('wheel', (e) => {
                    if (e.shiftKey) {
                        // this.rotateWithWheel(e)
                    } else if (!e.target || e.target === image.owner || e.target === image.wrapper || e.target === image.image /*|| e.target === this.roi().nativeElement*/ || (e.target as HTMLElement).tagName === 'circle') {
                        image.panZoom?.zoomWithWheel(e)
                    }
                })

                setTimeout(() => {
                    // this.resetZoom(true)
                })
            }
        }

        function imageClicked(image: LoadedImage) {
            if (image.owner.lastChild !== image.wrapper) {
                const wrapper = image.owner.removeChild(image.wrapper)
                image.owner.appendChild(wrapper)
            }
        }

        async function open(path: string, camera?: Camera) {
            const image = await openImage({ path, camera: camera?.id, transformation: transformation.value })

            if (image) {
                const { blob, info } = image
                const key = camera?.id || path
                let item = images.get(key)

                if (item) {
                    item.info = info
                } else {
                    const div = document.createElement('div')
                    div.classList.add('inline-block', 'absolute')
                    div.style.backfaceVisibility = 'hidden'

                    const image = document.createElement('img')
                    item = { image, info, wrapper: div, owner: wrapper.value! }
                    image.onload = () => imageLoaded(item!)
                    image.oncontextmenu = (e) => contextMenu.value?.show(e)
                    image.onpointerdown = () => imageClicked(item!)
                    image.classList.add('select-none', 'shadow-md')

                    div.appendChild(image)
                    item.owner.appendChild(div)

                    images.set(key, item)
                }

                item.image.src = URL.createObjectURL(blob)
            }
        }

        defineExpose({ open })
</script>

<template>
    <div class="w-full h-full relative"
         ref="wrapper">

    </div>

    <ContextMenu ref="contextMenu"
                 :model="contextMenuItems"
                 breakpoint="9999px">
        <template #item="{ item, props }">
            <MenuItem :item="item"
                      :props="props" />
        </template>
    </ContextMenu>
</template>
