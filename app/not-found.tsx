import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-slate-50">
      <div className="text-6xl font-bold text-slate-200 mb-2">404</div>
      <h2 className="text-lg font-semibold text-slate-900 mb-2">Page not found</h2>
      <p className="text-sm text-slate-500 mb-6 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800"
      >
        Go to Dashboard
      </Link>
    </div>
  )
}
