import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Evidence } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const themeId = searchParams.get('themeId')
    const sourceId = searchParams.get('sourceId')

    let query = 'SELECT * FROM evidence'
    const params: any[] = []

    if (themeId) {
      query += ' WHERE theme_id = ?'
      params.push(themeId)
    } else if (sourceId) {
      query += ' WHERE source_id = ?'
      params.push(sourceId)
    }

    query += ' ORDER BY created_at DESC'

    const evidence = db.prepare(query).all(...params) as any[]

    // Enrich with source information if available
    const enriched = evidence.map((e) => {
      const source = db.prepare('SELECT * FROM research_sources WHERE id = ?').get(e.source_id) as any
      const theme = db.prepare('SELECT * FROM themes WHERE id = ?').get(e.theme_id) as any
      return {
        ...e,
        source,
        theme,
      }
    })

    return NextResponse.json(enriched)
  } catch (error) {
    console.error('Error fetching evidence:', error)
    return NextResponse.json({ error: 'Failed to fetch evidence' }, { status: 500 })
  }
}
