'use client'

import { useRef, useState } from 'react'
import { Upload, X, FileIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface FileUploadProps {
  value: string
  onChange: (url: string) => void
  accept?: string
  label?: string
}

export function FileUpload({ value, onChange, accept, label = 'Attachment' }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      onChange(data.url)
      toast.success('File uploaded')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const filename = value ? value.split('/').pop() : null

  return (
    <div>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleUpload} />
      {value ? (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-slate-50">
          <FileIcon className="h-4 w-4 text-sky-600 shrink-0" />
          <a href={value} target="_blank" rel="noreferrer" className="text-sm text-sky-600 hover:underline truncate flex-1">
            {filename}
          </a>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-rose-500" onClick={() => onChange('')}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="gap-2 w-full justify-start text-slate-500" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Uploading...' : `Upload ${label}`}
        </Button>
      )}
    </div>
  )
}
