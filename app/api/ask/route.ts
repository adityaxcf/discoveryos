import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AtomicInsight, ResearchSource, Evidence } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const { question, projectId = 'proj-default' } = await request.json()

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    // Fetch project themes
    const { data: themeData, error: themesError } = await db
      .from('themes')
      .select('*')
      .eq('project_id', projectId)
      .order('opportunity_score', { ascending: false })

    if (themesError) throw themesError

    // Fetch project research sources
    const { data: sourceData, error: sourcesError } = await db
      .from('research_sources')
      .select('*')
      .eq('project_id', projectId)

    if (sourcesError) throw sourcesError

    const sources = (sourceData || []) as ResearchSource[]

    // Only fetch insights belonging to this project's sources
    const sourceIds = sources.map((source) => source.id)

    let insights: AtomicInsight[] = []

    if (sourceIds.length > 0) {
      const { data: insightData, error: insightsError } = await db
        .from('atomic_insights')
        .select('*')
        .in('source_id', sourceIds)
        .order('created_at', { ascending: false })

      if (insightsError) throw insightsError

      insights = (insightData || []) as AtomicInsight[]
    }

    // Fetch evidence for this project's themes
    const themeIds = (themeData || []).map((theme) => theme.id)

    let evidence: Evidence[] = []

    if (themeIds.length > 0) {
      const { data: evidenceData, error: evidenceError } = await db
        .from('evidence')
        .select('*')
        .in('theme_id', themeIds)
        .order('created_at', { ascending: false })

      if (evidenceError) throw evidenceError

      evidence = (evidenceData || []) as Evidence[]
    }

    // Parse JSON fields stored as text in Supabase
    const parsedThemes = (themeData || []).map((theme) => ({
      ...theme,

      affected_segments:
        typeof theme.affected_segments === 'string'
          ? JSON.parse(theme.affected_segments || '[]')
          : theme.affected_segments || [],

      score_breakdown:
        typeof theme.score_breakdown === 'string'
          ? JSON.parse(theme.score_breakdown || '{}')
          : theme.score_breakdown || {},
    }))

    if (parsedThemes.length === 0) {
      return NextResponse.json({
        answer:
          'No analyzed research is available yet. Run the DiscoveryOS analysis pipeline first.',
        findings: [],
        metrics: [`${sources.length} research sources available`],
        supportingEvidence: [],
      })
    }

    const response = generateResponse(
      question,
      parsedThemes,
      sources,
      insights,
      evidence
    )

    return NextResponse.json({
      answer: response.answer,
      findings: response.findings,
      metrics: response.metrics,
      supportingEvidence: response.supportingEvidence,
    })
  } catch (error) {
    console.error('Ask error:', error)

    return NextResponse.json(
      {
        error: 'Failed to process question',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

function generateResponse(
  question: string,
  themes: any[],
  sources: ResearchSource[],
  insights: AtomicInsight[],
  evidence: Evidence[]
) {
  const lowerQuestion = question.toLowerCase()

  let answer = ''
  let findings: string[] = []
  let metrics: string[] = []
  let supportingEvidence: string[] = []

  if (
    lowerQuestion.includes('biggest problem') ||
    lowerQuestion.includes('biggest challenge')
  ) {
    const topTheme = themes[0]

    answer = `The biggest problem in your research is **${topTheme.name}** with an opportunity score of ${topTheme.opportunity_score}/100. This affects ${topTheme.affected_segments.join(', ')} and appears in ${topTheme.source_count} research sources.`

    findings = [
      `Severity: ${topTheme.severity}`,
      `Business Impact: ${topTheme.business_impact}`,
      `Confidence: ${Math.round(topTheme.confidence * 100)}%`,
      `Mentioned in ${topTheme.insight_count} distinct insights`,
    ]

    metrics = [
      `${topTheme.source_count} sources`,
      `${topTheme.insight_count} insights`,
      `${topTheme.opportunity_score} score`,
    ]

    supportingEvidence = evidence
      .filter((item) => item.theme_id === topTheme.id)
      .slice(0, 2)
      .map((item) => `"${item.quote}"`)
  } else if (
    lowerQuestion.includes('affect') &&
    lowerQuestion.includes('segment')
  ) {
    const topThemes = themes.slice(0, 3)
    const affectedSegments = new Set<string>()

    topThemes.forEach((theme) =>
      theme.affected_segments.forEach((segment: string) =>
        affectedSegments.add(segment)
      )
    )

    answer = `Several themes affect multiple segments: ${topThemes
      .map((theme) => `**${theme.name}**`)
      .join(', ')}.`

    findings = topThemes.map(
      (theme) =>
        `${theme.name} affects ${theme.affected_segments.join(', ')}`
    )

    metrics = [
      `${topThemes.length} cross-segment themes`,
      `${affectedSegments.size} segments affected`,
    ]

    supportingEvidence = topThemes.map(
      (theme) => `${theme.name} (${theme.opportunity_score}/100)`
    )
  } else if (
    lowerQuestion.includes('feature') ||
    lowerQuestion.includes('request')
  ) {
    const featureThemes = themes.filter(
      (theme) =>
        theme.name.toLowerCase().includes('integration') ||
        theme.name.toLowerCase().includes('feature')
    )

    const topFeature = featureThemes[0] || themes[1] || themes[0]

    answer = `The most requested features relate to **${topFeature.name}** (${topFeature.opportunity_score}/100). This appears in ${topFeature.source_count} sources across ${topFeature.affected_segments.join(', ')}.`

    findings = [
      `Requested by: ${topFeature.affected_segments.join(', ')}`,
      `Priority Score: ${topFeature.opportunity_score}/100`,
      `Evidence Strength: ${Math.round(topFeature.confidence * 100)}%`,
    ]

    metrics = [
      `${topFeature.source_count} sources`,
      `${topFeature.insight_count} insights`,
    ]

    supportingEvidence = evidence
      .filter((item) => item.theme_id === topFeature.id)
      .slice(0, 2)
      .map((item) => `"${item.quote}"`)
  } else if (
    lowerQuestion.includes('free') ||
    lowerQuestion.includes('premium') ||
    lowerQuestion.includes('business')
  ) {
    const segment = lowerQuestion.includes('free')
      ? 'Free Users'
      : lowerQuestion.includes('premium')
        ? 'Premium Customers'
        : 'Small Business Customers'

    const segmentThemes = themes
      .filter((theme) => theme.affected_segments.includes(segment))
      .slice(0, 3)

    answer =
      segmentThemes.length > 0
        ? `**${segment}** face these top problems: ${segmentThemes
            .map(
              (theme) =>
                `${theme.name} (${theme.opportunity_score}/100)`
            )
            .join(', ')}.`
        : `No major analyzed themes currently target **${segment}** specifically.`

    findings = segmentThemes.map(
      (theme) => `${theme.name}: ${theme.description}`
    )

    metrics = [
      `${segmentThemes.length} critical themes`,
      `${sources.filter((source) => source.segment === segment).length} sources`,
    ]

    supportingEvidence = segmentThemes.map(
      (theme) => `${theme.name} affects ${segment}`
    )
  } else if (
    lowerQuestion.includes('priorit') ||
    lowerQuestion.includes('roadmap')
  ) {
    const topThemes = themes.slice(0, 5)

    answer = `Based on opportunity scores and impact, prioritize: ${topThemes
      .map((theme) => `**${theme.name}**`)
      .join(', ')}.`

    findings = topThemes.map(
      (theme) =>
        `${theme.name}: ${theme.severity} severity, ${theme.business_impact} impact`
    )

    metrics = topThemes.map(
      (theme) => `${theme.name} (${theme.opportunity_score}/100)`
    )

    supportingEvidence = topThemes.map(
      (theme) =>
        `${theme.affected_segments.join(', ')} (${theme.source_count} sources)`
    )
  } else {
    const topThemes = themes.slice(0, 3)

    answer = `Based on analysis of ${sources.length} research sources, the top opportunities are: ${topThemes
      .map((theme) => `**${theme.name}**`)
      .join(', ')}.`

    findings = topThemes.map(
      (theme) => `${theme.name}: ${theme.description}`
    )

    metrics = [
      `${sources.length} total sources`,
      `${themes.length} themes identified`,
      `${insights.length} insights extracted`,
    ]

    supportingEvidence = topThemes.map(
      (theme) =>
        `${theme.name} (${theme.opportunity_score}/100, ${theme.source_count} sources)`
    )
  }

  return {
    answer,
    findings,
    metrics,
    supportingEvidence,
  }
}