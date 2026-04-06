import http from './http'

export interface SystemConfig {
  noticeText: string
  servicePhone: string
  serviceWechat: string
  serviceHours: string
  serviceTerms: string
}

interface Result<T> {
  code: number
  message: string
  data: T
}

export const getSystemConfigApi = async () => {
  const { data } = await http.get<Result<SystemConfig>>('/api/system/config')
  return data
}

export const saveSystemConfigApi = async (payload: SystemConfig) => {
  const { data } = await http.put<Result<string>>('/api/system/config', payload)
  return data
}
