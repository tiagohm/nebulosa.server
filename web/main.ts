import '@/assets/main.css'

import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import { createApp } from 'vue'
import App from './App.vue'
import { AppTheme } from './theme'

const app = createApp(App)

app.use(PrimeVue, {
	ripple: false,
	theme: {
		preset: AppTheme,
		options: {
			darkModeSelector: '.dark-mode',
			inputVariant: 'filled',
			cssLayer: {
				name: 'primevue',
				order: 'theme, base, primevue, utilities',
			},
		},
	},
})

app.use(ToastService)
app.use(createPinia())

app.directive('tooltip', Tooltip)

app.mount('#app')
