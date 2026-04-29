import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
const client = new Anthropic()
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { gapTopics, mentors } = await req.json()
    const prompt = `Match student gaps to mentors.\nGaps: ${gapTopics.map((t: any)=>`${t.title} (${t.subject})`).join(', ')}\nMentors: ${mentors.map((m: any)=>`[${m.user_id}] ${m.name}: ${m.subjects?.join(', ')}`).join('\n')}\nReturn ONLY JSON: [{"id":"user_id","score":90,"reason":"brief"}]`
    const message = await client.messages.create({ model: 'claude-sonnet-4-5', max_tokens: 500, messages: [{ role: 'user', content: prompt }] })
    const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
    const match = text.match(/\[[\s\S]*\]/)
    return NextResponse.json({ ranked: match ? JSON.parse(match[0]) : [] })
  } catch (e) { return NextResponse.json({ ranked: [] }) }
}
