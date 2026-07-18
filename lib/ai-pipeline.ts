import OpenAI from 'openai'
import { generateId, getCurrentDate } from './utils'
import {
  ResearchSource,
  AtomicInsight,
  Theme,
  Evidence,
} from './types'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  console.warn('OPENAI_API_KEY is not configured')
}

const openai = new OpenAI({
  apiKey: apiKey || 'missing-key',
})

const MODEL = 'gpt-4o-mini'

interface ExtractedInsight {
  statement: string
  quote: string
  sentiment: 'positive' | 'neutral' | 'negative'
  confidence: number
}

/**
 * STAGE 1
 * Extract atomic customer insights from research sources.
 *
 * IMPORTANT:
 * Unlike the old implementation, AI/API failures are NOT silently
 * swallowed. If extraction fails, the analysis run will fail and expose
 * the real error instead of incorrectly reporting "0 insights".
 */
export async function extractInsights(
  sources: ResearchSource[]
): Promise<AtomicInsight[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY is missing. Add it to Vercel Environment Variables and redeploy.'
    )
  }

  if (!sources || sources.length === 0) {
    throw new Error(
      'No research sources were provided to the AI extraction pipeline.'
    )
  }

  const insights: AtomicInsight[] = []

  console.log(
    `Starting AI extraction for ${sources.length} research sources...`
  )

  for (const source of sources) {
    try {
      if (!source.raw_content?.trim()) {
        console.warn(
          `Skipping source "${source.title}" (${source.id}) because raw_content is empty.`
        )
        continue
      }

      console.log(
        `Extracting insights from: ${source.title} (${source.id})`
      )

      const response = await openai.chat.completions.create({
        model: MODEL,

        messages: [
          {
            role: 'system',
            content: `
You are a Product Discovery and User Research analyst.

Analyze the provided customer research and extract atomic customer insights.

An atomic insight represents exactly ONE:

- pain point
- customer problem
- complaint
- unmet need
- feature request
- motivation
- behavioral observation
- positive product observation

Rules:

1. Extract only insights directly supported by the research.
2. Do not invent information.
3. Do not summarize the entire document into one insight.
4. Every insight must contain a supporting quote from the research.
5. Prefer 2-6 meaningful atomic insights when the content supports them.
6. Ignore irrelevant metadata or boilerplate.
7. Sentiment must be exactly:
   "positive", "neutral", or "negative".
8. Confidence must be between 0 and 1.

Return ONLY valid JSON using exactly this structure:

{
  "insights": [
    {
      "statement": "Concise atomic customer insight",
      "quote": "Direct supporting quote from the research",
      "sentiment": "negative",
      "confidence": 0.9
    }
  ]
}

If the research genuinely contains no usable customer insight, return:

{
  "insights": []
}
            `.trim(),
          },

          {
            role: 'user',
            content: `
Analyze this customer research source.

TITLE:
${source.title}

SOURCE TYPE:
${source.type}

CUSTOMER:
${source.customer_name || 'Anonymous'}

CUSTOMER SEGMENT:
${source.segment || 'Unknown'}

RESEARCH CONTENT:

${source.raw_content}

Extract all meaningful atomic customer insights supported by this content.

Return ONLY the required JSON object.
            `.trim(),
          },
        ],

        response_format: {
          type: 'json_object',
        },

        temperature: 0.2,
      })

      const content =
        response.choices[0]?.message?.content

      if (!content) {
        throw new Error(
          `OpenAI returned an empty response for "${source.title}".`
        )
      }

      let parsed: any

      try {
        parsed = JSON.parse(content)
      } catch (error) {
        console.error(
          `Invalid JSON returned for source "${source.title}":`,
          content
        )

        throw new Error(
          `OpenAI returned invalid JSON for "${source.title}".`
        )
      }

      let sourceInsights: ExtractedInsight[] = []

      if (Array.isArray(parsed?.insights)) {
        sourceInsights = parsed.insights
      } else if (Array.isArray(parsed)) {
        sourceInsights = parsed
      } else if (parsed?.statement) {
        sourceInsights = [parsed]
      }

      console.log(
        `AI returned ${sourceInsights.length} candidate insights for "${source.title}".`
      )

      for (const insight of sourceInsights) {
        if (
          !insight ||
          typeof insight.statement !== 'string' ||
          !insight.statement.trim()
        ) {
          continue
        }

        let confidence = Number(insight.confidence)

        if (!Number.isFinite(confidence)) {
          confidence = 0.8
        }

        confidence = Math.max(
          0,
          Math.min(confidence, 1)
        )

        const rawSentiment =
          typeof insight.sentiment === 'string'
            ? insight.sentiment.toLowerCase()
            : 'neutral'

        const sentiment:
          | 'positive'
          | 'neutral'
          | 'negative' =
          rawSentiment === 'positive' ||
          rawSentiment === 'negative' ||
          rawSentiment === 'neutral'
            ? rawSentiment
            : 'neutral'

        const statement =
          insight.statement.trim()

        const quote =
          typeof insight.quote === 'string' &&
          insight.quote.trim()
            ? insight.quote.trim()
            : statement

        insights.push({
          id: generateId(),

          source_id: source.id,

          statement,

          quote,

          sentiment,

          confidence,

          segment:
            source.segment || 'Unknown',

          created_at:
            getCurrentDate(),
        })
      }

      console.log(
        `Successfully processed "${source.title}". Total insights so far: ${insights.length}`
      )
    } catch (error) {
      console.error(
        `FATAL AI extraction error for source "${source.title}" (${source.id}):`,
        error
      )

      const message =
        error instanceof Error
          ? error.message
          : String(error)

      throw new Error(
        `AI extraction failed for "${source.title}": ${message}`
      )
    }
  }

  console.log(
    `AI extraction finished. Total extracted insights: ${insights.length}`
  )

  if (insights.length === 0) {
    throw new Error(
      `AI extraction processed ${sources.length} research sources but produced 0 insights. Verify that the sources contain raw_content and check the OpenAI API configuration and Vercel logs.`
    )
  }

  return insights
}

/**
 * STAGE 2
 * Group atomic insights into themes.
 */
export async function groupInsights(
  insights: AtomicInsight[],
  sources: ResearchSource[]
): Promise<Theme[]> {
  const themes: Theme[] = []

  if (insights.length === 0) {
    throw new Error(
      'Theme grouping cannot run because no atomic insights were extracted.'
    )
  }

  try {
    const response =
      await openai.chat.completions.create({
        model: MODEL,

        messages: [
          {
            role: 'system',

            content: `
You are a senior Product Discovery researcher.

Cluster atomic customer insights into meaningful product themes.

Rules:

- Group semantically similar customer problems.
- Different wording may represent the same underlying problem.
- Each insight should belong to one primary theme.
- Themes must represent meaningful product problems or opportunities.
- Avoid overly broad generic themes.
- Avoid creating one theme for every individual insight.

Return ONLY valid JSON:

{
  "themes": [
    {
      "name": "Theme name",
      "description": "Concise explanation of the underlying customer problem",
      "insight_indices": [0, 3, 7]
    }
  ]
}

insight_indices must correspond to the numbered insights provided.
            `.trim(),
          },

          {
            role: 'user',

            content: `
Group these atomic customer insights into meaningful product themes:

${insights
  .map(
    (insight, index) => `
${index}.
Statement: ${insight.statement}
Evidence: "${insight.quote}"
Segment: ${insight.segment}
Sentiment: ${insight.sentiment}
`
  )
  .join('\n')}

Return ONLY the required JSON object.
            `.trim(),
          },
        ],

        response_format: {
          type: 'json_object',
        },

        temperature: 0.2,
      })

    const content =
      response.choices[0]?.message?.content

    if (!content) {
      throw new Error(
        'OpenAI returned an empty response while grouping themes.'
      )
    }

    const parsed = JSON.parse(content)

    const groupedThemes =
      Array.isArray(parsed?.themes)
        ? parsed.themes
        : []

    if (groupedThemes.length === 0) {
      throw new Error(
        `Theme grouping returned 0 themes from ${insights.length} insights.`
      )
    }

    for (const themeData of groupedThemes) {
      const indices =
        Array.isArray(
          themeData.insight_indices
        )
          ? themeData.insight_indices
          : []

      const themeInsights =
        indices
          .map(
            (index: number) =>
              insights[index]
          )
          .filter(
            (
              insight: AtomicInsight | undefined
            ): insight is AtomicInsight =>
              Boolean(insight)
          )

      if (themeInsights.length === 0) {
        continue
      }

      const affectedSegments: string[] = [
        ...new Set<string>(
          themeInsights
            .map(
              (insight) =>
                insight.segment
            )
            .filter(
              (
                segment
              ): segment is string =>
                typeof segment ===
                  'string' &&
                segment.length > 0
            )
        ),
      ]

      const averageConfidence =
        themeInsights.reduce(
          (sum, insight) =>
            sum +
            Number(
              insight.confidence || 0
            ),
          0
        ) /
        Math.max(
          themeInsights.length,
          1
        )

      themes.push({
        id: generateId(),

        project_id: '',

        name:
          typeof themeData.name ===
            'string' &&
          themeData.name.trim()
            ? themeData.name.trim()
            : 'Unnamed Theme',

        description:
          typeof themeData.description ===
            'string' &&
          themeData.description.trim()
            ? themeData.description.trim()
            : 'Customer research theme',

        insight_count:
          themeInsights.length,

        source_count: [
          ...new Set(
            themeInsights.map(
              (insight) =>
                insight.source_id
            )
          ),
        ].length,

        affected_segments:
          affectedSegments,

        confidence:
          averageConfidence,

        severity: 'MEDIUM',

        business_impact:
          'MEDIUM',

        opportunity_score: 0,

        created_at:
          getCurrentDate(),
      })
    }

    if (themes.length === 0) {
      throw new Error(
        'Theme grouping produced no valid themes.'
      )
    }

    console.log(
      `Created ${themes.length} themes from ${insights.length} insights.`
    )

    return themes
  } catch (error) {
    console.error(
      'Theme grouping failed:',
      error
    )

    throw new Error(
      `Theme grouping failed: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`
    )
  }
}

/**
 * STAGE 3
 * Determine severity and business impact.
 */
export async function analyzeSeverity(
  themes: Theme[]
): Promise<Theme[]> {
  for (const theme of themes) {
    try {
      const response =
        await openai.chat.completions.create({
          model: MODEL,

          messages: [
            {
              role: 'system',

              content: `
You are a Product Manager evaluating customer research.

Determine severity and business impact.

Severity:

HIGH
- Blocks important tasks
- Creates churn risk
- Causes transaction failure
- Causes data loss
- Prevents adoption

MEDIUM
- Creates meaningful frustration
- Slows workflows
- Creates repeated support burden

LOW
- Minor inconvenience
- Nice-to-have request
- Limited workflow impact

Business Impact:

HIGH
- Revenue loss
- Customer churn
- Purchase abandonment
- Major retention risk

MEDIUM
- Increased support burden
- Reduced engagement
- Workflow inefficiency

LOW
- Small usability inconvenience
- Limited business consequences

Return ONLY valid JSON:

{
  "severity": "HIGH",
  "business_impact": "HIGH",
  "reasoning": "Concise evidence-based explanation"
}
              `.trim(),
            },

            {
              role: 'user',

              content: `
Analyze this customer research theme.

Theme:
${theme.name}

Description:
${theme.description}

Number of Insights:
${theme.insight_count}

Distinct Sources:
${theme.source_count}

Affected Segments:
${theme.affected_segments.join(', ')}

Classify severity and business impact.
              `.trim(),
            },
          ],

          response_format: {
            type: 'json_object',
          },

          temperature: 0.2,
        })

      const content =
        response.choices[0]
          ?.message?.content

      if (!content) {
        throw new Error(
          `Empty AI response for theme "${theme.name}".`
        )
      }

      const parsed =
        JSON.parse(content)

      const severity =
        String(
          parsed.severity ||
            'MEDIUM'
        ).toUpperCase()

      const businessImpact =
        String(
          parsed.business_impact ||
            'MEDIUM'
        ).toUpperCase()

      theme.severity =
        severity === 'HIGH' ||
        severity === 'MEDIUM' ||
        severity === 'LOW'
          ? severity
          : 'MEDIUM'

      theme.business_impact =
        businessImpact === 'HIGH' ||
        businessImpact === 'MEDIUM' ||
        businessImpact === 'LOW'
          ? businessImpact
          : 'MEDIUM'
    } catch (error) {
      console.error(
        `Severity analysis failed for "${theme.name}":`,
        error
      )

      throw new Error(
        `Severity analysis failed for "${theme.name}": ${
          error instanceof Error
            ? error.message
            : String(error)
        }`
      )
    }
  }

  return themes
}

/**
 * STAGE 4
 * Calculate deterministic opportunity scores.
 */
export async function scoreThemes(
  themes: Theme[]
): Promise<Theme[]> {
  for (const theme of themes) {
    const severityScore =
      theme.severity === 'HIGH'
        ? 40
        : theme.severity ===
            'MEDIUM'
          ? 25
          : 10

    const impactScore =
      theme.business_impact ===
      'HIGH'
        ? 30
        : theme.business_impact ===
            'MEDIUM'
          ? 20
          : 10

    const frequencyScore =
      Math.min(
        theme.source_count * 5,
        20
      )

    const confidenceScore =
      Math.min(
        Math.max(
          theme.confidence * 10,
          0
        ),
        10
      )

    const totalScore =
      Math.min(
        severityScore +
          impactScore +
          frequencyScore +
          confidenceScore,
        100
      )

    theme.opportunity_score =
      Math.round(totalScore)

    theme.score_breakdown = {
      severity:
        severityScore,

      impact:
        impactScore,

      frequency:
        frequencyScore,

      confidence:
        confidenceScore,

      total:
        theme.opportunity_score,
    }
  }

  themes.sort(
    (a, b) =>
      b.opportunity_score -
      a.opportunity_score
  )

  return themes
}

/**
 * STAGE 5
 * Generate grounded evidence records.
 *
 * Evidence comes directly from extracted customer quotes.
 * The AI is not allowed to invent evidence here.
 */
export async function generateEvidence(
  themes: Theme[],
  insights: AtomicInsight[],
  sources: Map<
    string,
    ResearchSource
  >
): Promise<Evidence[]> {
  const evidence: Evidence[] = []

  for (const theme of themes) {
    const segmentMatches =
      insights.filter(
        (insight) =>
          theme.affected_segments.includes(
            insight.segment
          )
      )

    const candidateInsights =
      segmentMatches.length > 0
        ? segmentMatches
        : insights

    const uniqueInsights =
      candidateInsights.filter(
        (
          insight,
          index,
          array
        ) =>
          array.findIndex(
            (other) =>
              other.source_id ===
                insight.source_id &&
              other.quote ===
                insight.quote
          ) === index
      )

    const selectedInsights =
      uniqueInsights.slice(0, 3)

    for (const insight of selectedInsights) {
      const source =
        sources.get(
          insight.source_id
        )

      evidence.push({
        id: generateId(),

        theme_id:
          theme.id,

        source_id:
          insight.source_id,

        quote:
          insight.quote ||
          insight.statement,

        context:
          source
            ? `${source.title} — ${insight.statement}`
            : insight.statement,

        sentiment:
          insight.sentiment,

        created_at:
          getCurrentDate(),
      })
    }
  }

  console.log(
    `Generated ${evidence.length} evidence records.`
  )

  return evidence
}

/**
 * STAGE 6
 * Generate executive Product Discovery report.
 */
export async function generateReport(
  themes: Theme[],
  insights: AtomicInsight[]
): Promise<string> {
  if (
    themes.length === 0 ||
    insights.length === 0
  ) {
    throw new Error(
      'Cannot generate report because no themes or insights are available.'
    )
  }

  try {
    const topThemes =
      themes.slice(0, 5)

    const response =
      await openai.chat.completions.create({
        model: MODEL,

        messages: [
          {
            role: 'system',

            content: `
You are a senior Product Discovery strategist.

Write an executive Product Discovery summary for Product Managers.

The report must:

- Be evidence-driven
- Explain the most important customer problems
- Highlight affected customer segments
- Explain why the highest-ranked problems matter
- Recommend what Product Managers should investigate or prioritize
- Avoid claiming evidence that was not provided
- Be concise and suitable for roadmap planning

Do not simply repeat the themes.

Turn the findings into actionable product intelligence.
            `.trim(),
          },

          {
            role: 'user',

            content: `
Generate an executive Product Discovery summary.

Total Atomic Customer Insights:
${insights.length}

Total Themes:
${themes.length}

Top Product Problems:

${topThemes
  .map(
    (theme, index) => `
${index + 1}. ${theme.name}

Opportunity Score:
${theme.opportunity_score}/100

Severity:
${theme.severity}

Business Impact:
${theme.business_impact}

Distinct Research Sources:
${theme.source_count}

Atomic Insights:
${theme.insight_count}

Affected Segments:
${theme.affected_segments.join(', ')}

Description:
${theme.description}
`
  )
  .join('\n')}

Write approximately 3-5 concise paragraphs covering:

1. Highest-priority customer problems
2. Why they matter
3. Customer segments affected
4. What Product Managers should prioritize
5. What requires further research
            `.trim(),
          },
        ],

        temperature: 0.3,
      })

    const report =
      response.choices[0]
        ?.message?.content

    if (!report?.trim()) {
      throw new Error(
        'OpenAI returned an empty Product Discovery report.'
      )
    }

    return report.trim()
  } catch (error) {
    console.error(
      'Report generation failed:',
      error
    )

    throw new Error(
      `Report generation failed: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`
    )
  }
}