interface ApiError extends Error {
  status: number
  data: Record<string, unknown>
}

class ApiClient {
  async request<T = Record<string, unknown>>(url: string, options: RequestInit = {}): Promise<T> {
    const config: RequestInit = {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    }

    if (config.body && typeof config.body === 'object' && !(config.body instanceof ReadableStream)) {
      config.body = JSON.stringify(config.body)
    }

    const res = await fetch(url, config)
    const data = await res.json()

    if (!res.ok) {
      const error = new Error(data.error || `Request failed: ${res.status}`) as ApiError
      error.status = res.status
      error.data = data
      throw error
    }

    return data as T
  }

  get<T = Record<string, unknown>>(url: string) {
    return this.request<T>(url, { method: 'GET' })
  }

  post<T = Record<string, unknown>>(url: string, body?: Record<string, unknown>) {
    return this.request<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined })
  }

  put<T = Record<string, unknown>>(url: string, body?: Record<string, unknown>) {
    return this.request<T>(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined })
  }

  delete<T = Record<string, unknown>>(url: string) {
    return this.request<T>(url, { method: 'DELETE' })
  }
}

const api = new ApiClient()
export default api
