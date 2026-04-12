import http from './http'

export interface SystemConfig {
  noticeText: string
  servicePhone: string
  serviceWechat: string
  serviceHours: string
  serviceTerms: string
  recommendMenus: RecommendMenuItem[]
}

export interface RecommendMenuItem {
  name: string
  value: string
  icon: string
  iconColor: string
  bg: string
  color: string
  enabled: boolean
  sort: number
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
