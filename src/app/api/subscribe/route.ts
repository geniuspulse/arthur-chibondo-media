import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, email, name } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (action === 'subscribe') {
      // Check if already exists
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id, status, name')
        .eq('email', email)
        .single()

      if (existing && existing.status === 'active') {
        return NextResponse.json({ success: true, message: 'Already subscribed' })
      }

      if (existing) {
        // Reactivate
        const { error } = await supabase
          .from('newsletter_subscribers')
          .update({ status: 'active', name: name || existing.name })
          .eq('email', email)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      } else {
        // Insert new
        const { error } = await supabase
          .from('newsletter_subscribers')
          .insert({ email, name: name || email.split('@')[0], status: 'active' })
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Subscribed successfully' })
    }

    if (action === 'unsubscribe') {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ status: 'unsubscribed' })
        .eq('email', email)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, message: 'Unsubscribed' })
    }

    if (action === 'check') {
      const { data } = await supabase
        .from('newsletter_subscribers')
        .select('status')
        .eq('email', email)
        .eq('status', 'active')
        .single()
      return NextResponse.json({ subscribed: !!data })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
