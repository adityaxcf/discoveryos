import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AtomicInsight } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sourceId = searchParams.get('sourceId')

    let query = db
      .from('atomic_insights')
      .select('*')
      .order('created_at', { ascending: false })

    if (sourceId) {
      query = query.eq('source_id', sourceId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    const insights = (data || []) as AtomicInsight[]

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Error fetching insights:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch insights',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}