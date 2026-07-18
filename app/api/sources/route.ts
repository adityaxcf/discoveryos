import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ResearchSource } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId') || 'proj-default'

    const sources = db
      .prepare('SELECT * FROM research_sources WHERE project_id = ? ORDER BY date DESC')
      .all(projectId) as ResearchSource[]

    return NextResponse.json(sources)
  } catch (error) {
    console.error('Error fetching sources:', error)
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 })
  }
}
