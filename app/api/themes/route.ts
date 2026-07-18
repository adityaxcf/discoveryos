import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Theme } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId') || 'proj-default'

    const themes = db
      .prepare('SELECT * FROM themes WHERE project_id = ? ORDER BY opportunity_score DESC')
      .all(projectId) as any[]

    const parsed = themes.map((t) => ({
      ...t,
      affected_segments: JSON.parse(t.affected_segments || '[]'),
      score_breakdown: JSON.parse(t.score_breakdown || '{}'),
    }))

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Error fetching themes:', error)
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 })
  }
}
