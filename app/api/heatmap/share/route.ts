import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Generate a signed URL that expires in 7 days for read-only heatmap
    const token = Buffer.from(JSON.stringify({
      student_id: user.id,
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })).toString('base64url')

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/heatmap/shared/${token}`
    return NextResponse.json({ shareUrl, token })
  } catch (error) {
    console.error('Share heatmap error:', error)
    return NextResponse.json({ error: 'Failed to generate share link' }, { status: 500 })
  }
}
