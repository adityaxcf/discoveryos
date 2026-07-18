import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_DATASET } from '@/lib/demo-data'
import { getCurrentDate } from '@/lib/utils'

const projectId = 'proj-default'

export async function POST() {
  try {
    // Check whether default project already exists
    const { data: existing, error: checkError } = await db
      .from('research_projects')
      .select('id')
      .eq('id', projectId)
      .maybeSingle()

    if (checkError) {
      throw checkError
    }

    if (!existing) {
      const now = getCurrentDate()

      // Create default project
      const { error: projectError } = await db
        .from('research_projects')
        .insert({
          id: projectId,
          name: 'DiscoveryOS Default Project',
          description: 'Default project for research analysis',
          created_at: now,
          updated_at: now,
        })

      if (projectError) {
        throw projectError
      }

      // Insert demo user segments
      if (DEMO_DATASET.segments.length > 0) {
        const segments = DEMO_DATASET.segments.map((segment) => ({
          id: segment.id,
          name: segment.name,
          description: segment.description,
          value_tier: segment.value_tier,
        }))

        const { error: segmentError } = await db
          .from('user_segments')
          .upsert(segments, {
            onConflict: 'id',
          })

        if (segmentError) {
          throw segmentError
        }
      }

      // Insert demo research sources
      if (DEMO_DATASET.sources.length > 0) {
        const sources = DEMO_DATASET.sources.map((source) => ({
          id: source.id,
          project_id: projectId,
          title: source.title,
          type: source.type,
          customer_name: source.customer_name || null,
          segment: source.segment,
          date: source.date,
          raw_content: source.raw_content,
          analysis_status: 'pending',
          created_at: now,
        }))

        const { error: sourcesError } = await db
          .from('research_sources')
          .upsert(sources, {
            onConflict: 'id',
          })

        if (sourcesError) {
          throw sourcesError
        }
      }
    }

    return NextResponse.json({
      success: true,
      projectId,
      message: 'Database initialized with demo data',
    })
  } catch (error) {
    console.error('Init error:', error)

    return NextResponse.json(
      {
        error: 'Failed to initialize',
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get default project
    const { data: project, error: projectError } = await db
      .from('research_projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle()

    if (projectError) {
      throw projectError
    }

    // Count research sources
    const { count, error: countError } = await db
      .from('research_sources')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('project_id', projectId)

    if (countError) {
      throw countError
    }

    return NextResponse.json({
      initialized: !!project,
      projectId,
      sourceCount: count || 0,
    })
  } catch (error) {
    console.error('Init GET error:', error)

    return NextResponse.json({
      initialized: false,
      projectId,
      sourceCount: 0,
    })
  }
}