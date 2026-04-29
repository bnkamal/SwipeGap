'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminMentors() {
  const supabase=createClient()
  const [pending,setPending]=useState<any[]>([])
  const [verified,setVerified]=useState<any[]>([])
  const [loading,setLoading]=useState(true)

  async function load(){
    const{data:all}=await supabase.from('mentor_profiles').select('*, user:users(email)').order('verified')
    setPending((all||[]).filter((m:any)=>!m.verified))
    setVerified((all||[]).filter((m:any)=>m.verified))
    setLoading(false)
  }
  useEffect(()=>{load()},[])

  async function setV(userId:string,v:boolean){await supabase.from('mentor_profiles').update({verified:v}).eq('user_id',userId);await load()}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/dashboard/admin" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">←</a>
          <div><h1 className="text-lg font-bold">Mentor Verification</h1><p className="text-xs text-gray-500">{pending.length} pending · {verified.length} verified</p></div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold">Pending</h2>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
          </div>
          {loading?<div className="h-16 bg-gray-100 animate-pulse rounded-xl"/>:
          pending.length===0?<p className="text-sm text-gray-400 text-center py-6">All mentors verified! 🎉</p>:(
            <div className="space-y-4">
              {pending.map(m=>(
                <div key={m.user_id} className="border-2 border-amber-200 bg-amber-50 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-brand-teal rounded-lg flex items-center justify-center text-white font-bold text-sm">{m.name?.charAt(0)}</div>
                        <h3 className="font-semibold">{m.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{m.qualifications}</p>
                      <p className="text-xs text-gray-500">Subjects: {m.subjects?.join(', ')}</p>
                      <p className="text-xs text-gray-400">{(m.user as any)?.email}</p>
                      {m.bio&&<p className="text-xs text-gray-600 mt-1 italic">"{m.bio}"</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>setV(m.user_id,true)} className="bg-green-500 text-white text-sm px-4 py-2 rounded-lg font-medium">✓ Approve</button>
                      <button onClick={()=>setV(m.user_id,false)} className="bg-red-100 text-red-700 text-sm px-4 py-2 rounded-lg">✗ Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold mb-4">Verified ({verified.length})</h2>
          {verified.length===0?<p className="text-sm text-gray-400 text-center py-4">None yet</p>:(
            <div className="space-y-2">
              {verified.map(m=>(
                <div key={m.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div><p className="font-medium text-sm">{m.name}</p><p className="text-xs text-gray-500">{m.subjects?.join(', ')}</p></div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Verified</span>
                    <button onClick={()=>setV(m.user_id,false)} className="text-xs text-red-400 hover:text-red-600">Revoke</button>
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
