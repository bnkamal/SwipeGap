'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminTopics() {
  const supabase = createClient()
  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({title:'',subject:'',grade:'',curriculum:'',exam_tag:'',hint:''})
  const [editing, setEditing] = useState<string|null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Dynamic options derived from existing topics
  const subjects = Array.from(new Set(topics.map(t => t.subject).filter(Boolean))).sort()
  const grades = Array.from(new Set(topics.map(t => t.grade).filter(Boolean))).sort()
  const curriculums = Array.from(new Set(topics.map(t => t.curriculum).filter(Boolean))).sort()
  const exams = Array.from(new Set(topics.map(t => t.exam_tag).filter(Boolean))).sort()

  async function load() {
    const { data } = await supabase.from('topics').select('id,title,subject,grade,curriculum,exam_tag,hint').order('subject')
    setTopics(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleSave() {
    setSaving(true); setMessage('')
    if (!form.title.trim()) { setMessage('Title required'); setSaving(false); return }
    if (!form.subject.trim()) { setMessage('Subject required'); setSaving(false); return }
    if (editing) {
      const { error } = await supabase.from('topics').update(form).eq('id', editing)
      if (error) { setMessage('Error: ' + error.message); setSaving(false); return }
      setMessage('Updated!'); setEditing(null)
    } else {
      const { error } = await supabase.from('topics').insert(form)
      if (error) { setMessage('Error: ' + error.message); setSaving(false); return }
      setMessage('Added!')
    }
    setForm({title:'',subject:'',grade:'',curriculum:'',exam_tag:'',hint:''})
    await load(); setSaving(false); setTimeout(() => setMessage(''), 3000)
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm('Delete "' + title + '"?')) return
    await supabase.from('topics').delete().eq('id', id); await load()
  }

  // CSV Upload handler
  async function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setUploadResult('')
    const text = await file.text()
    const lines = text.split('\n').filter(l => l.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
    const rows = lines.slice(1)
    let added = 0, errors = 0
    for (const row of rows) {
      const vals = row.split(',').map(v => v.trim().replace(/"/g, ''))
      const obj: any = {}
      headers.forEach((h, i) => { obj[h] = vals[i] || '' })
      const topic = {
        title: obj.title || obj.topic || '',
        subject: obj.subject || '',
        grade: obj.grade || '',
        curriculum: obj.curriculum || '',
        exam_tag: obj.exam_tag || obj.exam || '',
        hint: obj.hint || ''
      }
      if (!topic.title) { errors++; continue }
      const { error } = await supabase.from('topics').insert(topic)
      if (error) errors++; else added++
    }
    await load()
    setUploadResult(`✅ ${added} topics added${errors > 0 ? `, ⚠️ ${errors} skipped` : ''}`)
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  function downloadTemplate() {
    const csv = 'title,subject,grade,curriculum,exam_tag,hint\nCalculus - Differentiation,Mathematics,Year 12,AU-NSW,HSC,Think about rates of change\nEssay Writing,English,Year 11,AU-NSW,HSC,Structure introduction body conclusion'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'swipegap_topics_template.csv'; a.click()
  }

  const displayed = topics.filter(t =>
    (!search || t.title.toLowerCase().includes(search.toLowerCase())) &&
    (filterSubject === 'all' || t.subject === filterSubject)
  )

  const ComboField = ({ label, fieldKey, options }: { label: string, fieldKey: string, options: string[] }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        list={fieldKey + '-list'}
        value={(form as any)[fieldKey]}
        onChange={e => setForm({ ...form, [fieldKey]: e.target.value })}
        placeholder={"Select or type new " + label.toLowerCase()}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-blue"
      />
      <datalist id={fieldKey + '-list'}>
        {options.map(o => <option key={o} value={o} />)}
      </datalist>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/dashboard/admin" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">←</a>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Topic Management</h1>
            <p className="text-xs text-gray-500">{topics.length} topics</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* CSV Upload Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold mb-1">📤 Bulk Upload via CSV</h2>
          <p className="text-xs text-gray-500 mb-4">Upload multiple topics at once using a CSV file</p>
          <div className="flex flex-wrap gap-3 items-center">
            <button onClick={downloadTemplate} className="text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50">
              ⬇️ Download Template
            </button>
            <label className="text-sm bg-brand-blue text-white px-4 py-2 rounded-xl cursor-pointer hover:opacity-90">
              {uploading ? 'Uploading...' : '📁 Choose CSV File'}
              <input ref={fileRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" disabled={uploading} />
            </label>
            {uploadResult && <span className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-xl">{uploadResult}</span>}
          </div>
          <div className="mt-3 bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 font-medium mb-1">CSV Format (columns):</p>
            <code className="text-xs text-gray-600">title, subject, grade, curriculum, exam_tag, hint</code>
          </div>
        </div>

        {/* Add/Edit Topic */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold mb-4">{editing ? 'Edit topic' : 'Add new topic'}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Topic Title *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                placeholder="e.g. Calculus — Differentiation"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-blue" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ComboField label="Subject" fieldKey="subject" options={subjects} />
              <ComboField label="Grade" fieldKey="grade" options={grades} />
              <ComboField label="Curriculum" fieldKey="curriculum" options={curriculums} />
              <ComboField label="Exam" fieldKey="exam_tag" options={exams} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hint (optional)</label>
              <input value={form.hint} onChange={e => setForm({...form, hint: e.target.value})}
                placeholder="Hint text shown on swipe card"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-blue" />
            </div>
            {message && (
              <div className={"text-sm px-4 py-2 rounded-xl " + (message.startsWith("Error") || message.includes("required") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700")}>
                {message}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="bg-brand-blue text-white px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update' : '+ Add topic'}
              </button>
              {editing && (
                <button onClick={() => { setEditing(null); setForm({title:'',subject:'',grade:'',curriculum:'',exam_tag:'',hint:''}) }}
                  className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm">Cancel</button>
              )}
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search topics..."
            className="flex-1 min-w-[200px] border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white" />
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
            <option value="all">All subjects</option>
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Topics List */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">Showing {displayed.length} of {topics.length}</p>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-xl"/>)}</div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><div className="text-3xl mb-2">🗂️</div><p className="text-sm">No topics found</p></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {displayed.map(t => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{t.title}</p>
                    <div className="flex gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-500">{t.subject}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">{t.grade}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">{t.curriculum}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs bg-blue-50 text-blue-600 px-1.5 rounded">{t.exam_tag}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button onClick={() => { setEditing(t.id); setForm({title:t.title,subject:t.subject,grade:t.grade,curriculum:t.curriculum,exam_tag:t.exam_tag,hint:t.hint||''}); window.scrollTo(0,0) }}
                      className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg">Edit</button>
                    <button onClick={() => handleDelete(t.id, t.title)}
                      className="text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded-lg">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
