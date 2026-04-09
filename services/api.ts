import axios from 'axios'

type LoginData = {
  email: string;
  password: string;
};

export function login (userData: LoginData) {
  return axios.post(
    `/auth/login?email=${userData.email}&password=${userData.password}`
  )
}

export function rankList () {
  return axios.post('/label/ranks/list')
}

export function rankCreate (userData: object) {
  return axios.post('/label/ranks/create', userData)
}

export function getRanks (id: number) {
  return axios.get(`/label/ranks/${id}`)
}

export function editRank (id: number, userData: object) {
  return axios.put(`/label/ranks/${id}/edit`, userData)
}

export function deleteRank (id: number) {
  return axios.delete(`/label/ranks/${id}/delete`)
}

export function labelCreate (userData: FormData) {
  return axios.post('/label/create', userData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function labelList (page: number) {
  return axios.post('/label/list', {
    num_per_page: 'all',
    page,
    date_start: '2024-11-01',
    date_end: '2025-11-30'
  })
}

export function deleteByDate (dates: Array<string>) {
  return axios.delete('/label/delete/by_date', {
    data: {
      dates
    }
  })
}

export function deleteById (ids: Array<number>) {
  return axios.delete('/label/delete/by_id', {
    data: {
      ids
    }
  })
}

export function labelListByDate (date: string, page: number) {
  return axios.post('/label/list/by_date', {
    num_per_page: 'all',
    page,
    date
  })
}
