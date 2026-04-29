import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { topics, grade, examTargets } = await req.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey || apiKey.trim() === '') {
      console.error('ANTHROPIC_API_KEY is missing or empty')
      return NextResponse.json({ priorities: [] })
    }

    const prompt = `You are a study planner for K-12 students.
Grade: ${grade}. Exam targets: ${examTargets?.join(', ')}.

Topics needing study:
${topics.map((t: any, i: number) => `${i+1}. [${t.id}] ${t.title} (${t.subject}, ${t.exam_tag})`).join('\n')}

Assign each topic a priority score 1-100 and level High/Medium/Low.
Return ONLY a JSON array, no other text:
[{"id":"topic-id-here","score":85,"level":"High","reason":"Core HSC topic"}]`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.trim(),
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', response.status, err)
      return NextResponse.json({ priorities: [] })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || '[]'
    const match = text.match(/\[[\s\S]*\]/)
    const priorities = match ? JSON.parse(match[0]) : []

    return NextResponse.json({ priorities })
  } catch (error) {
    console.error('Prioritise plan error:', error)
    return NextResponse.json({ priorities: [] })
  }
}
