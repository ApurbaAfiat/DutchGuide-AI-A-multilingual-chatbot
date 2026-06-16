'use client'

import { useState, useCallback } from 'react'
import { X, Upload, RefreshCw, BarChart2, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { uploadDocument, rebuildKnowledgeBase, getStats } from '@/lib/api'
import type { StatsResponse } from '@/lib/types'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  'transportation', 'housing', 'immigration', 'healthcare',
  'universities', 'tourism', 'culture', 'general',
]

interface AdminPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'stats' | 'rebuild'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [category, setCategory] = useState('general')
  const [isUploading, setIsUploading] = useState(false)
  const [isRebuilding, setIsRebuilding] = useState(false)
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleUpload = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    setMessage(null)
    try {
      const result = await uploadDocument(selectedFile, category)
      setMessage({ type: 'success', text: `✅ Uploaded! Created ${result.chunks_created} chunks from "${result.filename}"` })
      setSelectedFile(null)
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Upload failed' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRebuild = async () => {
    if (!confirm('This will rebuild the entire vector database. This may take several minutes. Continue?')) return
    setIsRebuilding(true)
    setMessage(null)
    try {
      const result = await rebuildKnowledgeBase()
      setMessage({ type: 'success', text: `✅ Rebuild complete! ${result.total_chunks} chunks indexed in ${result.time_taken_seconds}s` })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Rebuild failed' })
    } finally {
      setIsRebuilding(false)
    }
  }

  const loadStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const data = await getStats()
      setStats(data)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load stats' })
    } finally {
      setLoadingStats(false)
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Dashboard</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800">
          {(['upload', 'stats', 'rebuild'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); if (tab === 'stats') loadStats() }}
              className={cn(
                'flex-1 py-3 text-sm font-medium capitalize transition-colors',
                activeTab === tab
                  ? 'text-dutch-red border-b-2 border-dutch-red'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Message banner */}
          {message && (
            <div className={cn(
              'flex items-start gap-2 px-4 py-3 rounded-xl text-sm',
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900'
                : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900'
            )}>
              {message.type === 'success' ? <CheckCircle size={16} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />}
              {message.text}
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Upload a PDF, DOCX, TXT, or Markdown file to add to the knowledge base.</p>

              {/* File drop zone */}
              <label className="block w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-dutch-red/50 transition-colors">
                <FileText size={24} className="mx-auto mb-2 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedFile ? selectedFile.name : 'Click to select or drag & drop'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </label>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all',
                  selectedFile && !isUploading
                    ? 'bg-dutch-red text-white hover:bg-dutch-red-dark'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                )}
              >
                <Upload size={16} />
                {isUploading ? 'Uploading...' : 'Upload & Index'}
              </button>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-3">
              {loadingStats ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Loading...</p>
              ) : stats ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Chunks</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.vector_store_size}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Documents</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_documents}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">By Category</p>
                    <div className="space-y-1.5">
                      {Object.entries(stats.documents_by_category).map(([cat, count]) => (
                        <div key={cat} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300 capitalize">{cat}</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-600 space-y-1">
                    <p>Model: {stats.llm_model}</p>
                    <p>Embeddings: {stats.embedding_model}</p>
                  </div>
                </>
              ) : (
                <button onClick={loadStats} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
                  <BarChart2 size={16} /> Load Statistics
                </button>
              )}
            </div>
          )}

          {/* Rebuild Tab */}
          {activeTab === 'rebuild' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-xl p-4 text-sm text-yellow-700 dark:text-yellow-400">
                ⚠️ <strong>Warning:</strong> This deletes and rebuilds the entire vector database from all files in the <code>data/</code> directory. This can take several minutes.
              </div>
              <button
                onClick={handleRebuild}
                disabled={isRebuilding}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all',
                  !isRebuilding
                    ? 'bg-dutch-red text-white hover:bg-dutch-red-dark'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                )}
              >
                <RefreshCw size={16} className={isRebuilding ? 'animate-spin' : ''} />
                {isRebuilding ? 'Rebuilding... (please wait)' : 'Rebuild Knowledge Base'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
