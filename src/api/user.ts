import http from '@/api/http'

interface Result<T> {
  code: number
  message: string
  data: T
}

export interface LoginResult {
  token: string
  userInfo?: {
    id: number
    nickname?: string
  }
}

export interface AdminUserItem {
  id: number
  nickname?: string
  phone?: string
  createTime?: string
}

export const loginApi = async (code: string) => {
  const { data } = await http.post<Result<LoginResult>>(
    '/api/user/login',
    null,
    {
      params: { code }
    }
  )
  return data
}

export const devLoginApi = async (code: string) => {
  const { data } = await http.post<Result<LoginResult>>(
    '/api/user/dev-login',
    null,
    {
      params: { code }
    }
  )
  return data
}

export const getUserListApi = async () => {
  const { data } = await http.get<Result<AdminUserItem[]>>('/api/user/list')
  return data
}
