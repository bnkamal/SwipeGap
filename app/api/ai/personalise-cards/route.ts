import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic()

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { topics, studentProfile, swipeHistory } = await req.json()

    const prompt = `You are an AI tutor helping prioritise study topics for a student.

Student profile:
- Grade: ${studentProfile.grade}
- Country: ${studentProfile.country}
- Exam targets: ${studentProfile.exam_targets?.join(', ')}
- Subjects: ${studentProfile.subjects?.join(', ')}

Recent swipe history (last 20):
${swipeHistory?.slice(0, 20).map((s: {title: string, direction: string}) => `- ${s.title}: ${s.direction}`).join('\n') || 'No history yet'}

Topics to prioritise (return as JSON array of IDs in recommended order):
${topics.map((t: {id: string, title: string, subject: string, exam_tag: string}) => `- ID: ${t.id} | ${t.subject} | ${t.title} | Exam: ${t.exam_tag}`).join('\n')}

Return ONLY a valid JSON array of topic IDs in the optimal study order. Prioritise:
1. Topics relevant to the student's exam targets
2. Topics in subjects they've been struggling with (left-swiped recently)
3. Mix subjects to maintain engagement
4. Avoid repeating recently right-swiped topics

Example response format: ["id1","id2","id3"]`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    // Extract JSON array from response
    const match = content.text.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON array found in response')
    const orderedIds: string[] = JSON.parse(match[0])

    return NextResponse.json({ orderedIds })
  } catch (error) {
    console.error('AI personalise-cards error:', error)
    // Fallback: return topics in original order
    const { topics } = await req.json().catch(() => ({ topics: [] }))
    return NextResponse.json({ orderedIds: topics.map((t: {id: string}) => t.id) })
  }
}
