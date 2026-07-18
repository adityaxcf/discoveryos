import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateId, getCurrentDate } from '@/lib/utils'
import {
  extractInsights,
  groupInsights,
  analyzeSeverity,
  scoreThemes,
  generateEvidence,
  generateReport,
} from '@/lib/ai-pipeline'
import { ResearchSource } from '@/lib/types'

export async function POST(request: Request) {
  const runId = generateId()

  try {
    const { projectId = 'proj-default' } = await request.json()
    const now = getCurrentDate()

    // Create analysis run
    const { error: runError } = await db
      .from('analysis_runs')
      .insert({
        id: runId,
        project_id: projectId,
        status: 'running',
        current_stage: 'extract',
        stages_data: JSON.stringify({}),
        results: JSON.stringify({}),
        created_at: now,
        updated_at: now,
      })

    if (runError) throw runError

    // Fetch research sources
    const { data: sourceData, error: sourcesError } = await db
      .from('research_sources')
      .select('*')
      .eq('project_id', projectId)

    if (sourcesError) throw sourcesError

    const sources = (sourceData || []) as ResearchSource[]

    if (sources.length === 0) {
      throw new Error(
        'No research sources found. Initialize the demo dataset first.'
      )
    }

    /*
     * Clear previous analysis data.
     * Evidence must be deleted before themes,
     * and insights after evidence/themes because of foreign keys.
     */

    const { data: oldThemes, error: oldThemesError } = await db
      .from('themes')
      .select('id')
      .eq('project_id', projectId)

    if (oldThemesError) throw oldThemesError

    const oldThemeIds = (oldThemes || []).map((theme) => theme.id)

    if (oldThemeIds.length > 0) {
      const { error: evidenceDeleteError } = await db
        .from('evidence')
        .delete()
        .in('theme_id', oldThemeIds)

      if (evidenceDeleteError) throw evidenceDeleteError

      const { error: joinDeleteError } = await db
        .from('theme_insights')
        .delete()
        .in('theme_id', oldThemeIds)

      if (joinDeleteError) throw joinDeleteError

      const { error: themeDeleteError } = await db
        .from('themes')
        .delete()
        .eq('project_id', projectId)

      if (themeDeleteError) throw themeDeleteError
    }

    const sourceIds = sources.map((source) => source.id)

    if (sourceIds.length > 0) {
      const { error: insightDeleteError } = await db
        .from('atomic_insights')
        .delete()
        .in('source_id', sourceIds)

      if (insightDeleteError) throw insightDeleteError
    }

    // -----------------------------
    // Stage 1: Extract Insights
    // -----------------------------

    console.log('Stage 1: Extracting insights...')

    const insights = await extractInsights(sources)

    if (insights.length > 0) {
      const { error: insightsInsertError } = await db
        .from('atomic_insights')
        .insert(
          insights.map((insight) => ({
            id: insight.id,
            source_id: insight.source_id,
            statement: insight.statement,
            quote: insight.quote,
            sentiment: insight.sentiment,
            confidence: insight.confidence,
            segment: insight.segment,
            created_at: insight.created_at,
          }))
        )

      if (insightsInsertError) throw insightsInsertError
    }

    await updateRun(runId, 'group')

    // -----------------------------
    // Stage 2: Group Insights
    // -----------------------------

    console.log('Stage 2: Grouping insights...')

    let themes = await groupInsights(insights, sources)

    await updateRun(runId, 'segment')

    // -----------------------------
    // Stage 3: Analyze Severity
    // -----------------------------

    console.log('Stage 3: Analyzing severity...')

    themes = await analyzeSeverity(themes)

    await updateRun(runId, 'score')

    // -----------------------------
    // Stage 4: Score Themes
    // -----------------------------

    console.log('Stage 4: Scoring themes...')

    themes = await scoreThemes(themes)

    if (themes.length > 0) {
      const { error: themesInsertError } = await db
        .from('themes')
        .insert(
          themes.map((theme) => ({
            id: theme.id,
            project_id: projectId,
            name: theme.name,
            description: theme.description,
            insight_count: theme.insight_count,
            source_count: theme.source_count,
            affected_segments: JSON.stringify(theme.affected_segments),
            confidence: theme.confidence,
            severity: theme.severity,
            business_impact: theme.business_impact,
            opportunity_score: theme.opportunity_score,
            score_breakdown: JSON.stringify(
              theme.score_breakdown || {}
            ),
            created_at: theme.created_at,
          }))
        )

      if (themesInsertError) throw themesInsertError
    }

    await updateRun(runId, 'evidence')

    // -----------------------------
    // Stage 5: Generate Evidence
    // -----------------------------

    console.log('Stage 5: Generating evidence...')

    const sourcesMap = new Map(
      sources.map((source) => [source.id, source])
    )

    const evidence = await generateEvidence(
      themes,
      insights,
      sourcesMap
    )

    if (evidence.length > 0) {
      const { error: evidenceInsertError } = await db
        .from('evidence')
        .insert(
          evidence.map((item) => ({
            id: item.id,
            theme_id: item.theme_id,
            source_id: item.source_id,
            quote: item.quote,
            context: item.context,
            sentiment: item.sentiment,
            created_at: item.created_at,
          }))
        )

      if (evidenceInsertError) throw evidenceInsertError
    }

    await updateRun(runId, 'report')

    // -----------------------------
    // Stage 6: Generate Report
    // -----------------------------

    console.log('Stage 6: Generating report...')

    const report = await generateReport(themes, insights)

    // Finalize run
    const { error: completeError } = await db
      .from('analysis_runs')
      .update({
        status: 'completed',
        current_stage: 'report',
        results: JSON.stringify({
          insightCount: insights.length,
          themeCount: themes.length,
          evidenceCount: evidence.length,
          report,
        }),
        updated_at: getCurrentDate(),
      })
      .eq('id', runId)

    if (completeError) throw completeError

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

    // Best effort: mark run as failed
    try {
      await db
        .from('analysis_runs')
        .update({
          status: 'failed',
          updated_at: getCurrentDate(),
        })
        .eq('id', runId)
    } catch {
      // Ignore secondary failure
    }

    return NextResponse.json(
      {
        error: 'Analysis failed',
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    )
  }
}

async function updateRun(
  runId: string,
  currentStage: string
) {
  const { error } = await db
    .from('analysis_runs')
    .update({
      current_stage: currentStage,
      updated_at: getCurrentDate(),
    })
    .eq('id', runId)

  if (error) throw error
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const runId = searchParams.get('runId')

    if (!runId) {
      return NextResponse.json(
        { error: 'runId required' },
        { status: 400 }
      )
    }

    const { data: run, error } = await db
      .from('analysis_runs')
      .select('*')
      .eq('id', runId)
      .maybeSingle()

    if (error) throw error

    if (!run) {
      return NextResponse.json(
        { error: 'Run not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(run)
  } catch (error) {
    console.error('Failed to fetch analysis run:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch run',
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    )
  }
}