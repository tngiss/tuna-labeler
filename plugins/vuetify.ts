import 'material-design-icons-iconfont/dist/material-design-icons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { ja } from 'vuetify/locale'
import { aliases, md } from 'vuetify/iconsets/md'

const customTheme = {
  dark: true,
  colors: {
    primary: '#E53872',
    greyButton: '#6E6761'
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'customTheme',
      themes: {
        customTheme
      }
    },
    locale: {
      locale: 'ja',
      messages: { ja }
    },
    icons: {
      defaultSet: 'md',
      aliases,
      sets: {
        md
      }
    },
    ssr: false,
    components: {
      ...components
    },
    directives
  })
  nuxtApp.vueApp.use(vuetify)
})
