import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { swipes } = await req.json() as {
      swipes: { topic_id: string; direction: 'left' | 'right' }[]
    }

    // Batch insert all swipe events
    const swipeRows = swipes.map(s => ({
      student_id: user.id,
      topic_id: s.topic_id,
      direction: s.direction,
    }))

    const { error: swipeError } = await supabase
      .from('swipe_events')
      .insert(swipeRows)

    if (swipeError) throw swipeError

    // Update learning plan — upsert left-swipes as pending
    const leftSwipes = swipes.filter(s => s.direction === 'left')
    if (leftSwipes.length > 0) {
      const planRows = leftSwipes.map(s => ({
        student_id: user.id,
        topic_id: s.topic_id,
        status: 'pending',
        priority: 50,
      }))
      await supabase.from('learning_plans').upsert(planRows, { onConflict: 'student_id,topic_id' })
    }

    // Award 10 XP for completing the session
    await supabase.from('xp_log').insert({
      student_id: user.id,
      action: 'swipe_session_completed',
      points: 10,
    })

    // Update streak
    const today = new Date().toISOString().split('T')[0]
    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('student_id', user.id)
      .single()

    if (streak) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const isConsecutive = streak.last_swipe_date === yesterday
      const alreadyDoneToday = streak.last_swipe_date === today

      if (!alreadyDoneToday) {
        const newStreak = isConsecutive ? streak.current_streak + 1 : 1
        await supabase.from('streaks').update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, streak.longest_streak),
          last_swipe_date: today,
        }).eq('student_id', user.id)

        // Award streak milestone badges
        if (newStreak === 7) {
          await supabase.from('badges').upsert({ student_id: user.id, badge_type: '7_day_streak' }, { onConflict: 'student_id,badge_type' })
        }
        if (newStreak === 30) {
          await supabase.from('badges').upsert({ student_id: user.id, badge_type: '30_day_streak' }, { onConflict: 'student_id,badge_type' })
        }
      }
    } else {
      // First ever swipe — init streak
      await supabase.from('streaks').insert({
        student_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        last_swipe_date: today,
      })
    }

    // First swipe badge
    const { count } = await supabase
      .from('swipe_events')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', user.id)

    if (count === swipes.length) {
      await supabase.from('badges').upsert(
        { student_id: user.id, badge_type: 'first_swipe' },
        { onConflict: 'student_id,badge_type' }
      )
    }

    return NextResponse.json({ success: true, xp_awarded: 10 })
  } catch (error) {
    console.error('Swipe session error:', error)
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 })
  }
}
