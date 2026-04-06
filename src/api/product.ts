import http from './http'

interface Result<T> {
  code: number
  message: string
  data: T
}

export interface ProductItem {
  id: number
  name: string
  category: string
  price: number | string
  groupPrice2?: number | string | null
  groupPrice3?: number | string | null
  stock?: number | string
  images?: string
  status?: number | string
}

export interface ProductPayload {
  name: string
  category: string
  price: number
  groupPrice2: number | null
  groupPrice3: number | null
  stock: number
  images: string
  status: number
}

export const getProductListApi = async (keyword?: string, status?: number) => {
  const { data } = await http.get<Result<ProductItem[]>>('/api/product/admin/list', {
    params: { keyword, status }
  })
  return data
}

export const createProductApi = async (payload: ProductPayload) => {
  const { data } = await http.post<Result<string>>('/api/product/admin/create', payload)
  return data
}

export const updateProductApi = async (id: number, payload: ProductPayload) => {
  const { data } = await http.put<Result<string>>(`/api/product/admin/update/${id}`, payload)
  return data
}

export const updateProductStatusApi = async (id: number, status: number) => {
  const { data } = await http.put<Result<string>>(`/api/product/admin/status/${id}`, null, {
    params: { status }
  })
  return data
}

export const updateProductStockApi = async (id: number, stock: number) => {
  const { data } = await http.put<Result<string>>(`/api/product/admin/stock/${id}`, null, {
    params: { stock }
  })
  return data
}
