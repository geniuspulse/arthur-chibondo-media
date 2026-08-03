import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  revalidatePath('/')
  revalidatePath('/articles')
  return NextResponse.json({ revalidated: true })
}
