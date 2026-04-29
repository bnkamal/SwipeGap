'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Mentor { id: string; user_id: string; name: string; subjects: string[]; qualifications: string; hourly_rate: number; bio: string; verified: boolean }

function MentorsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<string|null>(null)
  const subjectFilter = searchParams.get('subject') || ''
  const topicParam = searchParams.get('topic') || ''

  useEffect(() => {
    supabase.from('mentor_profiles').select('*').eq('verified', true)
      .then(({ data }) => { setMentors(data || []); setLoading(false) })
  }, [])

  async function handleBook(mentor: Mentor) {
    setBooking(mentor.user_id)
    try {
      const res = await fetch('/api/sessions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentor_id: mentor.user_id,
          topic_id: null,
          session_price: mentor.hourly_rate || 50,
          mentor_name: mentor.name,
          topic_title: topicParam || 'General tutoring session'
        })
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      if (url) window.location.href = url
    } catch(e) {
      alert('Booking failed — check Stripe keys in .env.local')
    }
    setBooking(null)
  }

  const displayed = mentors.filter(m => !subjectFilter || m.subjects?.includes(subjectFilter))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push('/dashboard/student')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">←</button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Find a Mentor</h1>
            <p className="text-xs text-gray-500">{topicParam ? 'For: ' + topicParam : displayed.length + ' verified mentors'}</p>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {topicParam && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
            📌 Showing mentors for: <strong>{topicParam}</strong>
          </div>
        )}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-2xl"/>)}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">🧑‍🏫</div>
            <h3 className="font-medium text-gray-700">No verified mentors yet</h3>
            <p className="text-sm text-gray-400 mt-1">Check back soon!</p>
          </div>
        ) : (
          displayed.map(mentor => (
            <div key={mentor.user_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-teal rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {mentor.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
                    {mentor.verified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {mentor.subjects?.map(s => <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>)}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">{mentor.bio}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-brand-blue">${mentor.hourly_rate || 50}/session</span>
                    <span className="text-xs text-gray-400">{mentor.qualifications}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleBook(mentor)}
                  disabled={booking === mentor.user_id}
                  className="flex-1 bg-brand-blue text-white text-sm py-2.5 rounded-xl hover:bg-blue-800 disabled:opacity-50 font-medium">
                  {booking === mentor.user_id ? 'Redirecting...' : 'Book · $' + (mentor.hourly_rate || 50)}
                </button>
                <button
                  onClick={() => router.push('/mentors/' + mentor.user_id)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                  Profile
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function MentorsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <MentorsContent />
    </Suspense>
  )
}
