'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Sheet { id: string; title: string; subject: string; exam_tag: string; price: number; downloads: number; file_url: string }

export default function MarketplacePage() {
  const router = useRouter()
  const supabase = createClient()
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState<string|null>(null)

  useEffect(() => {
    supabase.from('cheatsheets').select('*').eq('approved', true).order('downloads', { ascending: false })
      .then(({ data }) => { setSheets(data || []); setLoading(false) })
  }, [])

  async function handleBuy(sheet: Sheet) {
    setBuying(sheet.id)
    try {
      const res = await fetch('/api/cheatsheets/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cheatsheet_id: sheet.id, price: sheet.price, title: sheet.title, mentor_id: '' })
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch(e) { alert('Purchase failed') }
    setBuying(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push('/dashboard/student')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            &larr;
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Cheatsheet Marketplace</h1>
            <p className="text-xs text-gray-500">{sheets.length} cheatsheets available</p>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-2xl"/>)}
          </div>
        ) : sheets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">📄</div>
            <h3 className="font-medium text-gray-700">No cheatsheets yet</h3>
            <p className="text-sm text-gray-400 mt-1">Be the first to upload one!</p>
            <button onClick={() => router.push('/dashboard/mentor/cheatsheets')}
              className="mt-4 bg-brand-blue text-white px-4 py-2 rounded-xl text-sm">
              Upload
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sheets.map(sheet => (
              <div key={sheet.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{sheet.title}</h3>
                <div className="flex gap-1.5 mb-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{sheet.subject}</span>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{sheet.exam_tag}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-brand-blue">${sheet.price}</span>
                  <span className="text-xs text-gray-400">📥 {sheet.downloads}</span>
                </div>
                <button onClick={() => handleBuy(sheet)} disabled={buying === sheet.id}
                  className="w-full bg-brand-blue text-white text-sm py-2 rounded-xl hover:bg-blue-800 disabled:opacity-50">
                  {buying === sheet.id ? 'Redirecting...' : 'Buy $' + sheet.price}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
