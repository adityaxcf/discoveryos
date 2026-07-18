import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const themeId = searchParams.get('themeId')
    const sourceId = searchParams.get('sourceId')

    // Supabase can fetch the related source + theme
    // in the same query using the foreign-key relationships.
    let query = db
      .from('evidence')
      .select(`
        *,
        source:research_sources(*),
        theme:themes(*)
      `)
      .order('created_at', { ascending: false })

    if (themeId) {
      query = query.eq('theme_id', themeId)
    } else if (sourceId) {
      query = query.eq('source_id', sourceId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    const enriched = (data || []).map((item) => ({
      ...item,

      // Parse JSON fields inside the related theme
      // so the frontend receives the same structure as before.
      theme: item.theme
        ? {
            ...item.theme,

            affected_segments:
              typeof item.theme.affected_segments === 'string'
                ? JSON.parse(
                    item.theme.affected_segments || '[]'
                  )
                : item.theme.affected_segments || [],

            score_breakdown:
              typeof item.theme.score_breakdown === 'string'
                ? JSON.parse(
                    item.theme.score_breakdown || '{}'
                  )
                : item.theme.score_breakdown || {},
          }
        : null,
    }))

    return NextResponse.json(enriched)
  } catch (error) {
    console.error('Error fetching evidence:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch evidence',
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    )
  }
}