import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Theme, AtomicInsight, ResearchSource, Evidence } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const { question, projectId = 'proj-default' } = await request.json()

    if (!question || !question.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // Fetch all relevant data
    const themes = db
      .prepare('SELECT * FROM themes WHERE project_id = ? ORDER BY opportunity_score DESC')
      .all(projectId) as any[]

    const sources = db
      .prepare('SELECT * FROM research_sources WHERE project_id = ?')
      .all(projectId) as ResearchSource[]

    const insights = db
      .prepare('SELECT * FROM atomic_insights ORDER BY created_at DESC')
      .all() as AtomicInsight[]

    const evidence = db.prepare('SELECT * FROM evidence ORDER BY created_at DESC').all() as Evidence[]

    // Parse JSON fields
    const parsedThemes = themes.map((t) => ({
      ...t,
      affected_segments: JSON.parse(t.affected_segments || '[]'),
      score_breakdown: JSON.parse(t.score_breakdown || '{}'),
    }))

    // Generate contextual response based on question
    const response = generateResponse(question, parsedThemes, sources, insights, evidence)

    return NextResponse.json({
      answer: response.answer,
      findings: response.findings,
      metrics: response.metrics,
      supportingEvidence: response.supportingEvidence,
    })
  } catch (error) {
    console.error('Ask error:', error)
    return NextResponse.json({ error: 'Failed to process question' }, { status: 500 })
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

  // Detect question type and generate appropriate response
  if (lowerQuestion.includes('biggest problem') || lowerQuestion.includes('biggest challenge')) {
    const topTheme = themes[0]
    answer = `The biggest problem in your research is **${topTheme.name}** with an opportunity score of ${topTheme.opportunity_score}/100. This affects ${topTheme.affected_segments.join(', ')} and appears in ${topTheme.source_count} research sources.`
    findings = [
      `Severity: ${topTheme.severity}`,
      `Business Impact: ${topTheme.business_impact}`,
      `Confidence: ${Math.round(topTheme.confidence * 100)}%`,
      `Mentioned in ${topTheme.insight_count} distinct insights`,
    ]
    metrics = [`${topTheme.source_count} sources`, `${topTheme.insight_count} insights`, `${topTheme.opportunity_score} score`]
    supportingEvidence = evidence
      .filter((e) => e.theme_id === topTheme.id)
      .slice(0, 2)
      .map((e) => `"${e.quote}"`)
  } else if (lowerQuestion.includes('affect') && lowerQuestion.includes('segment')) {
    const topThemes = themes.slice(0, 3)
    const affectedSegments = new Set<string>()
    topThemes.forEach((t) => t.affected_segments.forEach((s: string) => affectedSegments.add(s)))

    answer = `Several themes affect multiple segments: ${topThemes.map((t) => `**${t.name}**`).join(', ')}.`
    findings = topThemes.map((t) => `${t.name} affects ${t.affected_segments.join(', ')}`)
    metrics = [`${topThemes.length} cross-segment themes`, `${affectedSegments.size} segments affected`]
    supportingEvidence = topThemes.map((t) => `${t.name} (${t.opportunity_score}/100)`)
  } else if (lowerQuestion.includes('feature') || lowerQuestion.includes('request')) {
    const featureThemes = themes.filter(
      (t) => t.name.toLowerCase().includes('integration') || t.name.toLowerCase().includes('feature')
    )
    const topFeature = featureThemes[0] || themes[1]
    answer = `The most requested features relate to **${topFeature.name}** (${topFeature.opportunity_score}/100). This appears in ${topFeature.source_count} sources across ${topFeature.affected_segments.join(', ')}.`
    findings = [
      `Requested by: ${topFeature.affected_segments.join(', ')}`,
      `Priority Score: ${topFeature.opportunity_score}/100`,
      `Evidence Strength: ${Math.round(topFeature.confidence * 100)}%`,
    ]
    metrics = [`${topFeature.source_count} sources`, `${topFeature.insight_count} insights`]
    supportingEvidence = evidence
      .filter((e) => e.theme_id === topFeature.id)
      .slice(0, 2)
      .map((e) => `"${e.quote}"`)
  } else if (lowerQuestion.includes('free') || lowerQuestion.includes('premium') || lowerQuestion.includes('business')) {
    const segment = lowerQuestion.includes('free')
      ? 'Free Users'
      : lowerQuestion.includes('premium')
        ? 'Premium Customers'
        : 'Small Business Customers'
    const segmentThemes = themes.filter((t) => t.affected_segments.includes(segment)).slice(0, 3)
    answer = `**${segment}** face these top problems: ${segmentThemes.map((t) => `${t.name} (${t.opportunity_score}/100)`).join(', ')}.`
    findings = segmentThemes.map((t) => `${t.name}: ${t.description}`)
    metrics = [`${segmentThemes.length} critical themes`, `${sources.filter((s) => s.segment === segment).length} sources`]
    supportingEvidence = segmentThemes.map((t) => `${t.name} affects ${segment}`)
  } else if (lowerQuestion.includes('priorit') || lowerQuestion.includes('roadmap')) {
    const topThemes = themes.slice(0, 5)
    answer = `Based on opportunity scores and impact, prioritize: ${topThemes.map((t) => `**${t.name}**`).join(', ')}.`
    findings = topThemes.map((t) => `${t.name}: ${t.severity} severity, ${t.business_impact} impact`)
    metrics = topThemes.map((t) => `${t.name} (${t.opportunity_score}/100)`)
    supportingEvidence = topThemes.map((t) => `${t.affected_segments.join(', ')} (${t.source_count} sources)`)
  } else {
    // Default response
    const topThemes = themes.slice(0, 3)
    answer = `Based on analysis of ${sources.length} research sources, the top opportunities are: ${topThemes.map((t) => `**${t.name}**`).join(', ')}.`
    findings = topThemes.map((t) => `${t.name}: ${t.description}`)
    metrics = [`${sources.length} total sources`, `${themes.length} themes identified`, `${insights.length} insights extracted`]
    supportingEvidence = topThemes.map((t) => `${t.name} (${t.opportunity_score}/100, ${t.source_count} sources)`)
  }

  return {
    answer,
    findings,
    metrics,
    supportingEvidence,
  }
}
