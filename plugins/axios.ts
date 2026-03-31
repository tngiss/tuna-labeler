import { defineNuxtPlugin } from '#app'
import axios from 'axios'
import { isValidJwt } from '@/services/jwt'

export default defineNuxtPlugin(() => {
  axios.defaults.baseURL = 'https://dev-api-pvelad3fuq-an.a.run.app'
  const accessToken = localStorage.getItem('accessToken')
  axios.defaults.headers.common.Authorization = `bearer ${accessToken}`
  axios.interceptors.response.use(
    response => Promise.resolve(response),
    (error) => {
      if (error.response.status === 401) {
        const accessToken = localStorage.getItem('accessToken') ?? ''
        const isValid = isValidJwt(accessToken)
        if (!isValid) {
          localStorage.removeItem('accessToken')
          navigateTo('/')
        } else {
          window.location.reload()
        }
      }
      return Promise.reject(error)
    }
  )
})
