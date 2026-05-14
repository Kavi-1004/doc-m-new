'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-slate-50">
      <div className="rounded-full bg-red-50 p-4 mb-4">
        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-slate-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-slate-500 mb-4 max-w-md">
        An unexpected error occurred. Please try again or reload the page.
      </p>
      {error.message && (
        <p className="text-xs text-slate-400 font-mono mb-4 max-w-md break-all">
          {error.message}
        </p>
      )}
      <div className="flex gap-2">
        <button
          onClick={reset}
          className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800"
        >
          Try again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 text-sm border border-slate-200 rounded-md hover:bg-slate-100"
        >
          Go home
        </button>
      </div>
    </div>
  )
}
