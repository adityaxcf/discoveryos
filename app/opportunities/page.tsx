'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, TrendingUp, AlertCircle, HelpCircle } from 'lucide-react'

interface Theme {
  id: string
  name: string
  description: string
  insight_count: number
  source_count: number
  affected_segments: string[]
  confidence: number
  severity: string
  business_impact: string
  opportunity_score: number
  score_breakdown?: Record<string, any>
}

interface ScoringExplanation {
  themeId: string | null
  show: boolean
}

export default function OpportunitiesPage() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<ScoringExplanation>({ themeId: null, show: false })

  useEffect(() => {
    fetchThemes()
  }, [])

  async function fetchThemes() {
    try {
      const res = await fetch('/api/themes?projectId=proj-default')
      const data = (await res.json()) as Theme[]
      setThemes(data.sort((a, b) => b.opportunity_score - a.opportunity_score))
    } catch (error) {
      console.error('Error fetching themes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">Loading opportunities...</p>
      </div>
    )
  }

  if (themes.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600 mb-4">No opportunities found. Run the analysis first.</p>
      </div>
    )
  }

  const highPriority = themes.filter((t) => t.opportunity_score >= 70 && t.confidence >= 0.7)
  const explore = themes.filter((t) => t.opportunity_score >= 50 && t.opportunity_score < 70)
  const lowPriority = themes.filter((t) => t.opportunity_score < 50)

  const OpportunityCard = ({ theme, index }: { theme: Theme; index: number }) => (
    <div className="card-hover space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-slate-900">
            {index + 1}. {theme.name}
          </h3>
          <p className="text-sm text-slate-600 mt-1">{theme.description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-3xl font-bold text-blue-600">{theme.opportunity_score}</div>
          <div className="text-xs text-slate-500">/100</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-slate-600">Sources</div>
          <div className="font-semibold text-slate-900">{theme.source_count}</div>
        </div>
        <div>
          <div className="text-slate-600">Insights</div>
          <div className="font-semibold text-slate-900">{theme.insight_count}</div>
        </div>
        <div>
          <div className="text-slate-600">Severity</div>
          <div className={`badge border mt-1 ${
            theme.severity === 'HIGH'
              ? 'bg-red-50 text-red-700 border-red-200'
              : theme.severity === 'MEDIUM'
                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                : 'bg-green-50 text-green-700 border-green-200'
          }`}>
            {theme.severity}
          </div>
        </div>
        <div>
          <div className="text-slate-600">Impact</div>
          <div className={`badge mt-1 ${
            theme.business_impact === 'HIGH'
              ? 'bg-red-100 text-red-800'
              : theme.business_impact === 'MEDIUM'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
          }`}>
            {theme.business_impact}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {theme.affected_segments.map((seg) => (
          <span key={seg} className="badge bg-slate-100 text-slate-700 border-slate-200">
            {seg}
          </span>
        ))}
      </div>

      <button
        onClick={() => setExpanded({ themeId: theme.id, show: !expanded.show })}
        className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700"
      >
        <HelpCircle size={16} />
        Why {theme.opportunity_score}/100?
        <ChevronDown size={16} className={expanded.themeId === theme.id && expanded.show ? 'rotate-180' : ''} />
      </button>

      {expanded.themeId === theme.id && expanded.show && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm space-y-2">
          <h4 className="font-semibold text-blue-900">Scoring Breakdown</h4>
          {theme.score_breakdown && (
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-blue-800">Severity ({theme.severity}):</span>
                <span className="font-medium text-blue-900">{theme.score_breakdown.severity || 0} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Business Impact ({theme.business_impact}):</span>
                <span className="font-medium text-blue-900">{theme.score_breakdown.impact || 0} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Frequency ({theme.source_count} sources):</span>
                <span className="font-medium text-blue-900">{theme.score_breakdown.frequency || 0} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Confidence:</span>
                <span className="font-medium text-blue-900">{Math.round((theme.confidence || 0) * 10)} pts</span>
              </div>
              <div className="pt-2 border-t border-blue-200 flex justify-between font-semibold">
                <span className="text-blue-900">Total:</span>
                <span className="text-blue-900">{theme.opportunity_score} / 100</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="section-title">Opportunities</h1>
        <p className="text-slate-600">Ranked product opportunities by impact and feasibility</p>
      </div>

      {/* High Priority */}
      {highPriority.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-emerald-600" size={24} />
            <h2 className="section-subtitle mb-0">Prioritize Now ({highPriority.length})</h2>
          </div>
          <p className="text-sm text-slate-600">High confidence + high impact opportunities ready for roadmap</p>
          <div className="space-y-4">
            {highPriority.map((theme, idx) => (
              <OpportunityCard key={theme.id} theme={theme} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* Explore Further */}
      {explore.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-yellow-600" size={24} />
            <h2 className="section-subtitle mb-0">Explore Further ({explore.length})</h2>
          </div>
          <p className="text-sm text-slate-600">Promising opportunities that may need additional research</p>
          <div className="space-y-4">
            {explore.map((theme, idx) => (
              <OpportunityCard key={theme.id} theme={theme} index={highPriority.length + idx} />
            ))}
          </div>
        </section>
      )}

      {/* Low Priority */}
      {lowPriority.length > 0 && (
        <section className="space-y-4">
          <h2 className="section-subtitle">Don't Prioritize Yet ({lowPriority.length})</h2>
          <p className="text-sm text-slate-600">Lower signal opportunities to revisit if patterns emerge</p>
          <div className="space-y-4">
            {lowPriority.map((theme, idx) => (
              <OpportunityCard key={theme.id} theme={theme} index={highPriority.length + explore.length + idx} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
