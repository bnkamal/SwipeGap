'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{background:'linear-gradient(135deg, #0f2027 0%, #1A4D8F 40%, #0D7A5F 70%, #134e4a 100%)'}}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-teal-500 rounded-full opacity-10 blur-3xl" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-blue-400 rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-teal-300 rounded-full opacity-10 blur-3xl" />
        <div className="absolute top-16 left-10 bg-white/10 backdrop-blur-sm rounded-2xl p-4 w-32 rotate-[-12deg] hidden md:block">
          <div className="text-white/80 text-xs font-medium">Trigonometry</div>
          <div className="text-white/50 text-xs">Mathematics · HSC</div>
          <div className="mt-2 w-4 h-4 bg-green-400/60 rounded-full flex items-center justify-center text-xs text-white">✓</div>
        </div>
        <div className="absolute top-32 right-16 bg-white/10 backdrop-blur-sm rounded-2xl p-4 w-36 rotate-[8deg] hidden md:block">
          <div className="text-white/80 text-xs font-medium">Calculus</div>
          <div className="text-white/50 text-xs">Mathematics · HSC</div>
          <div className="mt-2 w-4 h-4 bg-red-400/60 rounded-full flex items-center justify-center text-xs text-white">✗</div>
        </div>
        <div className="absolute bottom-32 left-16 bg-white/10 backdrop-blur-sm rounded-2xl p-4 w-32 rotate-[6deg] hidden md:block">
          <div className="text-white/80 text-xs font-medium">Essay Writing</div>
          <div className="text-white/50 text-xs">English · HSC</div>
        </div>
        <div className="absolute bottom-48 right-10 bg-white/10 backdrop-blur-sm rounded-2xl p-4 w-36 rotate-[-6deg] hidden md:block">
          <div className="text-white/80 text-xs font-medium">Organic Chemistry</div>
          <div className="text-white/50 text-xs">Chemistry · JEE</div>
        </div>
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <img src="/logo.png" alt="SwipeGap" style={{width:"320px", height:"auto"}} />
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Welcome back 👋</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to SwipeGap</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@email.com"
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-brand-blue bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-brand-blue bg-gray-50" />
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">Sign in</Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-blue font-semibold hover:underline">Create one free</Link>
          </p>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[{value:'200+',label:'Topics'},{value:'AI',label:'Powered'},{value:'K-12',label:'Focus'}].map(s=>(
            <div key={s.label} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl py-3">
              <div className="text-white font-bold text-lg">{s.value}</div>
              <div className="text-white/60 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
