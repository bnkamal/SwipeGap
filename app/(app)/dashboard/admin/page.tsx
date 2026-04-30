'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [stats, setStats] = useState({ totalUsers:0, totalMentors:0, pendingMentors:0, totalSwipes:0, totalSessions:0, pendingCheatsheets:0, totalTopics:0, totalRevenue:0 })
  const [topGaps, setTopGaps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        {count:users},{count:mentors},{count:pendingMentors},
        {count:swipes},{count:sessions},{count:pendingSheets},{count:topics},{data:payments}
      ] = await Promise.all([
        supabase.from('users').select('*',{count:'exact',head:true}),
        supabase.from('mentor_profiles').select('*',{count:'exact',head:true}),
        supabase.from('mentor_profiles').select('*',{count:'exact',head:true}).eq('verified',false),
        supabase.from('swipe_events').select('*',{count:'exact',head:true}),
        supabase.from('sessions').select('*',{count:'exact',head:true}),
        supabase.from('cheatsheets').select('*',{count:'exact',head:true}).eq('approved',false),
        supabase.from('topics').select('*',{count:'exact',head:true}),
        supabase.from('payments').select('amount'),
      ])
      const revenue = payments?.reduce((s,p)=>s+(p.amount||0),0)||0
      setStats({totalUsers:users||0,totalMentors:mentors||0,pendingMentors:pendingMentors||0,totalSwipes:swipes||0,totalSessions:sessions||0,pendingCheatsheets:pendingSheets||0,totalTopics:topics||0,totalRevenue:revenue})
      const {data:gapData} = await supabase.from('swipe_events').select('topic_id, topics(title,subject,grade)').eq('direction','left').limit(100)
      if (gapData) {
        const counts:Record<string,any>={}
        gapData.forEach((e:any)=>{if(!counts[e.topic_id])counts[e.topic_id]={...e.topics,count:0,topic_id:e.topic_id};counts[e.topic_id].count++})
        setTopGaps(Object.values(counts).sort((a:any,b:any)=>b.count-a.count).slice(0,8))
      }
      setLoading(false)
    }
    load()
  }, [])

  const cards = [
    {label:'Total users',value:stats.totalUsers,icon:'👥',color:'text-brand-blue',link:null},
    {label:'Verified mentors',value:stats.totalMentors,icon:'🎓',color:'text-brand-teal',link:'/dashboard/admin/mentors'},
    {label:'Pending mentors',value:stats.pendingMentors,icon:'⏳',color:'text-amber-500',link:'/dashboard/admin/mentors'},
    {label:'Total swipes',value:stats.totalSwipes,icon:'👆',color:'text-purple-500',link:null},
    {label:'Sessions booked',value:stats.totalSessions,icon:'📚',color:'text-brand-blue',link:null},
    {label:'Pending sheets',value:stats.pendingCheatsheets,icon:'📄',color:'text-red-500',link:'/dashboard/admin/cheatsheets'},
    {label:'Topic cards',value:stats.totalTopics,icon:'🗂️',color:'text-brand-teal',link:'/dashboard/admin/topics'},
    {label:'Revenue',value:'$'+stats.totalRevenue.toFixed(0),icon:'💰',color:'text-green-600',link:null},
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <img src="/logo.png" alt="SwipeGap" style={{width:"160px", height:"auto"}} />
          <a href="/api/auth/signout" className="text-sm text-gray-400 hover:text-gray-600">Sign out</a>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{label:'Topics',icon:'🗂️',href:'/dashboard/admin/topics'},{label:'Mentors',icon:'🎓',href:'/dashboard/admin/mentors'},{label:'Cheatsheets',icon:'📄',href:'/dashboard/admin/cheatsheets'},{label:'Back to app',icon:'🏠',href:'/dashboard/student'}].map(n=>(
            <a key={n.label} href={n.href} className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-2xl mb-1">{n.icon}</div><p className="text-sm font-medium text-gray-700">{n.label}</p>
            </a>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading?[1,2,3,4,5,6,7,8].map(i=><div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl"/>):
          cards.map(s=>(
            <div key={s.label} onClick={()=>s.link&&router.push(s.link)} className={'bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm'+(s.link?' cursor-pointer hover:shadow-md transition-shadow':'')}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={'text-2xl font-bold '+s.color}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Top knowledge gaps</h2>
          {topGaps.length===0?<p className="text-sm text-gray-400 text-center py-4">No swipe data yet</p>:(
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topGaps.map((g:any)=>(
                <div key={g.topic_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div><p className="font-medium text-sm">{g.title}</p><p className="text-xs text-gray-500">{g.subject} · {g.grade}</p></div>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{g.count} swipes</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            <a href="/dashboard/admin/topics" className="bg-brand-blue text-white px-4 py-2.5 rounded-xl text-sm font-medium">+ Add topic</a>
            <a href="/dashboard/admin/mentors" className="bg-brand-teal text-white px-4 py-2.5 rounded-xl text-sm font-medium">Verify mentors</a>
            <a href="/dashboard/admin/cheatsheets" className="bg-brand-orange text-white px-4 py-2.5 rounded-xl text-sm font-medium">Approve cheatsheets</a>
          </div>
        </div>
      </div>
    </div>
  )
}
