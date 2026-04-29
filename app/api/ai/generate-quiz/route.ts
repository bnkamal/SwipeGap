import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic()

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { topic } = await req.json()

    const prompt = `Generate exactly 2 multiple-choice quiz questions to verify a student's confidence on this topic.

Topic: ${topic.title}
Subject: ${topic.subject}
Grade: ${topic.grade}
Hint context: ${topic.hint}

Requirements:
- Questions must test genuine understanding, not just memorisation
- Each question has exactly 4 options (A, B, C, D)
- Only one correct answer per question
- Difficulty: moderate (would catch overconfident students)
- Language appropriate for ${topic.grade} level

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of why this is correct"
    },
    {
      "id": "q2",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 2,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response')

    const match = content.text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON found')
    const quiz = JSON.parse(match[0])

    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Quiz generation error:', error)
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 })
  }
}
