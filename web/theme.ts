import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import type { AuraBaseDesignTokens } from '@primeuix/themes/aura/base'
import type { Preset } from '@primeuix/themes/types'

export const AppTheme = definePreset(Aura, {
	semantic: {
		primary: {
			50: '{indigo.50}',
			100: '{indigo.100}',
			200: '{indigo.200}',
			300: '{indigo.300}',
			400: '{indigo.400}',
			500: '{indigo.500}',
			600: '{indigo.600}',
			700: '{indigo.700}',
			800: '{indigo.800}',
			900: '{indigo.900}',
			950: '{indigo.950}',
		},
		colorScheme: {
			dark: {
				surface: {
					0: '#fdfdfd',
					50: '{zinc.50}',
					100: '{zinc.100}',
					200: '{zinc.200}',
					300: '{zinc.300}',
					400: '{zinc.400}',
					500: '#343438',
					600: '#252529',
					700: '#222226',
					800: '#202024',
					900: '#191922',
					950: '#141418',
				},
				primary: {
					color: '{primary.500}',
					inverseColor: '{primary.950}',
					hoverColor: '{primary.400}',
					activeColor: '{primary.500}',
				},
				highlight: {
					background: 'rgba(250, 250, 250, .16)',
					focusBackground: 'rgba(250, 250, 250, .24)',
					color: 'rgba(255,255,255,.87)',
					focusColor: 'rgba(255,255,255,.87)',
				},
				formField: {
					filledBorderColor: 'transparent',
					disabledBackground: 'transparent',
					background: '{surface.800}',
					shadow: 'none',
					borderColor: 'transparent',
				},
				overlay: {
					modal: {
						borderColor: 'transparent',
					},
				},
				content: {
					background: '{surface.900}',
				},
				navigation: {
					list: {
						padding: '0.5rem 0.5rem',
					},
					item: {
						icon: {
							color: '{surface.400}',
						},
					},
				},
			},
		},
	},
	components: {
		button: {
			text: {
				success: {
					color: '{green.500}',
				},
				info: {
					color: '{blue.500}',
				},
				danger: {
					color: '{red.500}',
				},
				warn: {
					color: '{orange.500}',
				},
			},
		},
		select: {
			root: {
				background: '{surface.800}',
				borderColor: 'transparent',
				hoverBorderColor: '{surface.800}',
				focusBorderColor: '{surface.800}',
				disabledBackground: 'transparent',
			},
			overlay: {
				background: '{surface.800}',
				borderColor: 'transparent',
			},
			option: {
				focusBackground: '{surface.500}',
				selectedBackground: '{surface.600}',
				selectedFocusBackground: '{surface.600}',
			},
		},
		floatlabel: {
			on: {
				active: {
					background: '{surface.800}',
					padding: '0.125rem 0.25rem',
				},
			},
		},
		togglebutton: {
			root: {
				background: '{surface.900}',
				hoverBackground: '{surface.900}',
				borderColor: '{surface.900}',
				checkedBackground: '{surface.800}',
				checkedBorderColor: '{surface.800}',
			},
			content: {
				checkedBackground: '{surface.800}',
			},
		},
		menu: {
			root: {
				background: '{surface.700}',
				borderColor: 'transparent',
			},
			list: {
				padding: '0.675rem 0.825rem',
			},
			item: {
				focusBackground: '{surface.500}',
				padding: '0.675rem 0.825rem',
			},
		},
		listbox: {
			root: {
				borderColor: 'transparent',
				background: '{surface.800}',
			},
			option: {
				focusBackground: '{surface.500}',
				selectedBackground: '{surface.600}',
				selectedFocusBackground: '{surface.600}',
			},
		},
		tabs: {
			tablist: {
				borderColor: 'transparent',
			},
			tabpanel: {
				padding: '0',
			},
		},
		slider: {
			handle: {
				background: '{indigo.700}',
				contentBackground: '{indigo.800}',
				content: {
					hoverBackground: '{indigo.800}',
				},
			},
		},
		dialog: {
			title: {
				fontSize: '1rem',
			},
		},
		multiselect: {
			root: {
				focusBorderColor: '{surface.800}',
				hoverBorderColor: '{surface.800}',
			},
		},
		chip: {
			root: {
				background: '{surface.700}',
			},
			removeIcon: {
				color: '{red.500}',
			},
		},
		checkbox: {
			root: {
				filledBackground: '{surface.600}',
			},
		},
		tag: {
			root: {
				padding: '0.1rem 0.5rem',
			},
		},
		toast: {
			colorScheme: {
                dark: {
                    success: {
                        borderColor: 'transparent',
                    },
                    info: {
                        borderColor: 'transparent',
                    },
                    warn: {
                        borderColor: 'transparent',
                    },
                    error: {
                        borderColor: 'transparent',
                    },
                }
            }
		},
	},
} as Preset<AuraBaseDesignTokens>)
