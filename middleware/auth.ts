import { isValidJwt } from '@/services/jwt'

const LOGIN_PATH = '/'

export default defineNuxtRouteMiddleware(() => {
  const accessToken = localStorage.getItem('accessToken')
  if (!accessToken) {
    return navigateTo(LOGIN_PATH)
  }
  const isValid = isValidJwt(accessToken)
  if (!isValid) {
    return navigateTo(LOGIN_PATH)
  }
})
