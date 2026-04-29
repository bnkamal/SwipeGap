'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
const SUBJECTS = ['Mathematics','English','Physics','Chemistry','Biology','Computer Science','Science']
const EXAMS = ['HSC','VCE','Selective','OC','JEE','EAMCET','CBSE','NEET','NAPLAN']
export default function MentorCheatsheets() {
  const router = useRouter()
  const supabase = createClient()
  const [mySheets, setMySheets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ title: '', subject: 'Mathematics', exam_tag: 'HSC', price: '4.99' })
  const [file, setFile] = useState<File|null>(null)
  const [message, setMessage] = useState('')
  async function loadSheets() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('cheatsheets').select('*').eq('mentor_id', user.id).order('created_at', { ascending: false })
    setMySheets(data || [])
    setLoading(false)
  }
  useEffect(() => { loadSheets() }, [])
  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setMessage('Please select a file'); return }
    setUploading(true); setMessage('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const fileName = user.id + '/' + Date.now() + '-' + file.name.replace(/\s+/g,'_')
      const { error: upErr } = await supabase.storage.from('cheatsheets').upload(fileName, file)
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('cheatsheets').getPublicUrl(fileName)
      const { error: dbErr } = await supabase.from('cheatsheets').insert({ mentor_id: user.id, title: form.title, subject: form.subject, exam_tag: form.exam_tag, file_url: publicUrl, price: parseFloat(form.price), approved: false, downloads: 0 })
      if (dbErr) throw dbErr
      setMessage('Uploaded! Pending admin approval.')
      setForm({ title: '', subject: 'Mathematics', exam_tag: 'HSC', price: '4.99' }); setFile(null)
      loadSheets()
    } catch(e: any) { setMessage('Upload failed: ' + e.message) }
    setUploading(false)
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push('/dashboard/mentor')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">←</button>
          <div><h1 className="text-lg font-bold text-gray-900">My Cheatsheets</h1><p className="text-xs text-gray-500">Upload notes and earn 70% of every sale</p></div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Upload new cheatsheet</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required placeholder="e.g. HSC Chemistry — Acids & Bases" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-blue" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm">{SUBJECTS.map(s=><option key={s}>{s}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
                <select value={form.exam_tag} onChange={e=>setForm({...form,exam_tag:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm">{EXAMS.map(ex=><option key={ex}>{ex}</option>)}</select></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Price (AUD $)</label>
              <input type="number" min="0.99" max="49.99" step="0.50" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
              <p className="text-xs text-gray-400 mt-1">You earn ${(parseFloat(form.price||'0')*0.7).toFixed(2)} per sale (70%)</p></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">File (PDF or image)</label>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e=>setFile(e.target.files?.[0]||null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-brand-blue file:text-white" /></div>
            {message && <div className={`text-sm px-4 py-3 rounded-xl ${message.startsWith('Upload')||message.startsWith('Failed')?'bg-red-50 text-red-700':'bg-green-50 text-green-700'}`}>{message}</div>}
            <button type="submit" disabled={uploading} className="w-full bg-brand-teal text-white py-2.5 rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50">{uploading?'Uploading...':'Submit for approval'}</button>
          </form>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">My uploads</h2>
          {loading ? <div className="h-16 bg-gray-100 animate-pulse rounded-xl"/> : mySheets.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">No uploads yet</p> : (
            <div className="space-y-3">{mySheets.map(s=>(
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div><p className="font-medium text-sm">{s.title}</p><p className="text-xs text-gray-500">{s.subject} · ${s.price}</p></div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.approved?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}`}>{s.approved?'Live':'Pending'}</span>
              </div>))}</div>
          )}
        </div>
      </div>
    </div>
  )
}
