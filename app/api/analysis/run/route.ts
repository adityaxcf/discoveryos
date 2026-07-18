import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateId, getCurrentDate } from '@/lib/utils'
import { extractInsights, groupInsights, analyzeSeverity, scoreThemes, generateEvidence, generateReport } from '@/lib/ai-pipeline'
import { ResearchSource, Theme } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const { projectId = 'proj-default' } = await request.json()

    // Create analysis run record
    const runId = generateId()
    const stagesData = {}
    const results = {}

    db.prepare(`
      INSERT INTO analysis_runs 
      (id, project_id, status, current_stage, stages_data, results, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(runId, projectId, 'running', 'extract', JSON.stringify(stagesData), JSON.stringify(results), getCurrentDate(), getCurrentDate())

    // Stage 1: Extract Insights
    console.log('Stage 1: Extracting insights...')
    const sources = db
      .prepare('SELECT * FROM research_sources WHERE project_id = ?')
      .all(projectId) as ResearchSource[]

    const insights = await extractInsights(sources)
    db.prepare('UPDATE analysis_runs SET current_stage = ? WHERE id = ?').run('group', runId)

    // Save insights
    for (const insight of insights) {
      db.prepare(`
        INSERT INTO atomic_insights
        (id, source_id, statement, quote, sentiment, confidence, segment, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        insight.id,
        insight.source_id,
        insight.statement,
        insight.quote,
        insight.sentiment,
        insight.confidence,
        insight.segment,
        insight.created_at
      )
    }

    // Stage 2: Group Insights
    console.log('Stage 2: Grouping insights...')
    let themes = await groupInsights(insights, sources)
    db.prepare('UPDATE analysis_runs SET current_stage = ? WHERE id = ?').run('segment', runId)

    // Stage 3: Analyze Severity
    console.log('Stage 3: Analyzing severity...')
    themes = await analyzeSeverity(themes)
    db.prepare('UPDATE analysis_runs SET current_stage = ? WHERE id = ?').run('score', runId)

    // Stage 4: Score and Prioritize
    console.log('Stage 4: Scoring themes...')
    themes = await scoreThemes(themes)
    db.prepare('UPDATE analysis_runs SET current_stage = ? WHERE id = ?').run('evidence', runId)

    // Save themes
    for (const theme of themes) {
      const themeWithProject = {
        ...theme,
        project_id: projectId,
      }

      db.prepare(`
        INSERT INTO themes
        (id, project_id, name, description, insight_count, source_count, affected_segments, confidence, severity, business_impact, opportunity_score, score_breakdown, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        themeWithProject.id,
        themeWithProject.project_id,
        themeWithProject.name,
        themeWithProject.description,
        themeWithProject.insight_count,
        themeWithProject.source_count,
        JSON.stringify(themeWithProject.affected_segments),
        themeWithProject.confidence,
        themeWithProject.severity,
        themeWithProject.business_impact,
        themeWithProject.opportunity_score,
        JSON.stringify(themeWithProject.score_breakdown),
        themeWithProject.created_at
      )
    }

    // Stage 5: Generate Evidence
    console.log('Stage 5: Generating evidence...')
    const sourcesMap = new Map(sources.map((s) => [s.id, s]))
    const evidence = await generateEvidence(themes, insights, sourcesMap)
    db.prepare('UPDATE analysis_runs SET current_stage = ? WHERE id = ?').run('report', runId)

    // Save evidence
    for (const ev of evidence) {
      db.prepare(`
        INSERT INTO evidence
        (id, theme_id, source_id, quote, context, sentiment, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(ev.id, ev.theme_id, ev.source_id, ev.quote, ev.context, ev.sentiment, ev.created_at)
    }

    // Stage 6: Generate Report
    console.log('Stage 6: Generating report...')
    const report = await generateReport(themes, insights)

    // Finalize
    db.prepare('UPDATE analysis_runs SET status = ?, current_stage = ?, updated_at = ? WHERE id = ?').run('completed', 'report', getCurrentDate(), runId)

    return NextResponse.json({
      runId,
      status: 'completed',
      insights: insights.length,
      themes: themes.length,
      evidence: evidence.length,
      report: report.substring(0, 500),
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed', details: String(error) }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const runId = searchParams.get('runId')

    if (!runId) {
      return NextResponse.json({ error: 'runId required' }, { status: 400 })
    }

    const run = db.prepare('SELECT * FROM analysis_runs WHERE id = ?').get(runId)

    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 })
    }

    return NextResponse.json(run)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch run' }, { status: 500 })
  }
}
