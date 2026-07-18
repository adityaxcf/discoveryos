import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ResearchSource } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId') || 'proj-default'

    const { data, error } = await db
      .from('research_sources')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: false })

    if (error) {
      throw error
    }

    const sources = (data || []) as ResearchSource[]

    return NextResponse.json(sources)
  } catch (error) {
    console.error('Error fetching sources:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch sources',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}