import OpenAI from 'openai'
import { generateId, getCurrentDate } from './utils'
import { ResearchSource, AtomicInsight, Theme, Evidence } from './types'

// Use Ollama locally through its OpenAI-compatible API.
// No paid OpenAI API key is required.
const openai = new OpenAI({
  baseURL: 'http://127.0.0.1:11434/v1',
  apiKey: 'ollama',
})

const MODEL = 'llama3.2'

interface ExtractedInsight {
  statement: string
  quote: string
  sentiment: 'positive' | 'neutral' | 'negative'
  confidence: number
}

interface GroupedTheme {
  name: string
  description: string
  insights: ExtractedInsight[]
  affected_segments: string[]
  confidence: number
}

export async function extractInsights(
  sources: ResearchSource[]
): Promise<AtomicInsight[]> {
  const insights: AtomicInsight[] = []

  for (const source of sources) {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `
You are a Product Discovery and User Research analyst.

Analyze the provided research source and extract ATOMIC customer insights.

Rules:
- One insight must represent exactly one specific pain point, problem,
  feature request, need, complaint, motivation, or positive observation.
- Do NOT summarize the entire document.
- Every insight must include a direct supporting quote from the source.
- Do not invent evidence.
- Only extract insights clearly supported by the provided content.

Return ONLY a valid JSON object using this exact structure:

{
  "insights": [
    {
      "statement": "A concise atomic customer insight",
      "quote": "Exact supporting quote from the source",
      "sentiment": "negative",
      "confidence": 0.9
    }
  ]
}

sentiment must be exactly:
"positive", "neutral", or "negative"

confidence must be a number between 0 and 1.

If there are multiple distinct problems, return multiple objects inside
the insights array.
            `.trim(),
          },
          {
            role: 'user',
            content: `
Extract atomic customer insights from this research source.

Title: ${source.title}

Source Type: ${source.type}

Customer:
${source.customer_name || 'Anonymous'}

User Segment:
${source.segment}

Research Content:

${source.raw_content}

Return ONLY the required JSON object.
            `.trim(),
          },
        ],
        response_format: {
          type: 'json_object',
        },
        temperature: 0.3,
      })

      const content = response.choices[0]?.message?.content

      if (!content) {
        console.warn(`No AI response for source ${source.id}`)
        continue
      }

      try {
        const parsed = JSON.parse(content)

        let sourceInsights: any[] = []

        if (Array.isArray(parsed.insights)) {
          sourceInsights = parsed.insights
        } else if (Array.isArray(parsed)) {
          sourceInsights = parsed
        } else if (parsed.statement) {
          sourceInsights = [parsed]
        }

        for (const insight of sourceInsights) {
          if (!insight?.statement) continue

          let confidence = Number(insight.confidence)

          if (Number.isNaN(confidence)) {
            confidence = 0.8
          }

          confidence = Math.max(0, Math.min(confidence, 1))

          const allowedSentiments = [
            'positive',
            'neutral',
            'negative',
          ]

          const sentiment = allowedSentiments.includes(
            insight.sentiment
          )
            ? insight.sentiment
            : 'neutral'

          insights.push({
            id: generateId(),
            source_id: source.id,
            statement: insight.statement,
            quote:
              insight.quote ||
              insight.statement,
            sentiment,
            confidence,
            segment: source.segment,
            created_at: getCurrentDate(),
          })
        }

        console.log(
          `Extracted ${sourceInsights.length} insights from ${source.title}`
        )
      } catch (parseError) {
        console.error(
          `Could not parse Ollama response for ${source.id}:`,
          content,
          parseError
        )
      }
    } catch (error) {
      console.error(
        `Error extracting insights from ${source.id}:`,
        error
      )
    }
  }

  console.log(
    `Total extracted insights: ${insights.length}`
  )

  return insights
}

export async function groupInsights(
  insights: AtomicInsight[],
  sources: ResearchSource[]
): Promise<Theme[]> {
  const themes: Theme[] = []

  if (insights.length === 0) {
    console.warn(
      'No insights available for theme grouping.'
    )

    return themes
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

Your job is to cluster atomic customer insights into meaningful
product themes.

Rules:

- Group semantically similar customer problems together.
- Different wording may describe the same underlying problem.
- Each insight should belong to ONE primary theme.
- Themes should represent meaningful product problems or opportunities.
- Avoid creating overly broad generic themes.
- Avoid creating a separate theme for every individual insight.

Return ONLY valid JSON in this exact format:

{
  "themes": [
    {
      "name": "Theme name",
      "description": "Concise explanation of the underlying customer problem",
      "insight_indices": [0, 3, 7]
    }
  ]
}

insight_indices must refer to the numbered insights supplied by the user.
            `.trim(),
          },
          {
            role: 'user',
            content: `
Group these atomic customer insights into product discovery themes:

${insights
  .map(
    (insight, idx) => `
${idx}.
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

        temperature: 0.3,
      })

    const content =
      response.choices[0]?.message?.content

    if (!content) {
      console.warn(
        'No AI response while grouping themes.'
      )

      return themes
    }

    const parsed = JSON.parse(content)

    const groupedThemes = Array.isArray(
      parsed.themes
    )
      ? parsed.themes
      : []

    for (const themeData of groupedThemes) {
      const indices = Array.isArray(
        themeData.insight_indices
      )
        ? themeData.insight_indices
        : []

      const themeInsights = indices
        .map((idx: number) => insights[idx])
        .filter(Boolean)

      if (themeInsights.length === 0) {
        continue
      }

const affectedSegments: string[] = [
  ...new Set<string>(
    themeInsights
      .map((insight: AtomicInsight) => insight.segment)
      .filter((segment): segment is string => typeof segment === 'string')
  ),
]

      const avgConfidence =
        themeInsights.reduce(
          (sum, insight) =>
            sum + insight.confidence,
          0
        ) /
        Math.max(themeInsights.length, 1)

      const theme: Theme = {
        id: generateId(),

        project_id: '',

        name:
          themeData.name ||
          'Unnamed Theme',

        description:
          themeData.description ||
          'Customer research theme',

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
          avgConfidence,

        severity: 'MEDIUM',

        business_impact:
          'MEDIUM',

        opportunity_score: 0,

        created_at:
          getCurrentDate(),
      }

      themes.push(theme)
    }

    console.log(
      `Created ${themes.length} themes from ${insights.length} insights`
    )
  } catch (error) {
    console.error(
      'Error grouping insights:',
      error
    )
  }

  return themes
}

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

Determine the severity and business impact of the provided product
problem.

Severity:

HIGH
- Blocks customers from completing important tasks
- Creates churn risk
- Causes transaction failure
- Causes data loss
- Prevents product adoption

MEDIUM
- Creates meaningful frustration
- Slows workflows
- Generates repeated support burden

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
  "reasoning": "One concise evidence-based explanation"
}
              `.trim(),
            },

            {
              role: 'user',

              content: `
Analyze this research theme.

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
        response.choices[0]?.message?.content

      if (!content) continue

      const parsed = JSON.parse(content)

      const severity =
        String(
          parsed.severity || 'MEDIUM'
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
        `Error analyzing severity for theme ${theme.id}:`,
        error
      )
    }
  }

  return themes
}

export async function scoreThemes(
  themes: Theme[]
): Promise<Theme[]> {
  for (const theme of themes) {
    try {
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
    } catch (error) {
      console.error(
        `Error scoring theme ${theme.id}:`,
        error
      )
    }
  }

  themes.sort(
    (a, b) =>
      b.opportunity_score -
      a.opportunity_score
  )

  return themes
}

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
    try {
      /*
       * Evidence should remain grounded in
       * the original extracted customer
       * quotes.
       *
       * We do not ask the AI to invent or
       * rewrite evidence.
       */

      const segmentMatches =
        insights.filter((insight) =>
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
        const source = sources.get(
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

          context: source
            ? `${source.title} — ${insight.statement}`
            : insight.statement,

          sentiment:
            insight.sentiment,

          created_at:
            getCurrentDate(),
        })
      }
    } catch (error) {
      console.error(
        `Error generating evidence for theme ${theme.id}:`,
        error
      )
    }
  }

  console.log(
    `Generated ${evidence.length} evidence records`
  )

  return evidence
}

export async function generateReport(
  themes: Theme[],
  insights: AtomicInsight[]
): Promise<string> {
  if (
    themes.length === 0 ||
    insights.length === 0
  ) {
    return `
No meaningful Product Discovery Report could be generated because
the analysis did not produce enough customer insights.

Please verify that research sources contain analyzable customer
feedback and run the analysis again.
    `.trim()
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

Do not simply summarize the themes.

Turn the research findings into actionable product intelligence.
            `.trim(),
          },

          {
            role: 'user',

            content: `
Generate an executive Product Discovery summary from these findings.

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

1. The highest-priority customer problems
2. Why they matter
3. Which customer segments are affected
4. What should be prioritized
5. What requires further research
            `.trim(),
          },
        ],

        temperature: 0.4,
      })

    return (
      response.choices[0]
        ?.message?.content || ''
    )
  } catch (error) {
    console.error(
      'Error generating report:',
      error
    )

    return ''
  }
}