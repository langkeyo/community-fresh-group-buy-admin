import http from './http'

export interface OrderItem {
  id: string
  no: string
  name: string
  qty: number
  price: string
  pickPointName: string
  pickPointAddress: string
  status: number
  createTime: string
}

interface Result<T> {
  code: number
  message: string
  data: T
}

export interface GetOrderListParams {
  status?: number
  pickPointId?: number
  startTime?: string
  endTime?: string
}

export const getOrderListApi = async (params?: GetOrderListParams) => {
  const { data } = await http.get<Result<OrderItem[]>>('/api/order/list/all', {
    params
  })
  return data
}

export const getOrderDetailApi = async (orderId: string) => {
  const { data } = await http.get<Result<OrderItem>>(`/api/order/${orderId}`)
  return data
}

export const updateOrderStatusApi = async (orderId: string, status: number) => {
  const { data } = await http.put<Result<string>>(
    `/api/order/updateStatus/${orderId}?status=${status}`
  )
  return data
}
