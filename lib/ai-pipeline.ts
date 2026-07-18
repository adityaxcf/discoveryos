import { generateId, getCurrentDate } from './utils'
import {
  ResearchSource,
  AtomicInsight,
  Theme,
  Evidence,
} from './types'

type Sentiment = 'positive' | 'neutral' | 'negative'

type ThemeDefinition = {
  name: string
  description: string
  keywords: string[]
}

const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    name: 'Performance & Reliability',
    description:
      'Customers experience slow, unreliable, or unstable product behavior that disrupts important workflows.',
    keywords: [
      'slow',
      'slower',
      'lag',
      'laggy',
      'freeze',
      'frozen',
      'crash',
      'loading',
      'performance',
      'timeout',
      'unresponsive',
      'unreliable',
      'downtime',
      'error',
      'failed',
      'failure',
      'bug',
    ],
  },
  {
    name: 'Integrations & Connectivity',
    description:
      'Customers need stronger integrations and smoother connections with the tools they already use.',
    keywords: [
      'integration',
      'integrate',
      'connect',
      'sync',
      'slack',
      'salesforce',
      'hubspot',
      'api',
      'zapier',
      'export',
      'import',
      'webhook',
      'calendar',
    ],
  },
  {
    name: 'Pricing & Plan Limitations',
    description:
      'Pricing, plan restrictions, or feature limits create friction and reduce perceived product value.',
    keywords: [
      'price',
      'pricing',
      'expensive',
      'cost',
      'plan',
      'premium',
      'upgrade',
      'subscription',
      'pay',
      'paid',
      'limit',
      'limited',
      'free tier',
    ],
  },
  {
    name: 'Usability & Workflow Friction',
    description:
      'Customers encounter confusing or inefficient workflows that make the product harder to use.',
    keywords: [
      'confusing',
      'difficult',
      'hard to',
      'complicated',
      'workflow',
      'click',
      'steps',
      'navigation',
      'navigate',
      'interface',
      'ui',
      'ux',
      'find',
      'frustrating',
      'frustrated',
      'manual',
      'tedious',
    ],
  },
  {
    name: 'Reporting & Analytics',
    description:
      'Customers need better reporting, analytics, visibility, and ways to understand or share their data.',
    keywords: [
      'report',
      'reporting',
      'analytics',
      'dashboard',
      'metrics',
      'data',
      'chart',
      'insight',
      'visibility',
      'filter',
      'csv',
    ],
  },
  {
    name: 'Collaboration & Team Management',
    description:
      'Teams need better collaboration, sharing, permissions, and multi-user workflows.',
    keywords: [
      'team',
      'collaborate',
      'collaboration',
      'share',
      'sharing',
      'permission',
      'role',
      'member',
      'workspace',
      'invite',
      'approval',
    ],
  },
  {
    name: 'Onboarding & Discoverability',
    description:
      'Customers struggle to get started or discover important product capabilities.',
    keywords: [
      'onboarding',
      'setup',
      'getting started',
      'tutorial',
      'documentation',
      'docs',
      'discover',
      'discoverability',
      'learn',
      'learning',
      'understand',
    ],
  },
  {
    name: 'Automation & Productivity',
    description:
      'Customers want to reduce repetitive work through automation and more efficient product capabilities.',
    keywords: [
      'automate',
      'automation',
      'automatic',
      'repetitive',
      'bulk',
      'batch',
      'shortcut',
      'productivity',
      'save time',
      'faster',
    ],
  },
  {
    name: 'Customization & Flexibility',
    description:
      'Customers need more control over how the product is configured and adapted to their workflows.',
    keywords: [
      'custom',
      'customize',
      'customization',
      'flexible',
      'flexibility',
      'template',
      'configure',
      'configuration',
      'personalize',
      'field',
    ],
  },
  {
    name: 'Notifications & Communication',
    description:
      'Customers need clearer, more timely, and more controllable notifications and communication.',
    keywords: [
      'notification',
      'notify',
      'alert',
      'email',
      'message',
      'reminder',
      'communication',
    ],
  },
]

const NEGATIVE_WORDS = [
  'problem',
  'issue',
  'slow',
  'difficult',
  'hard',
  'confusing',
  'frustrating',
  'frustrated',
  'hate',
  'bad',
  'poor',
  'broken',
  'fail',
  'failed',
  'failure',
  'crash',
  'bug',
  'error',
  'expensive',
  'missing',
  'cannot',
  "can't",
  'unable',
  'annoying',
  'pain',
  'unreliable',
  'limitation',
  'limited',
]

const POSITIVE_WORDS = [
  'love',
  'great',
  'good',
  'excellent',
  'easy',
  'helpful',
  'useful',
  'fast',
  'simple',
  'happy',
  'like',
  'valuable',
  'works well',
]

const SIGNAL_PHRASES = [
  'need',
  'want',
  'wish',
  'would like',
  'should',
  'could',
  'problem',
  'issue',
  'difficult',
  'hard',
  'frustrat',
  'slow',
  'missing',
  'cannot',
  "can't",
  'unable',
  'love',
  'like',
  'hate',
  'better',
  'improve',
  'feature',
  'request',
  'pain',
  'struggle',
  'expensive',
  'manual',
  'time',
]

function cleanText(text: string): string {
  return text
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .trim()
}

function splitIntoCandidateSentences(text: string): string[] {
  const cleaned = cleanText(text)

  const pieces = cleaned
    .split(/\n+|(?<=[.!?])\s+/)
    .map((item) =>
      item
        .replace(/^[-•*]\s*/, '')
        .replace(/^(customer|user|interviewer|participant)\s*:\s*/i, '')
        .trim()
    )
    .filter((item) => item.length >= 20)

  return [...new Set(pieces)]
}

function keywordHits(text: string, keywords: string[]): number {
  const lower = text.toLowerCase()

  return keywords.reduce(
    (count, keyword) =>
      count + (lower.includes(keyword.toLowerCase()) ? 1 : 0),
    0
  )
}

function detectSentiment(text: string): Sentiment {
  const negative = keywordHits(text, NEGATIVE_WORDS)
  const positive = keywordHits(text, POSITIVE_WORDS)

  if (negative > positive) return 'negative'
  if (positive > negative) return 'positive'

  return 'neutral'
}

function insightQuality(text: string): number {
  const lower = text.toLowerCase()

  let score = 0

  for (const phrase of SIGNAL_PHRASES) {
    if (lower.includes(phrase)) score += 2
  }

  for (const definition of THEME_DEFINITIONS) {
    score += Math.min(keywordHits(lower, definition.keywords), 3)
  }

  if (text.length >= 35 && text.length <= 300) score += 2
  if (detectSentiment(text) !== 'neutral') score += 2

  return score
}

function makeStatement(sentence: string): string {
  let statement = sentence
    .replace(/^["']|["']$/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (statement.length > 220) {
    statement = `${statement.slice(0, 217).trim()}...`
  }

  return statement
}

function classifyTheme(text: string): ThemeDefinition {
  let bestTheme = THEME_DEFINITIONS[3]
  let bestScore = 0

  for (const definition of THEME_DEFINITIONS) {
    const score = keywordHits(text, definition.keywords)

    if (score > bestScore) {
      bestScore = score
      bestTheme = definition
    }
  }

  if (bestScore === 0) {
    const lower = text.toLowerCase()

    if (
      lower.includes('need') ||
      lower.includes('want') ||
      lower.includes('feature') ||
      lower.includes('wish')
    ) {
      return {
        name: 'Feature Gaps & Unmet Needs',
        description:
          'Customers describe unmet needs or capabilities they expect the product to provide.',
        keywords: [],
      }
    }

    return {
      name: 'General Product Experience',
      description:
        'Customers describe broader product experience issues and opportunities that require product attention.',
      keywords: [],
    }
  }

  return bestTheme
}

function severityForTheme(
  theme: Theme,
  relatedInsights: AtomicInsight[]
): 'HIGH' | 'MEDIUM' | 'LOW' {
  const combined = relatedInsights
    .map((insight) => `${insight.statement} ${insight.quote}`)
    .join(' ')
    .toLowerCase()

  const highSignals = [
    'cannot',
    "can't",
    'unable',
    'blocked',
    'blocking',
    'crash',
    'failed',
    'failure',
    'lost',
    'data loss',
    'churn',
    'cancel',
    'abandon',
    'unusable',
    'critical',
  ]

  const mediumSignals = [
    'slow',
    'frustrat',
    'difficult',
    'confusing',
    'manual',
    'annoying',
    'problem',
    'issue',
    'limitation',
  ]

  const highHits = keywordHits(combined, highSignals)
  const mediumHits = keywordHits(combined, mediumSignals)

  if (
    highHits >= 1 ||
    theme.source_count >= 5 ||
    (theme.source_count >= 3 && relatedInsights.length >= 5)
  ) {
    return 'HIGH'
  }

  if (
    mediumHits >= 1 ||
    theme.source_count >= 2 ||
    relatedInsights.length >= 3
  ) {
    return 'MEDIUM'
  }

  return 'LOW'
}

function businessImpactForTheme(
  theme: Theme,
  relatedInsights: AtomicInsight[]
): 'HIGH' | 'MEDIUM' | 'LOW' {
  const combined = relatedInsights
    .map((insight) => `${insight.statement} ${insight.quote}`)
    .join(' ')
    .toLowerCase()

  const highSignals = [
    'cancel',
    'churn',
    'revenue',
    'purchase',
    'payment',
    'pay',
    'business',
    'customer',
    'blocked',
    'cannot',
    "can't",
    'critical',
  ]

  const mediumSignals = [
    'support',
    'slow',
    'manual',
    'time',
    'workflow',
    'productivity',
    'engagement',
    'frustrat',
    'difficult',
  ]

  if (
    keywordHits(combined, highSignals) >= 2 ||
    theme.source_count >= 5
  ) {
    return 'HIGH'
  }

  if (
    keywordHits(combined, mediumSignals) >= 1 ||
    theme.source_count >= 2
  ) {
    return 'MEDIUM'
  }

  return 'LOW'
}

/**
 * STAGE 1
 * Extract meaningful atomic insights directly from source text.
 * No external AI/API required.
 */
export async function extractInsights(
  sources: ResearchSource[]
): Promise<AtomicInsight[]> {
  if (!sources || sources.length === 0) {
    throw new Error('No research sources were provided.')
  }

  const insights: AtomicInsight[] = []

  for (const source of sources) {
    const content = source.raw_content?.trim()

    if (!content) {
      console.warn(`Skipping empty source: ${source.title}`)
      continue
    }

    const candidates = splitIntoCandidateSentences(content)

    const ranked = candidates
      .map((sentence) => ({
        sentence,
        score: insightQuality(sentence),
      }))
      .filter((item) => item.score >= 2)
      .sort((a, b) => b.score - a.score)

    let selected = ranked.slice(0, 5)

    if (selected.length === 0 && candidates.length > 0) {
      selected = candidates.slice(0, 2).map((sentence) => ({
        sentence,
        score: 1,
      }))
    }

    const seen = new Set<string>()

    for (const item of selected) {
      const statement = makeStatement(item.sentence)
      const normalized = statement.toLowerCase()

      if (!statement || seen.has(normalized)) continue

      seen.add(normalized)

      insights.push({
        id: generateId(),
        source_id: source.id,
        statement,
        quote: item.sentence.trim(),
        sentiment: detectSentiment(item.sentence),
        confidence: Math.min(0.95, 0.65 + item.score * 0.035),
        segment: source.segment || 'Unknown',
        created_at: getCurrentDate(),
      })
    }
  }

  if (insights.length === 0) {
    throw new Error(
      `Analysis processed ${sources.length} sources but could not extract usable insights.`
    )
  }

  console.log(
    `Extracted ${insights.length} insights from ${sources.length} sources.`
  )

  return insights
}

/**
 * STAGE 2
 * Group insights into product themes.
 */
export async function groupInsights(
  insights: AtomicInsight[],
  sources: ResearchSource[]
): Promise<Theme[]> {
  if (insights.length === 0) {
    throw new Error('No insights available for theme grouping.')
  }

  const groups = new Map<
    string,
    {
      definition: ThemeDefinition
      insights: AtomicInsight[]
    }
  >()

  for (const insight of insights) {
    const definition = classifyTheme(
      `${insight.statement} ${insight.quote}`
    )

    const existing = groups.get(definition.name)

    if (existing) {
      existing.insights.push(insight)
    } else {
      groups.set(definition.name, {
        definition,
        insights: [insight],
      })
    }
  }

  const sourceIds = new Set(sources.map((source) => source.id))

  const themes: Theme[] = []

  for (const group of groups.values()) {
    const validInsights = group.insights.filter((insight) =>
      sourceIds.has(insight.source_id)
    )

    if (validInsights.length === 0) continue

    const affectedSegments = [
      ...new Set(
        validInsights
          .map((insight) => insight.segment)
          .filter(
            (segment): segment is string =>
              typeof segment === 'string' && segment.length > 0
          )
      ),
    ]

    const distinctSources = new Set(
      validInsights.map((insight) => insight.source_id)
    )

    const averageConfidence =
      validInsights.reduce(
        (sum, insight) => sum + Number(insight.confidence || 0),
        0
      ) / validInsights.length

    themes.push({
      id: generateId(),
      project_id: '',
      name: group.definition.name,
      description: group.definition.description,
      insight_count: validInsights.length,
      source_count: distinctSources.size,
      affected_segments: affectedSegments,
      confidence: averageConfidence,
      severity: 'MEDIUM',
      business_impact: 'MEDIUM',
      opportunity_score: 0,
      created_at: getCurrentDate(),
    })
  }

  themes.sort((a, b) => b.insight_count - a.insight_count)

  if (themes.length === 0) {
    throw new Error('Analysis could not generate any product themes.')
  }

  console.log(
    `Grouped ${insights.length} insights into ${themes.length} themes.`
  )

  return themes
}

/**
 * STAGE 3
 * Analyze severity and business impact locally.
 */
export async function analyzeSeverity(
  themes: Theme[]
): Promise<Theme[]> {
  return themes.map((theme) => {
    /*
     * We do not receive insights directly in this function,
     * so frequency and theme identity provide deterministic signals.
     */

    const highPriorityNames = [
      'Performance & Reliability',
      'Pricing & Plan Limitations',
    ]

    let severity: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'
    let businessImpact: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'

    if (
      theme.source_count >= 5 ||
      (highPriorityNames.includes(theme.name) &&
        theme.source_count >= 3)
    ) {
      severity = 'HIGH'
    } else if (
      theme.source_count <= 1 &&
      theme.insight_count <= 1
    ) {
      severity = 'LOW'
    }

    if (
      theme.source_count >= 5 ||
      theme.name === 'Pricing & Plan Limitations' ||
      (theme.name === 'Performance & Reliability' &&
        theme.source_count >= 3)
    ) {
      businessImpact = 'HIGH'
    } else if (
      theme.source_count <= 1 &&
      theme.insight_count <= 1
    ) {
      businessImpact = 'LOW'
    }

    return {
      ...theme,
      severity,
      business_impact: businessImpact,
    }
  })
}

/**
 * STAGE 4
 * Calculate opportunity scores.
 */
export async function scoreThemes(
  themes: Theme[]
): Promise<Theme[]> {
  for (const theme of themes) {
    const severityScore =
      theme.severity === 'HIGH'
        ? 40
        : theme.severity === 'MEDIUM'
          ? 25
          : 10

    const impactScore =
      theme.business_impact === 'HIGH'
        ? 30
        : theme.business_impact === 'MEDIUM'
          ? 20
          : 10

    const frequencyScore = Math.min(theme.source_count * 5, 20)

    const confidenceScore = Math.min(
      Math.max(theme.confidence * 10, 0),
      10
    )

    const totalScore = Math.min(
      severityScore +
        impactScore +
        frequencyScore +
        confidenceScore,
      100
    )

    theme.opportunity_score = Math.round(totalScore)

    theme.score_breakdown = {
      severity: severityScore,
      impact: impactScore,
      frequency: frequencyScore,
      confidence: confidenceScore,
      total: theme.opportunity_score,
    }
  }

  return themes.sort(
    (a, b) => b.opportunity_score - a.opportunity_score
  )
}

/**
 * STAGE 5
 * Connect themes to real source quotes.
 */
export async function generateEvidence(
  themes: Theme[],
  insights: AtomicInsight[],
  sources: Map<string, ResearchSource>
): Promise<Evidence[]> {
  const evidence: Evidence[] = []

  for (const theme of themes) {
    const rankedMatches = insights
      .map((insight) => {
        const classified = classifyTheme(
          `${insight.statement} ${insight.quote}`
        )

        return {
          insight,
          match: classified.name === theme.name,
        }
      })
      .filter((item) => item.match)
      .map((item) => item.insight)

    const uniqueSources = new Set<string>()
    const selected: AtomicInsight[] = []

    for (const insight of rankedMatches) {
      if (!uniqueSources.has(insight.source_id)) {
        selected.push(insight)
        uniqueSources.add(insight.source_id)
      }

      if (selected.length >= 3) break
    }

    if (selected.length < 2) {
      for (const insight of rankedMatches) {
        if (!selected.includes(insight)) {
          selected.push(insight)
        }

        if (selected.length >= 3) break
      }
    }

    for (const insight of selected) {
      const source = sources.get(insight.source_id)

      evidence.push({
        id: generateId(),
        theme_id: theme.id,
        source_id: insight.source_id,
        quote: insight.quote || insight.statement,
        context: source
          ? `${source.title}${
              source.customer_name
                ? ` — ${source.customer_name}`
                : ''
            } — ${insight.statement}`
          : insight.statement,
        sentiment: insight.sentiment,
        created_at: getCurrentDate(),
      })
    }
  }

  console.log(`Generated ${evidence.length} evidence records.`)

  return evidence
}

/**
 * STAGE 6
 * Generate a local executive Product Discovery report.
 */
export async function generateReport(
  themes: Theme[],
  insights: AtomicInsight[]
): Promise<string> {
  if (themes.length === 0 || insights.length === 0) {
    throw new Error(
      'Cannot generate report because analysis produced no themes or insights.'
    )
  }

  const ranked = [...themes].sort(
    (a, b) => b.opportunity_score - a.opportunity_score
  )

  const topThemes = ranked.slice(0, 5)
  const top = topThemes[0]

  const allSegments = [
    ...new Set(
      topThemes.flatMap((theme) => theme.affected_segments)
    ),
  ]

  const highPriority = topThemes.filter(
    (theme) =>
      theme.severity === 'HIGH' ||
      theme.business_impact === 'HIGH'
  )

  const paragraph1 =
    `DiscoveryOS analyzed ${insights.length} atomic customer insights and identified ${themes.length} major product themes. ` +
    `The highest-priority opportunity is "${top.name}", with an opportunity score of ${top.opportunity_score}/100. ` +
    `${top.description} This finding appears across ${top.source_count} distinct research sources and ${top.insight_count} customer insights.`

  const paragraph2 =
    highPriority.length > 0
      ? `The most significant problem areas are ${highPriority
          .map(
            (theme) =>
              `${theme.name} (${theme.opportunity_score}/100)`
          )
          .join(
            ', '
          )}. These themes rank highly because of their combination of customer frequency, severity, business impact, and evidence confidence.`
      : `The research indicates several medium-priority opportunities rather than one dominant critical failure. Product teams should compare frequency and customer impact before committing roadmap capacity.`

  const paragraph3 =
    allSegments.length > 0
      ? `The leading findings affect ${allSegments.join(
          ', '
        )}. Product decisions should account for differences between these customer segments rather than assuming every problem has equal impact across the user base.`
      : `The findings span multiple customer contexts. Additional segmentation would improve prioritization and help identify which users experience each problem most strongly.`

  const paragraph4 =
    `Product Managers should prioritize validating "${top.name}" first, starting with the supporting customer evidence and the workflows most affected. ` +
    `The next roadmap candidates are ${topThemes
      .slice(1, 4)
      .map((theme) => `"${theme.name}"`)
      .join(
        ', '
      ) || 'the remaining ranked opportunities'}. Improvements should be tested against measurable outcomes such as reduced friction, higher engagement, retention, or task success.`

  const paragraph5 =
    `Further research should focus on themes supported by fewer sources, validate whether reported problems occur consistently across segments, and quantify their effect on customer behavior. The opportunity scores should be treated as prioritization signals grounded in the current research dataset, not as substitutes for product validation.`

  return [
    paragraph1,
    paragraph2,
    paragraph3,
    paragraph4,
    paragraph5,
  ].join('\n\n')
}