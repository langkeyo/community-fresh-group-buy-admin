import http from '@/api/http'

interface Result<T> {
  code: number
  message: string
  data: T
}

export interface AiReviewItem {
  id: number
  queryText: string
  source: string
  recipeJson: string
  status: string
  reviewer?: string
  reviewRemark?: string
  createdAt: string
  reviewedAt: string
}

export const getAiReviewListApi = async (status = 'PENDING') => {
  const { data } = await http.get<Result<AiReviewItem[]>>(
    '/api/ai/review/list',
    {
      params: { status }
    }
  )
  return data
}

export const approveAiReviewApi = async (id: number, reviewer = 'admin') => {
  const { data } = await http.put<Result<string>>(
    `/api/ai/review/approve/${id}`,
    null,
    {
      params: { reviewer }
    }
  )
  return data
}

export const rejectAiReviewApi = async (
  id: number,
  reviewer = 'admin',
  remark = '不符合预期'
) => {
  const { data } = await http.put<Result<string>>(
    `/api/ai/review/reject/${id}`,
    null,
    { params: { reviewer, remark } }
  )
  return data
}
