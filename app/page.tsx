'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'
import { ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'

interface ResearchSource {
  id: string
  title: string
  type: string
  segment: string
  date: string
}

interface Theme {
  id: string
  name: string
  severity: string
  business_impact: string
  opportunity_score: number
  affected_segments: string[]
}

interface AtomicInsight {
  id: string
  statement: string
  sentiment: string
}

export default function OverviewPage() {
  const [stats, setStats] = useState({
    sources: 0,
    insights: 0,
    themes: 0,
    segments: 3,
  })
  const [themes, setThemes] = useState<Theme[]>([])
  const [insights, setInsights] = useState<AtomicInsight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initAndFetch()
  }, [])

  async function initAndFetch() {
    try {
      // Initialize database
      await fetch('/api/init', { method: 'POST' })

      // Fetch data
      const [sourcesRes, themesRes, insightsRes] = await Promise.all([
        fetch('/api/sources?projectId=proj-default'),
        fetch('/api/themes?projectId=proj-default'),
        fetch('/api/insights'),
      ])

      const sourcesData = (await sourcesRes.json()) as ResearchSource[]
      const themesData = (await themesRes.json()) as Theme[]
      const insightsData = (await insightsRes.json()) as AtomicInsight[]

      setStats({
        sources: sourcesData.length,
        insights: insightsData.length,
        themes: themesData.length,
        segments: 3,
      })

      setThemes(themesData)
      setInsights(insightsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const topThemes = themes.slice(0, 5)
  const segmentData = [
    { name: 'Free Users', value: stats.sources * 0.3 },
    { name: 'Premium Customers', value: stats.sources * 0.45 },
    { name: 'Small Business', value: stats.sources * 0.25 },
  ]

  const sentimentData = [
    { name: 'Positive', value: insights.filter((i) => i.sentiment === 'positive').length },
    { name: 'Neutral', value: insights.filter((i) => i.sentiment === 'neutral').length },
    { name: 'Negative', value: insights.filter((i) => i.sentiment === 'negative').length },
  ]

  const severityData = themes.map((t) => ({
    name: t.name.substring(0, 15),
    score: t.opportunity_score,
    impact: t.business_impact === 'HIGH' ? 3 : t.business_impact === 'MEDIUM' ? 2 : 1,
  }))

  const COLORS = ['#3b82f6', '#ec4899', '#f59e0b']

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-slate-900">DiscoveryOS</h1>
        <p className="text-lg text-slate-600">Turn customer conversations into product decisions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="text-3xl font-bold text-blue-600">{stats.sources}</div>
          <div className="text-sm text-slate-600 mt-2">Research Sources Analyzed</div>
        </div>
        <div className="stat-card">
          <div className="text-3xl font-bold text-emerald-600">{stats.insights}</div>
          <div className="text-sm text-slate-600 mt-2">Customer Insights Extracted</div>
        </div>
        <div className="stat-card">
          <div className="text-3xl font-bold text-purple-600">{stats.themes}</div>
          <div className="text-sm text-slate-600 mt-2">Themes Identified</div>
        </div>
        <div className="stat-card">
          <div className="text-3xl font-bold text-orange-600">{stats.segments}</div>
          <div className="text-sm text-slate-600 mt-2">User Segments</div>
        </div>
      </div>

      {/* CTA */}
      {stats.themes === 0 && (
        <Link href="/analysis" className="btn-primary flex items-center gap-2 w-fit">
          <Zap size={18} />
          Analyze Research Now
          <ArrowRight size={18} />
        </Link>
      )}

      {/* Visualizations */}
      {stats.themes > 0 && (
        <div className="grid grid-cols-2 gap-6">
          {/* Top Themes */}
          <div className="card">
            <h3 className="section-subtitle">Top Opportunities</h3>
            <div className="space-y-3">
              {topThemes.map((theme, idx) => (
                <div key={theme.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{idx + 1}. {theme.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{theme.affected_segments.join(', ')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{theme.opportunity_score}</div>
                    <div className="text-xs text-slate-500">score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Segment Distribution */}
          <div className="card">
            <h3 className="section-subtitle">Segment Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={segmentData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-4 text-xs">
              {segmentData.map((seg, idx) => (
                <div key={seg.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                  <span className="text-slate-600">{seg.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment Breakdown */}
          <div className="card">
            <h3 className="section-subtitle">Sentiment Analysis</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  <Cell fill="#10b981" />
                  <Cell fill="#6b7280" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-4 text-xs">
              {sentimentData.map((sent) => (
                <div key={sent.name} className="text-slate-600">
                  {sent.name}: {sent.value}
                </div>
              ))}
            </div>
          </div>

          {/* Score vs Impact */}
          <div className="card">
            <h3 className="section-subtitle">Impact vs Score</h3>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="score" type="number" />
                <YAxis dataKey="impact" type="number" />
                <Tooltip />
                <Scatter name="Themes" data={severityData} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Research Brief */}
      {stats.themes > 0 && (
        <div className="card">
          <h3 className="section-subtitle">AI Research Brief</h3>
          <div className="prose prose-sm max-w-none text-slate-700">
            <p>
              Analysis of {stats.sources} research sources across {stats.segments} customer segments identified{' '}
              <strong>{stats.themes} major themes</strong> and <strong>{stats.insights} atomic insights</strong>.
            </p>
            <p className="mt-2">
              <strong>Key Findings:</strong> The top priority is <strong>{topThemes[0]?.name}</strong> affecting multiple segments. Other critical areas include checkout friction, payment failures, and missing integrations.
            </p>
            <p className="mt-2">
              <strong>Recommendation:</strong> Focus roadmap on the top 3-5 high-score opportunities to maximize customer impact and retention.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
