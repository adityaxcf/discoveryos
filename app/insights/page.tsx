'use client'

import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'

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
}

interface AtomicInsight {
  id: string
  statement: string
  sentiment: string
}

interface Evidence {
  id: string
  theme_id: string
  source_id: string
  quote: string
  context?: string
  sentiment?: string
  source?: {
    id: string
    title: string
    customer_name?: string
    segment: string
    date: string
    type: string
  }
}

export default function InsightsPage() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [_insights, setInsights] = useState<AtomicInsight[]>([])
  const [filtered, setFiltered] = useState<Theme[]>([])
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showEvidence, setShowEvidence] = useState(false)
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [themesRes, insightsRes, evidenceRes] = await Promise.all([
        fetch('/api/themes?projectId=proj-default'),
        fetch('/api/insights'),
        fetch('/api/evidence'),
      ])

      const themesData = (await themesRes.json()) as Theme[]
      const insightsData = (await insightsRes.json()) as AtomicInsight[]
      const evidenceData = (await evidenceRes.json()) as Evidence[]

      setThemes(themesData)
      setInsights(insightsData)
      setEvidence(evidenceData)
      setFiltered(themesData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let result = themes

    if (searchTerm) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFiltered(result)
  }, [searchTerm, themes])

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      HIGH: 'bg-red-50 text-red-700 border-red-200',
      MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      LOW: 'bg-green-50 text-green-700 border-green-200',
    }
    return colors[severity] || 'bg-slate-50 text-slate-700'
  }

  const getImpactColor = (impact: string) => {
    const colors: Record<string, string> = {
      HIGH: 'bg-red-100 text-red-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-green-100 text-green-800',
    }
    return colors[impact] || 'bg-slate-100 text-slate-800'
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">Loading themes...</p>
      </div>
    )
  }

  if (themes.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600 mb-4">No themes found. Run the analysis first.</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="section-title">Insights & Themes</h1>
        <p className="text-slate-600">Semantic clusters of customer pain points and opportunities</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search themes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((theme) => (
          <div
            key={theme.id}
            className="card-hover cursor-pointer relative"
            onClick={() => {
              setSelectedTheme(theme)
              setShowDetails(true)
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                const themeEvidence = evidence.filter((ev) => ev.theme_id === theme.id)
                setSelectedEvidence(themeEvidence)
                setShowEvidence(true)
              }}
              className="absolute top-6 right-6 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200"
            >
              Evidence
            </button>
            
            <div className="mb-3">
              <h3 className="font-semibold text-slate-900 text-lg">{theme.name}</h3>
              <p className="text-sm text-slate-600 mt-2">{theme.description}</p>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Opportunity Score</span>
                <span className="font-bold text-lg text-blue-600">{theme.opportunity_score}/100</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(theme.opportunity_score, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`badge border ${getSeverityColor(theme.severity)}`}>{theme.severity} Severity</span>
              <span className={`badge ${getImpactColor(theme.business_impact)}`}>{theme.business_impact} Impact</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div>
                <div className="text-slate-600">Sources</div>
                <div className="font-semibold text-slate-900">{theme.source_count}</div>
              </div>
              <div>
                <div className="text-slate-600">Insights</div>
                <div className="font-semibold text-slate-900">{theme.insight_count}</div>
              </div>
            </div>

            <div className="text-xs">
              <div className="text-slate-600 mb-1">Affected Segments</div>
              <div className="flex flex-wrap gap-1">
                {theme.affected_segments.map((seg) => (
                  <span key={seg} className="badge bg-slate-100 text-slate-700 border-slate-200">
                    {seg}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetails && selectedTheme && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">{selectedTheme.name}</h2>
              <button onClick={() => setShowDetails(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                <p className="text-slate-700">{selectedTheme.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-600">Severity</div>
                  <div className={`badge border mt-1 ${getSeverityColor(selectedTheme.severity)}`}>
                    {selectedTheme.severity}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Business Impact</div>
                  <div className={`badge mt-1 ${getImpactColor(selectedTheme.business_impact)}`}>
                    {selectedTheme.business_impact}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-600 mb-2">Opportunity Score</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{ width: `${selectedTheme.opportunity_score}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-lg text-blue-600">{selectedTheme.opportunity_score}/100</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Affected Segments</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTheme.affected_segments.map((seg) => (
                    <span key={seg} className="badge bg-slate-100 text-slate-700 border-slate-200">
                      {seg}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-600">Source Count</div>
                  <div className="font-bold text-lg text-slate-900">{selectedTheme.source_count}</div>
                </div>
                <div>
                  <div className="text-slate-600">Insight Count</div>
                  <div className="font-bold text-lg text-slate-900">{selectedTheme.insight_count}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Modal */}
      {showEvidence && selectedEvidence.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Supporting Evidence</h2>
              <button onClick={() => setShowEvidence(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {selectedEvidence.map((ev, idx) => (
                <div key={ev.id} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                  <div className="font-semibold text-slate-900 mb-2">Quote {idx + 1}</div>
                  <blockquote className="italic text-slate-700 mb-3">"{ev.quote}"</blockquote>
                  
                  {ev.source && (
                    <div className="text-sm space-y-1 text-slate-600">
                      <div><strong>Source:</strong> {ev.source.title}</div>
                      <div><strong>Customer:</strong> {ev.source.customer_name || 'Anonymous'}</div>
                      <div><strong>Segment:</strong> {ev.source.segment}</div>
                      <div><strong>Type:</strong> {ev.source.type}</div>
                      <div><strong>Date:</strong> {new Date(ev.source.date).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
