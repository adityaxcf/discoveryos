import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AtomicInsight } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sourceId = searchParams.get('sourceId')

    let query = 'SELECT * FROM atomic_insights'
    const params: any[] = []

    if (sourceId) {
      query += ' WHERE source_id = ?'
      params.push(sourceId)
    }

    const insights = db.prepare(query + ' ORDER BY created_at DESC').all(...params) as AtomicInsight[]

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
  }
}
