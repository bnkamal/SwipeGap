import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
const client = new Anthropic()
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { studentName, swipesThisWeek, gapsClosed, sessionsBooked, xpEarned } = await req.json()
    const prompt = `Write 2-3 warm encouraging sentences for a parent about their child ${studentName}'s study week: ${swipesThisWeek} topics swiped, ${gapsClosed} gaps closed, ${sessionsBooked} sessions booked, ${xpEarned} XP earned. Plain paragraph only.`
    const message = await client.messages.create({ model: 'claude-sonnet-4-5', max_tokens: 200, messages: [{ role: 'user', content: prompt }] })
    const summary = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ summary })
  } catch (e) { return NextResponse.json({ summary: '' }) }
}
