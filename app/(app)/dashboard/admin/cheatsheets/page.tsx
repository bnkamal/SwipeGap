import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
export default async function AdminCheatsheets() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: userRow } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userRow?.role !== 'admin') redirect('/dashboard/student')
  const { data: pending } = await supabase.from('cheatsheets').select('*, mentor:mentor_profiles(name)').eq('approved', false).order('created_at', { ascending: true })
  const { data: approved } = await supabase.from('cheatsheets').select('*').eq('approved', true).order('downloads', { ascending: false }).limit(20)
  async function approve(id: string, action: string) {
    'use server'
    const supabase = await createClient()
    if (action === 'approve') await supabase.from('cheatsheets').update({ approved: true }).eq('id', id)
    else await supabase.from('cheatsheets').delete().eq('id', id)
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Cheatsheet Approvals</h1>
          <a href="/dashboard/admin" className="text-sm text-gray-400">← Admin</a>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold">Pending review</h2>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{pending?.length||0}</span>
          </div>
          {!pending||pending.length===0 ? <p className="text-sm text-gray-400 text-center py-6">Queue is clear!</p> : (
            <div className="space-y-4">{pending.map((s: any)=>(
              <div key={s.id} className="border-2 border-amber-200 rounded-xl p-4 bg-amber-50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="text-sm text-gray-500">{(s.mentor as any)?.name} · {s.subject} · {s.exam_tag} · ${s.price}</p>
                    <a href={s.file_url} target="_blank" className="text-xs text-brand-blue hover:underline">Preview →</a>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={async()=>{await fetch('/api/admin/cheatsheets/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:s.id,action:'approve'})});window.location.reload()}}
                      className="bg-green-500 text-white text-sm px-4 py-2 rounded-lg font-medium">✓ Approve</button>
                    <button onClick={async()=>{await fetch('/api/admin/cheatsheets/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:s.id,action:'reject'})});window.location.reload()}}
                      className="bg-red-100 text-red-700 text-sm px-4 py-2 rounded-lg">✗ Reject</button>
                  </div>
                </div>
              </div>
            ))}</div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold mb-4">Live ({approved?.length||0})</h2>
          {!approved||approved.length===0 ? <p className="text-sm text-gray-400 text-center py-4">None yet</p> : (
            <div className="space-y-2">{approved.map((s: any)=>(
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div><p className="font-medium text-sm">{s.title}</p><p className="text-xs text-gray-500">{s.subject} · ${s.price} · 📥{s.downloads}</p></div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Live</span>
              </div>))}</div>
          )}
        </div>
      </div>
    </div>
  )
}
