'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const SUBJECTS=['Mathematics','English','Physics','Chemistry','Biology','History','Geography','Computer Science','Science','General Ability']
const GRADES=['Year 3','Year 4','Year 5','Year 6','Year 7','Year 8','Year 9','Year 10','Year 11','Year 12','Class 10','Class 12']
const CURRICULUMS=['AU-NSW','AU-VIC','AU-QLD','AU-WA','IN-CBSE','IN-ICSE','IB']
const EXAMS=['HSC','VCE','NAPLAN','Selective','OC','JEE','EAMCET','NATA','CBSE','NEET','TOEFL','GRE','General']
const emptyForm={title:'',subject:'Mathematics',grade:'Year 12',curriculum:'AU-NSW',exam_tag:'HSC',hint:''}

export default function AdminTopics() {
  const supabase=createClient()
  const [topics,setTopics]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [form,setForm]=useState(emptyForm)
  const [editing,setEditing]=useState<string|null>(null)
  const [saving,setSaving]=useState(false)
  const [message,setMessage]=useState('')
  const [search,setSearch]=useState('')
  const [filterSubject,setFilterSubject]=useState('all')

  async function load(){const{data}=await supabase.from('topics').select('id,title,subject,grade,curriculum,exam_tag,hint').order('subject');setTopics(data||[]);setLoading(false)}
  useEffect(()=>{load()},[])

  async function handleSave(){
    setSaving(true);setMessage('')
    if(!form.title.trim()){setMessage('Title required');setSaving(false);return}
    if(editing){const{error}=await supabase.from('topics').update(form).eq('id',editing);if(error){setMessage('Error: '+error.message);setSaving(false);return};setMessage('Updated!');setEditing(null)}
    else{const{error}=await supabase.from('topics').insert(form);if(error){setMessage('Error: '+error.message);setSaving(false);return};setMessage('Added!')}
    setForm(emptyForm);await load();setSaving(false);setTimeout(()=>setMessage(''),3000)
  }

  async function handleDelete(id:string,title:string){
    if(!confirm('Delete "'+title+'"?'))return
    await supabase.from('topics').delete().eq('id',id);await load()
  }

  const displayed=topics.filter(t=>(!search||t.title.toLowerCase().includes(search.toLowerCase()))&&(filterSubject==='all'||t.subject===filterSubject))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/dashboard/admin" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">←</a>
          <div><h1 className="text-lg font-bold text-gray-900">Topic Management</h1><p className="text-xs text-gray-500">{topics.length} topics</p></div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold mb-4">{editing?'Edit topic':'Add new topic'}</h2>
          <div className="space-y-4">
            <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Topic title e.g. Calculus — Differentiation"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-blue" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[{label:'Subject',key:'subject',opts:SUBJECTS},{label:'Grade',key:'grade',opts:GRADES},{label:'Curriculum',key:'curriculum',opts:CURRICULUMS},{label:'Exam',key:'exam_tag',opts:EXAMS}].map(f=>(
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <select value={(form as any)[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                    {f.opts.map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <input value={form.hint} onChange={e=>setForm({...form,hint:e.target.value})} placeholder="Hint text shown on swipe card"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-blue" />
            {message&&<div className={'text-sm px-4 py-2 rounded-xl '+(message.startsWith('Error')?'bg-red-50 text-red-700':'bg-green-50 text-green-700')}>{message}</div>}
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="bg-brand-blue text-white px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">{saving?'Saving...':editing?'Update':'+ Add topic'}</button>
              {editing&&<button onClick={()=>{setEditing(null);setForm(emptyForm)}} className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm">Cancel</button>}
            </div>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search topics..." className="flex-1 min-w-[200px] border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white" />
          <select value={filterSubject} onChange={e=>setFilterSubject(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
            <option value="all">All subjects</option>{SUBJECTS.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50"><p className="text-sm text-gray-500">Showing {displayed.length} of {topics.length}</p></div>
          {loading?<div className="p-6 space-y-3">{[1,2,3].map(i=><div key={i} className="h-12 bg-gray-100 animate-pulse rounded-xl"/>)}</div>:
          displayed.length===0?<div className="text-center py-12 text-gray-400"><div className="text-3xl mb-2">🗂️</div><p className="text-sm">No topics found</p></div>:(
            <div className="divide-y divide-gray-50">
              {displayed.map(t=>(
                <div key={t.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{t.title}</p>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">{t.subject}</span><span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">{t.grade}</span><span className="text-xs text-gray-400">·</span>
                      <span className="text-xs bg-blue-50 text-blue-600 px-1.5 rounded">{t.exam_tag}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button onClick={()=>{setEditing(t.id);setForm({title:t.title,subject:t.subject,grade:t.grade,curriculum:t.curriculum,exam_tag:t.exam_tag,hint:t.hint||''});window.scrollTo(0,0)}} className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg">Edit</button>
                    <button onClick={()=>handleDelete(t.id,t.title)} className="text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded-lg">Delete</button>
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
