import { http, HttpResponse } from 'msw'

// 示例 handler：仅保留健康检查，业务 mock 请按 feature 需要在此追加
export const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({ code: 20000, message: 'OK', data: { status: 'up' }, timestamp: Date.now() })
  }),
]
