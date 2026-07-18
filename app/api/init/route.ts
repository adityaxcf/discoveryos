import { NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/db'
import { DEMO_DATASET } from '@/lib/demo-data'
import { getCurrentDate, generateId } from '@/lib/utils'

export async function POST() {
  try {
    // Initialize database schema
    initializeDatabase()

    // Create default project if it doesn't exist
    const projectId = 'proj-default'
    const existing = db.prepare('SELECT id FROM research_projects WHERE id = ?').get(projectId)

    if (!existing) {
      db.prepare(`
        INSERT INTO research_projects (id, name, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(projectId, 'DiscoveryOS Default Project', 'Default project for research analysis', getCurrentDate(), getCurrentDate())

      // Insert segments
      for (const segment of DEMO_DATASET.segments) {
        db.prepare(`
          INSERT INTO user_segments (id, name, description, value_tier)
          VALUES (?, ?, ?, ?)
        `).run(segment.id, segment.name, segment.description, segment.value_tier)
      }

      // Insert demo sources
      for (const source of DEMO_DATASET.sources) {
        db.prepare(`
          INSERT INTO research_sources 
          (id, project_id, title, type, customer_name, segment, date, raw_content, analysis_status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          source.id,
          projectId,
          source.title,
          source.type,
          source.customer_name,
          source.segment,
          source.date,
          source.raw_content,
          'pending',
          getCurrentDate()
        )
      }
    }

    return NextResponse.json({
      success: true,
      projectId,
      message: 'Database initialized with demo data',
    })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ error: 'Failed to initialize' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const projectId = 'proj-default'
    const project = db.prepare('SELECT * FROM research_projects WHERE id = ?').get(projectId)
    const sourceCount = db.prepare('SELECT COUNT(*) as count FROM research_sources WHERE project_id = ?').get(projectId) as any

    return NextResponse.json({
      initialized: !!project,
      projectId,
      sourceCount: sourceCount?.count || 0,
    })
  } catch (error) {
    return NextResponse.json({ initialized: false })
  }
}
