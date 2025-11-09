'use client'

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UploadSectionProps {
  currentFilename?: string
  recordsCount: number
  file: File | null
  uploading: boolean
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUpload: () => void
  hardcodedFilename: string
  title: string
  description: string
}

export function UploadSectionDynamic({
  currentFilename,
  recordsCount,
  file,
  uploading,
  onFileChange,
  onUpload,
  hardcodedFilename,
  title,
  description
}: UploadSectionProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyFilename = async () => {
    // Remove extension before copying
    const filenameWithoutExtension = hardcodedFilename.replace(/\.(xlsx|xls)$/i, '')
    await navigator.clipboard.writeText(filenameWithoutExtension)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mb-12 rounded-xl border border-border/60 bg-card p-8 shadow-xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground/80">
          {description}
        </p>
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-4 rounded-xl border border-jpc-vibrant-cyan-500/40 bg-gradient-to-r from-cyan-500/15 to-cyan-600/5 p-4 hover:border-jpc-vibrant-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 group backdrop-blur-sm">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-jpc-vibrant-cyan-500/10 group-hover:bg-jpc-vibrant-cyan-500/20 transition-colors">
            <span className="text-sm font-bold text-jpc-vibrant-cyan-400">✓</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Current Data Source</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {recordsCount > 0 ? `Data uploaded - ${recordsCount} records` : 'No data uploaded yet'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center gap-2 rounded-lg bg-jpc-vibrant-cyan-500/10 px-3 py-1.5 text-xs font-medium text-jpc-vibrant-cyan-400 border border-jpc-vibrant-cyan-500/20">
              {hardcodedFilename}
            </span>
            <button
              onClick={handleCopyFilename}
              className="p-1.5 hover:bg-jpc-vibrant-cyan-500/20 rounded transition-colors"
              title="Copy filename without extension"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-jpc-vibrant-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-jpc-vibrant-cyan-400" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-amber-600/5 p-4 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 group backdrop-blur-sm">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-jpc-vibrant-orange-500/10 group-hover:bg-jpc-vibrant-orange-500/20 transition-colors">
            <span className="text-sm font-bold text-jpc-vibrant-orange-400">!</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">UPSERT Mode</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Existing records will be updated, new ones will be created</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <label className="block text-sm font-semibold text-foreground">Select Excel File</label>
        <div className="flex gap-3">
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/20 border border-jpc-vibrant-cyan-500/30 hover:border-jpc-vibrant-cyan-500/50 rounded-lg text-jpc-vibrant-cyan-400 font-medium transition-all duration-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>Browse Files</span>
            </div>
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={onFileChange}
            disabled={uploading}
            className="hidden"
          />
          <div className="flex-1 flex items-center rounded-lg border-2 border-dashed border-jpc-vibrant-cyan-500/20 bg-jpc-vibrant-cyan-500/5 px-4 py-3 hover:border-jpc-vibrant-cyan-500/40 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-200">
            <p className="text-sm text-muted-foreground">
              {file ? file.name : 'No file selected'}
            </p>
          </div>
        </div>
      </div>

      <Button
        onClick={onUpload}
        disabled={!file || uploading}
        className="w-full bg-jpc-vibrant-cyan-500 hover:bg-jpc-vibrant-cyan-500 text-white gap-2 h-12 font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? '⏳ Uploading...' : '📤 Upload and Parse →'}
      </Button>
    </div>
  )
}
