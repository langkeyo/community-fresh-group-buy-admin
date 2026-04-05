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

export const getProductListApi = async (keyword?: string) => {
  const { data } = await http.get<Result<ProductItem[]>>('/api/product/list', {
    params: { keyword }
  })
  return data
}
