import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface PageProps { params: Promise<{ id: string }> }

export default async function MentorProfilePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: mentor } = await supabase.from('mentor_profiles').select('*').eq('user_id', id).single()
  if (!mentor) notFound()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-brand-teal rounded-2xl flex items-center justify-center text-white font-bold text-2xl">{mentor.name?.charAt(0)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{mentor.name}</h1>
                {mentor.verified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Verified</span>}
              </div>
              <p className="text-gray-500 text-sm">{mentor.qualifications}</p>
              <p className="font-bold text-brand-blue text-lg mt-1">${mentor.hourly_rate||50}/session</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="font-medium text-gray-900 mb-2">About</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{mentor.bio}</p>
          </div>
          <div className="mt-4">
            <h3 className="font-medium text-gray-900 mb-2">Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.subjects?.map((s: string) => <span key={s} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{s}</span>)}
            </div>
          </div>
        </div>
        <div className="text-center">
          <a href="/mentors" className="inline-block bg-brand-blue text-white font-medium px-6 py-2.5 rounded-xl">← Back to all mentors</a>
        </div>
      </div>
    </div>
  )
}
