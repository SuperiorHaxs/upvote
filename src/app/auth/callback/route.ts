import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if profile exists, create one if not
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        // Generate username from email or Google name
        const email = data.user.email || ''
        const googleName = data.user.user_metadata?.full_name || ''
        const baseUsername = googleName
          ? googleName.toLowerCase().replace(/[^a-z0-9]/g, '')
          : email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')

        // Add random suffix to avoid conflicts
        const username = `${baseUsername}${Math.floor(Math.random() * 1000)}`

        await supabase.from('profiles').insert({
          id: data.user.id,
          username,
          avatar_url: data.user.user_metadata?.avatar_url || null,
          current_streak: 0,
          longest_streak: 0,
          total_votes: 0,
          judge_score: 0,
          wins: 0,
          losses: 0,
        })
      }
    }
  }

  return NextResponse.redirect(`${origin}/`)
}
