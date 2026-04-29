'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
export default function DuelsPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/dashboard/student')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">←</button>
          <div><h1 className="text-xl font-bold text-gray-900">Knowledge Duels</h1><p className="text-sm text-gray-500">Challenge a classmate — winner gets +100 XP</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <div className="text-center mb-6"><div className="text-5xl mb-3">⚔️</div><h2 className="text-lg font-bold text-gray-900">Challenge a classmate</h2></div>
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">📧</div>
              <h3 className="font-semibold text-gray-900 mb-1">Challenge sent!</h3>
              <p className="text-sm text-gray-500">You will be notified when they accept.</p>
              <button onClick={() => setSent(false)} className="mt-4 text-sm text-brand-blue hover:underline">Challenge someone else</button>
            </div>
          ) : (
            <form onSubmit={e=>{e.preventDefault();setSent(true)}} className="space-y-4">
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="classmate@school.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-blue" />
              <button type="submit" className="w-full bg-brand-orange text-white py-3 rounded-xl font-semibold hover:bg-orange-600">⚔️ Send challenge</button>
            </form>
          )}
        </div>
        <div className="bg-brand-blue rounded-2xl p-5 text-white text-sm">
          <p className="font-bold mb-2">How it works</p>
          <p className="opacity-80">Both students answer the same 10 questions on a topic. Highest score wins +100 XP. Full duel functionality coming soon!</p>
        </div>
      </div>
    </div>
  )
}
