import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Theme } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId') || 'proj-default'

    const { data, error } = await db
      .from('themes')
      .select('*')
      .eq('project_id', projectId)
      .order('opportunity_score', { ascending: false })

    if (error) {
      throw error
    }

    const themes = (data || []).map((theme) => ({
      ...theme,

      // These were stored as JSON strings,
      // so convert them back into JS objects/arrays.
      affected_segments:
        typeof theme.affected_segments === 'string'
          ? JSON.parse(theme.affected_segments || '[]')
          : theme.affected_segments || [],

      score_breakdown:
        typeof theme.score_breakdown === 'string'
          ? JSON.parse(theme.score_breakdown || '{}')
          : theme.score_breakdown || {},
    })) as Theme[]

    return NextResponse.json(themes)
  } catch (error) {
    console.error('Error fetching themes:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch themes',
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    )
  }
}