import '@/assets/main.css'

import App from '@/App.vue'
import { AppTheme } from '@/theme'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import DialogService from 'primevue/dialogservice'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import { createApp } from 'vue'

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
app.use(DialogService)
app.use(createPinia())

app.directive('tooltip', Tooltip)

app.mount('#app')
