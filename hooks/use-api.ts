'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseApiOptions {
  initialData?: Record<string, unknown> | null
}

interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useApi<T = Record<string, unknown>>(
  url: string | null,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>((options.initialData as T) || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  useEffect(() => {
    if (!url) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(json => {
        if (!cancelled) {
          setData(json)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [url, refreshKey])

  return { data, loading, error, refresh }
}

interface ApiError extends Error {
  status: number
  data: Record<string, unknown>
}

export async function apiMutate<T = Record<string, unknown>>(
  url: string,
  method = 'POST',
  body: Record<string, unknown> | null = null
): Promise<T> {
  const config: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) config.body = JSON.stringify(body)

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
