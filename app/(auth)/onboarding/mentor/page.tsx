'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

const SUBJECTS = ['Mathematics','English','Physics','Chemistry','Biology','History','Geography','Computer Science','General Ability','Science']
const QUALIFICATIONS = ['Currently studying (University)','Bachelor Degree','Master Degree','PhD','Qualified Teacher','Retired Educator','Subject Matter Expert','Other']
const RATES_AU = ['$20–30/session','$30–50/session','$50–80/session','$80–120/session','$120+/session']
const RATES_IN = ['₹200–500/session','₹500–1000/session','₹1000–2000/session','₹2000+/session']

export default function MentorOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [subjects, setSubjects] = useState<string[]>([])
  const [qualification, setQualification] = useState('')
  const [rate, setRate] = useState('')
  const [bio, setBio] = useState('')
  const [country, setCountry] = useState<'AU'|'IN'>('AU')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleSubject = (s: string) =>
    setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const chip = (label: string, active: boolean, onClick: () => void) => (
    <button key={label} onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${active ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-blue'}`}>
      {label}
    </button>
  )

  async function finish() {
    if (!bio.trim() || bio.length < 30) {
      setError('Please write at least 30 characters about yourself')
      return
    }
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { error: profileError } = await supabase
      .from('mentor_profiles')
      .upsert({
        user_id: user.id,
        name,
        subjects,
        qualifications: qualification,
        hourly_rate: 0,
        bio: `${rate} · ${bio}`,
        verified: false,
      })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    // Create free mentor subscription
    await supabase.from('subscriptions').upsert(
      { user_id: user.id, plan: 'free', status: 'active' },
      { onConflict: 'user_id' }
    )

    router.push('/dashboard/mentor')
  }

  const steps = [
    // Step 0 — Name
    <div key="name" className="space-y-4">
      <div className="text-4xl mb-2">👋</div>
      <h2 className="text-xl font-bold text-gray-900">What's your name?</h2>
      <p className="text-sm text-gray-500">This is how students will see you on the platform</p>
      <input value={name} onChange={e => setName(e.target.value)}
        placeholder="Your full name"
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-brand-blue" />
      <Button variant="primary" size="lg" className="w-full" onClick={() => setStep(1)} disabled={!name.trim()}>
        Continue →
      </Button>
    </div>,

    // Step 1 — Country
    <div key="country" className="space-y-4">
      <div className="text-4xl mb-2">🌏</div>
      <h2 className="text-xl font-bold text-gray-900">Which country are you in?</h2>
      <div className="grid grid-cols-2 gap-4">
        {(['AU','IN'] as const).map(c => (
          <button key={c} onClick={() => setCountry(c)}
            className={`p-5 rounded-2xl border-2 text-center transition-all ${country === c ? 'border-brand-blue bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="text-3xl mb-2">{c === 'AU' ? '🇦🇺' : '🇮🇳'}</div>
            <p className="font-semibold text-sm">{c === 'AU' ? 'Australia' : 'India'}</p>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" size="lg" className="flex-1" onClick={() => setStep(0)}>← Back</Button>
        <Button variant="primary" size="lg" className="flex-1" onClick={() => setStep(2)}>Continue →</Button>
      </div>
    </div>,

    // Step 2 — Subjects
    <div key="subjects" className="space-y-4">
      <div className="text-4xl mb-2">📚</div>
      <h2 className="text-xl font-bold text-gray-900">Which subjects can you teach?</h2>
      <p className="text-sm text-gray-500">Select all that apply — students will be matched to you based on these</p>
      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map(s => chip(s, subjects.includes(s), () => toggleSubject(s)))}
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" size="lg" className="flex-1" onClick={() => setStep(1)}>← Back</Button>
        <Button variant="primary" size="lg" className="flex-1" onClick={() => setStep(3)} disabled={subjects.length === 0}>
          Continue →
        </Button>
      </div>
    </div>,

    // Step 3 — Qualification
    <div key="qual" className="space-y-4">
      <div className="text-4xl mb-2">🎓</div>
      <h2 className="text-xl font-bold text-gray-900">What's your highest qualification?</h2>
      <div className="space-y-2">
        {QUALIFICATIONS.map(q => (
          <button key={q} onClick={() => setQualification(q)}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${qualification === q ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
            {q}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" size="lg" className="flex-1" onClick={() => setStep(2)}>← Back</Button>
        <Button variant="primary" size="lg" className="flex-1" onClick={() => setStep(4)} disabled={!qualification}>
          Continue →
        </Button>
      </div>
    </div>,

    // Step 4 — Rate
    <div key="rate" className="space-y-4">
      <div className="text-4xl mb-2">💰</div>
      <h2 className="text-xl font-bold text-gray-900">What's your session rate?</h2>
      <p className="text-sm text-gray-500">You can change this anytime from your dashboard</p>
      <div className="space-y-2">
        {(country === 'AU' ? RATES_AU : RATES_IN).map(r => (
          <button key={r} onClick={() => setRate(r)}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${rate === r ? 'border-brand-teal bg-teal-50 text-brand-teal' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
            {r}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" size="lg" className="flex-1" onClick={() => setStep(3)}>← Back</Button>
        <Button variant="primary" size="lg" className="flex-1" onClick={() => setStep(5)} disabled={!rate}>
          Continue →
        </Button>
      </div>
    </div>,

    // Step 5 — Bio
    <div key="bio" className="space-y-4">
      <div className="text-4xl mb-2">✍️</div>
      <h2 className="text-xl font-bold text-gray-900">Tell students about yourself</h2>
      <p className="text-sm text-gray-500">A good bio helps students trust you. Mention your experience and teaching style.</p>
      <textarea value={bio} onChange={e => { setBio(e.target.value); setError('') }}
        placeholder="e.g. I'm a Year 12 student at UNSW studying Computer Science. I've tutored HSC Maths for 2 years and love breaking down complex topics into simple steps..."
        rows={5}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-blue resize-none" />
      <p className="text-xs text-gray-400 text-right">{bio.length} characters {bio.length < 30 ? `(need ${30 - bio.length} more)` : '✓'}</p>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs text-amber-700 font-medium">📋 After registering, your profile will be reviewed by our team before being shown to students. You'll be notified when approved.</p>
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" size="lg" className="flex-1" onClick={() => setStep(4)}>← Back</Button>
        <Button variant="primary" size="lg" loading={loading} className="flex-1" onClick={finish} disabled={bio.length < 30}>
          Submit profile 🚀
        </Button>
      </div>
    </div>,
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="flex justify-center mb-6"><img src="/logo.png" alt="SwipeGap" style={{width:"200px", height:"auto"}} /></div>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex gap-1 mb-3">
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-brand-teal' : 'bg-gray-200'}`} />
            ))}
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Step {step + 1} of 6</p>
            <p className="text-xs text-gray-400">Mentor registration</p>
          </div>
        </div>
        {steps[step]}
      </div>
    </div>
  )
}
