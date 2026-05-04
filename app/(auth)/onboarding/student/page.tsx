'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

const GRADES = ['Year 3','Year 4','Year 5','Year 6','Year 7','Year 8','Year 9','Year 10','Year 11','Year 12','Class 9','Class 10','Class 11','Class 12']
const AU_EXAMS = ['Selective School Test','OC Test','HSC','VCE','NAPLAN','Yearly Assessments']
const IN_EXAMS = ['IIT JEE','EAMCET','NATA','CBSE Board','NEET','TOEFL','GRE']
const SUBJECTS = ['Mathematics','English','Physics','Chemistry','Biology','History','Geography','Computer Science','General Ability']

export default function StudentOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [country, setCountry] = useState<'AU' | 'IN'>('AU')
  const [grade, setGrade] = useState('')
  const [exams, setExams] = useState<string[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const toggleArr = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  // Check role on mount - redirect non-students away
  useState(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('users').select('role').eq('id', user.id).single().then(({ data }) => {
        if (data?.role === 'parent') router.replace('/dashboard/parent')
        if (data?.role === 'mentor') router.replace('/onboarding/mentor')
      })
    })
  })

  async function finish() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('student_profiles').upsert({
      user_id: user.id, name, grade, country, exam_targets: exams, subjects
    })
    // Create free subscription
    await supabase.from('subscriptions').upsert({ user_id: user.id, plan: 'free', status: 'active' })
    // Initialise streak
    await supabase.from('streaks').upsert({ student_id: user.id, current_streak: 0, longest_streak: 0 })
    router.push('/dashboard/student')
  }

  const chip = (label: string, active: boolean, onClick: () => void) => (
    <button key={label} onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${active ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-blue'}`}>
      {label}
    </button>
  )

  const steps = [
    // Step 0: Name
    <div key="name" className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">What's your name?</h2>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-brand-blue" />
      <Button variant="primary" size="lg" className="w-full" onClick={() => setStep(1)} disabled={!name.trim()}>Continue →</Button>
    </div>,
    // Step 1: Country
    <div key="country" className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Which country are you in?</h2>
      <div className="grid grid-cols-2 gap-4">
        {(['AU', 'IN'] as const).map(c => (
          <button key={c} onClick={() => setCountry(c)}
            className={`p-6 rounded-2xl border-2 text-center transition-all ${country === c ? 'border-brand-blue bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="text-4xl mb-2">{c === 'AU' ? '🇦🇺' : '🇮🇳'}</div>
            <p className="font-semibold">{c === 'AU' ? 'Australia' : 'India'}</p>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" size="lg" className="flex-1" onClick={() => setStep(0)}>← Back</Button>
        <Button variant="primary" size="lg" className="flex-1" onClick={() => setStep(2)}>Continue →</Button>
      </div>
    </div>,
    // Step 2: Grade
    <div key="grade" className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">What grade are you in?</h2>
      <div className="flex flex-wrap gap-2">
        {GRADES.filter(g => country === 'AU' ? g.startsWith('Year') : g.startsWith('Class')).map(g => chip(g, grade === g, () => setGrade(g)))}
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" size="lg" className="flex-1" onClick={() => setStep(1)}>← Back</Button>
        <Button variant="primary" size="lg" className="flex-1" onClick={() => setStep(3)} disabled={!grade}>Continue →</Button>
      </div>
    </div>,
    // Step 3: Exam targets
    <div key="exams" className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Which exams are you preparing for?</h2>
      <p className="text-sm text-gray-500">Select all that apply</p>
      <div className="flex flex-wrap gap-2">
        {(country === 'AU' ? AU_EXAMS : IN_EXAMS).map(e => chip(e, exams.includes(e), () => toggleArr(exams, setExams, e)))}
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" size="lg" className="flex-1" onClick={() => setStep(2)}>← Back</Button>
        <Button variant="primary" size="lg" className="flex-1" onClick={() => setStep(4)}>Continue →</Button>
      </div>
    </div>,
    // Step 4: Subjects
    <div key="subjects" className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Which subjects do you study?</h2>
      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map(s => chip(s, subjects.includes(s), () => toggleArr(subjects, setSubjects, s)))}
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" size="lg" className="flex-1" onClick={() => setStep(3)}>← Back</Button>
        <Button variant="primary" size="lg" loading={loading} className="flex-1" onClick={finish} disabled={subjects.length === 0}>Let's go! 🚀</Button>
      </div>
    </div>,
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="flex justify-center mb-6"><img src="/logo.png" alt="SwipeGap" style={{width:"200px", height:"auto"}} /></div>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <div className="mb-6">
          <div className="flex gap-1 mb-6">
            {[0,1,2,3,4].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-brand-blue' : 'bg-gray-200'}`} />)}
          </div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Step {step + 1} of 5</p>
        </div>
        {steps[step]}
      </div>
    </div>
  )
}
