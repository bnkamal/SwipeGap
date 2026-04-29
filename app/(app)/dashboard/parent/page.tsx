import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
export default async function ParentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: links } = await supabase.from('parent_links').select('student_user_id').eq('parent_user_id', user.id)
  const childIds = links?.map((l: any) => l.student_user_id) || []
  const { data: children } = childIds.length > 0 ? await supabase.from('student_profiles').select('*').in('user_id', childIds) : { data: [] }
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
          <a href="/api/auth/signout" className="text-sm text-gray-400 hover:text-gray-600">Sign out</a>
        </div>
        {!children || children.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="text-4xl mb-3">👨‍👩‍👧</div>
            <h2 className="font-semibold text-gray-900 mb-2">No linked children yet</h2>
            <p className="text-sm text-gray-500 mb-4">Ask your child for their invite code from their SwipeGap settings.</p>
            <div className="max-w-sm mx-auto flex gap-2">
              <input placeholder="Enter child's invite code" className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-blue" />
              <button className="bg-brand-blue text-white px-4 py-2.5 rounded-xl text-sm">Link</button>
            </div>
          </div>
        ) : (
          (children || []).map((child: any) => (
            <div key={child.user_id} className="bg-white rounded-2xl border border-gray-100">
              <div className="bg-gradient-to-r from-brand-blue to-brand-teal p-5 rounded-t-2xl text-white">
                <h2 className="text-xl font-bold">{child.name}</h2>
                <p className="text-sm opacity-75">{child.grade} · {child.subjects?.join(', ')}</p>
              </div>
              <div className="p-5 flex flex-wrap gap-3">
                <a href="/dashboard/student/heatmap" className="text-sm bg-blue-50 text-brand-blue px-4 py-2 rounded-xl">View heatmap →</a>
                <a href="/dashboard/student/plan" className="text-sm bg-teal-50 text-brand-teal px-4 py-2 rounded-xl">Learning plan →</a>
                <a href="/dashboard/student/benchmark" className="text-sm bg-orange-50 text-brand-orange px-4 py-2 rounded-xl">Rankings →</a>
              </div>
            </div>
          ))
        )}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-sm text-blue-700">📧 <strong>Weekly progress emails</strong> sent every Sunday with full activity summary.</p>
        </div>
      </div>
    </div>
  )
}
