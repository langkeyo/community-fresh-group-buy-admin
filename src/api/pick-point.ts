import http from './http'

export interface PickPointItem {
  id: number
  name: string
  address: string
}

interface Result<T> {
  code: number
  message: string
  data: T
}

export const getPickPointListApi = async (keyword?: string) => {
  const { data } = await http.get<Result<PickPointItem[]>>('/api/pick-point/list', {
    params: keyword ? { keyword } : undefined
  })
  return data
}
