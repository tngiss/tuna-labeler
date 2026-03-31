import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    alerts: [],
    auth: {
      accessToken: null,
      refreshToken: null
    },
    dialog: {
      state: false,
      title: '',
      color: '',
      width: null,
      component: ''
    },
    selectedLabel: {}
  })
})
