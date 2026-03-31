export function isValidJwt (jwt: string) {
  if (!jwt || typeof jwt !== 'string') {
    return false
  }
  const [, payload] = jwt.split('.')
  if (!payload) {
    return false
  }
  try {
    const data = JSON.parse(atob(payload))
    const exp = new Date(data.exp * 1000)
    const now = new Date()
    return now < exp
  } catch (e) {
    return false
  }
}
