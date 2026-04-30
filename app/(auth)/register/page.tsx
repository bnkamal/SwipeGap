'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { GraduationCap, BookOpen, Users } from 'lucide-react'

type Role = 'student' | 'mentor' | 'parent'

const ROLES = [
  { id: 'student' as Role, icon: GraduationCap, label: 'Student', desc: 'Find my knowledge gaps and connect with mentors' },
  { id: 'mentor'  as Role, icon: BookOpen,      label: 'Mentor',  desc: 'Help students and earn from my expertise' },
  { id: 'parent'  as Role, icon: Users,          label: 'Parent',  desc: 'Monitor my child\'s progress and learning' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<'role' | 'details'>('role')
  const [role, setRole] = useState<Role>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('users').insert({ id: data.user.id, email, role })
      router.push(role === 'mentor' ? '/onboarding/mentor' : role === 'parent' ? '/dashboard/parent' : '/onboarding/student')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="SwipeGap" width={200} height={64} priority />
          </div>
          <div className="hidden">
            <span className="text-white font-bold text-2xl">SG</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join SwipeGap free</p>
        </div>

        {step === 'role' ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 mb-4">I am a…</p>
            {ROLES.map(r => {
              const Icon = r.icon
              return (
                <button key={r.id} onClick={() => setRole(r.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${role === r.id ? 'border-brand-blue bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${role === r.id ? 'bg-brand-blue' : 'bg-gray-100'}`}>
                    <Icon size={20} className={role === r.id ? 'text-white' : 'text-gray-500'} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{r.label}</p>
                    <p className="text-xs text-gray-500">{r.desc}</p>
                  </div>
                </button>
              )
            })}
            <Button variant="primary" size="lg" className="w-full mt-4" onClick={() => setStep('details')}>
              Continue as {role.charAt(0).toUpperCase() + role.slice(1)} →
            </Button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                placeholder="you@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                placeholder="Minimum 8 characters" />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3">
              <Button type="button" variant="ghost" size="lg" className="flex-1" onClick={() => setStep('role')}>← Back</Button>
              <Button type="submit" variant="primary" size="lg" loading={loading} className="flex-1">Create account</Button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-blue font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
