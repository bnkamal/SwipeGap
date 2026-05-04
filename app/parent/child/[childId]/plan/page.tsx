import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Page({ params }: { params: { childId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: link } = await supabase.from('parent_links').select('id')
    .eq('parent_user_id', user.id).eq('student_user_id', params.childId).single()
  if (!link) redirect('/dashboard/parent')
  const { data: child } = await supabase.from('student_profiles').select('name').eq('user_id', params.childId).single()
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4 mb-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/dashboard/parent" className="text-gray-400 hover:text-gray-600 text-sm">← Parent Dashboard</a>
          <img src="/logo.png" alt="SwipeGap" style={{width:"120px", height:"auto"}} />
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-3">🚧</div>
          <h2 className="font-bold text-gray-900 text-lg">Coming Soon</h2>
          <p className="text-gray-500 mt-2">{child?.name}'s plan view is being built.</p>
          <a href="/dashboard/parent" className="inline-block mt-4 bg-brand-blue text-white px-6 py-2 rounded-xl text-sm">← Back</a>
        </div>
      </div>
    </div>
  )
}
