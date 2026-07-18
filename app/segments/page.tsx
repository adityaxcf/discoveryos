'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'

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

interface ResearchSource {
  id: string
  segment: string
  type: string
  title: string
  raw_content: string
}

export default function SegmentsPage() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [sources, setSources] = useState<ResearchSource[]>([])
  const [loading, setLoading] = useState(true)

  const segments = ['Free Users', 'Premium Customers', 'Small Business Customers']

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [themesRes, sourcesRes] = await Promise.all([
        fetch('/api/themes?projectId=proj-default'),
        fetch('/api/sources?projectId=proj-default'),
      ])

      const themesData = (await themesRes.json()) as Theme[]
      const sourcesData = (await sourcesRes.json()) as ResearchSource[]

      setThemes(themesData)
      setSources(sourcesData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">Loading segments...</p>
      </div>
    )
  }

  const getSegmentThemes = (segment: string) => {
    return themes.filter((t) => t.affected_segments.includes(segment)).sort((a, b) => b.opportunity_score - a.opportunity_score)
  }

  const getSegmentSources = (segment: string) => {
    return sources.filter((s) => s.segment === segment)
  }

  const getSegmentColor = (segment: string) => {
    const colors: Record<string, string> = {
      'Free Users': 'bg-slate-50 border-slate-200',
      'Premium Customers': 'bg-blue-50 border-blue-200',
      'Small Business Customers': 'bg-purple-50 border-purple-200',
    }
    return colors[segment] || 'bg-gray-50 border-gray-200'
  }

  const getSegmentAccent = (segment: string) => {
    const colors: Record<string, string> = {
      'Free Users': 'text-slate-700 bg-slate-100',
      'Premium Customers': 'text-blue-700 bg-blue-100',
      'Small Business Customers': 'text-purple-700 bg-purple-100',
    }
    return colors[segment] || 'text-gray-700 bg-gray-100'
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="section-title">Customer Segments</h1>
        <p className="text-slate-600">Analysis by customer segment and value</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {segments.map((segment) => {
          const segmentThemes = getSegmentThemes(segment)
          const segmentSources = getSegmentSources(segment)

          return (
            <div key={segment} className={`border rounded-lg p-6 ${getSegmentColor(segment)}`}>
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${getSegmentAccent(segment)}`}>
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{segment}</h2>
                  <p className="text-sm text-slate-600">{segmentSources.length} research sources</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="text-2xl font-bold text-slate-900">{segmentSources.length}</div>
                  <div className="text-xs text-slate-600 mt-1">Sources</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="text-2xl font-bold text-slate-900">{segmentThemes.length}</div>
                  <div className="text-xs text-slate-600 mt-1">Themes</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="text-2xl font-bold text-slate-900">
                    {segmentThemes.length > 0 ? Math.round(segmentThemes[0].opportunity_score) : 0}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">Top Score</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="text-2xl font-bold text-slate-900">
                    {segmentThemes.filter((t) => t.severity === 'HIGH').length}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">High Severity</div>
                </div>
              </div>

              {/* Top Themes */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Top Pain Points & Opportunities</h3>
                <div className="space-y-2">
                  {segmentThemes.slice(0, 5).map((theme) => (
                    <div key={theme.id} className="bg-white rounded-lg p-3 border border-slate-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-slate-900">{theme.name}</h4>
                        <div className="text-lg font-bold text-blue-600">{theme.opportunity_score}</div>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{theme.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        <span
                          className={`badge border ${
                            theme.severity === 'HIGH'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : theme.severity === 'MEDIUM'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-green-50 text-green-700 border-green-200'
                          }`}
                        >
                          {theme.severity}
                        </span>
                        <span
                          className={`badge ${
                            theme.business_impact === 'HIGH'
                              ? 'bg-red-100 text-red-800'
                              : theme.business_impact === 'MEDIUM'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {theme.business_impact} Impact
                        </span>
                        <span className="text-xs text-slate-500">{theme.source_count} sources</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Source Types */}
              <div className="mt-6">
                <h3 className="font-semibold text-slate-900 mb-3">Research Sources</h3>
                <div className="space-y-2">
                  {segmentSources.map((source) => (
                    <div key={source.id} className="bg-white rounded-lg p-3 border border-slate-200 text-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{source.title}</p>
                          <p className="text-slate-600 text-xs mt-1">{source.type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
