import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRoutineStore } from '@/store/routineStore'
import { Download, Upload, Copy, CheckCircle, AlertCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ExportImport() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { routines, load, exportRoutineAsJson, importRoutineFromJson } = useRoutineStore()

  const [exportJson, setExportJson] = useState('')
  const [importJson, setImportJson] = useState('')
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    load()
  }, [load])

  const routine = routines.find((r) => r.id === id)

  useEffect(() => {
    if (id) {
      const json = exportRoutineAsJson(id)
      if (json) setExportJson(json)
    }
  }, [id, exportRoutineAsJson, routines])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportJson)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = exportJson
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [exportJson])

  const handleDownload = useCallback(() => {
    if (!routine) return
    const blob = new Blob([exportJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${routine.name}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [exportJson, routine])

  const handleImport = useCallback(() => {
    const result = importRoutineFromJson(importJson)
    if (result.success) {
      setImportResult({ success: true, message: '导入成功！' })
      setImportJson('')
      setTimeout(() => {
        navigate('/')
      }, 1000)
    } else {
      setImportResult({ success: false, message: result.error || '导入失败' })
    }
    setTimeout(() => setImportResult(null), 4000)
  }, [importJson, importRoutineFromJson, navigate])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setImportJson(text)
    }
    reader.readAsText(file)
  }, [])

  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-rice">导出与导入</h1>
          <p className="text-rice/40 mt-1 text-sm">导出套路为 JSON 文件，或从 JSON 导入</p>
        </div>

        {id && routine && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif font-semibold text-rice">导出「{routine.name}」</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-700/50 text-rice/70 rounded-lg hover:bg-ink-700 hover:text-rice transition-colors text-xs"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? '已复制' : '复制'}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cinnabar/15 text-cinnabar rounded-lg hover:bg-cinnabar/25 transition-colors text-xs"
                >
                  <Download size={14} />
                  下载文件
                </button>
              </div>
            </div>
            <pre className="bg-ink-900 border border-ink-700/50 rounded-xl p-5 text-sm text-jade/80 font-mono overflow-x-auto max-h-80 overflow-y-auto">
              {exportJson}
            </pre>
          </section>
        )}

        <section>
          <h2 className="text-xl font-serif font-semibold text-rice mb-4">导入套路</h2>
          <div className="bg-ink-800/60 border border-ink-700/50 rounded-xl p-5">
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-700/50 text-rice/70 rounded-lg hover:bg-ink-700 hover:text-rice transition-colors text-xs"
              >
                <Upload size={14} />
                上传文件
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="粘贴 JSON 内容到此处..."
              className="w-full h-48 px-4 py-3 bg-ink-900 border border-ink-600 rounded-lg text-rice text-sm font-mono placeholder-rice/20 focus:outline-none focus:border-cinnabar/50 resize-none"
            />
            {importResult && (
              <div
                className={cn(
                  'mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                  importResult.success
                    ? 'bg-jade/10 text-jade border border-jade/20'
                    : 'bg-cinnabar/10 text-cinnabar border border-cinnabar/20'
                )}
              >
                {importResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {importResult.message}
              </div>
            )}
            <button
              onClick={handleImport}
              disabled={!importJson.trim()}
              className="mt-4 w-full py-2.5 bg-jade/15 text-jade rounded-lg hover:bg-jade/25 transition-colors text-sm disabled:opacity-40"
            >
              导入到套路库
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
