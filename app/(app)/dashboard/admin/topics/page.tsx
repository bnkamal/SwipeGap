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
  const [filterGrade, setFilterGrade] = useState('all')
  const [filterCurriculum, setFilterCurriculum] = useState('all')
  const [filterExam, setFilterExam] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
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

  // Proper CSV parser that handles quoted fields with commas inside
  function parseCSV(text: string): Record<string, string>[] {
    const rows: Record<string, string>[] = []
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
    if (lines.length < 2) return rows

    function parseLine(line: string): string[] {
      const result: string[] = []
      let current = ''
      let inQuotes = false
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          if (inQuotes && line[i+1] === '"') { current += '"'; i++ }
          else { inQuotes = !inQuotes }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/"/g, '').trim())
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue
      const vals = parseLine(lines[i])
      const obj: Record<string, string> = {}
      headers.forEach((h, idx) => { obj[h] = vals[idx] || '' })
      rows.push(obj)
    }
    return rows
  }

  async function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setUploadResult('')
    const text = await file.text()
    const rows = parseCSV(text)
    let added = 0, errors = 0
    for (const obj of rows) {
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
      if (error) { console.error(error); errors++ } else added++
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

  async function handleBulkDelete() {
    if (selected.size === 0) return
    if (!confirm(`Delete ${selected.size} selected topics? This cannot be undone.`)) return
    setBulkDeleting(true)
    for (const id of Array.from(selected)) {
      await supabase.from('topics').delete().eq('id', id)
    }
    setSelected(new Set())
    await load()
    setBulkDeleting(false)
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selected.size === displayed.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(displayed.map(t => t.id)))
    }
  }

  const displayed = topics.filter(t =>
    (!search || t.title.toLowerCase().includes(search.toLowerCase())) &&
    (filterSubject === 'all' || t.subject === filterSubject) &&
    (filterGrade === 'all' || t.grade === filterGrade) &&
    (filterCurriculum === 'all' || t.curriculum === filterCurriculum) &&
    (filterExam === 'all' || t.exam_tag === filterExam)
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
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by topic name..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-blue" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
              <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
                <option value="all">All Subjects</option>
                {subjects.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Grade</label>
              <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
                <option value="all">All Grades</option>
                {grades.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Curriculum</label>
              <select value={filterCurriculum} onChange={e => setFilterCurriculum(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
                <option value="all">All Curriculums</option>
                {curriculums.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Exam</label>
              <select value={filterExam} onChange={e => setFilterExam(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
                <option value="all">All Exams</option>
                {exams.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">{displayed.length} of {topics.length} topics</p>
            <button onClick={() => { setSearch(''); setFilterSubject('all'); setFilterGrade('all'); setFilterCurriculum('all'); setFilterExam('all') }}
              className="text-xs text-brand-blue hover:underline">Clear filters</button>
          </div>
        </div>

        {/* Bulk Delete Bar */}
        {selected.size > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-red-700 font-medium">{selected.size} topic{selected.size > 1 ? 's' : ''} selected</p>
            <div className="flex gap-2">
              <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500 px-3 py-1.5 border border-gray-200 rounded-lg bg-white">
                Clear
              </button>
              <button onClick={handleBulkDelete} disabled={bulkDeleting}
                className="text-xs bg-red-600 text-white px-4 py-1.5 rounded-lg disabled:opacity-50 font-medium">
                {bulkDeleting ? 'Deleting...' : `🗑️ Delete ${selected.size} selected`}
              </button>
            </div>
          </div>
        )}

        {/* Topics List */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-500">Showing {displayed.length} of {topics.length}</p>
            <button onClick={selectAll} className="text-xs text-brand-blue hover:underline">
              {selected.size === displayed.length && displayed.length > 0 ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-xl"/>)}</div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><div className="text-3xl mb-2">🗂️</div><p className="text-sm">No topics found</p></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {displayed.map(t => (
                <div key={t.id} className={"flex items-center justify-between px-4 py-3 hover:bg-gray-50 " + (selected.has(t.id) ? 'bg-red-50' : '')}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleSelect(t.id)}
                      className="w-4 h-4 rounded border-gray-300 text-brand-blue flex-shrink-0" />
                    <div className="min-w-0">
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
