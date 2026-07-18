'use client'

import { useState } from 'react'
import { Play, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface AnalysisState {
  running: boolean
  stage: string
  insights: number
  themes: number
  evidence: number
}

const stages = [
  { id: 'extract', name: 'Extract', description: 'Extract atomic insights from research sources' },
  { id: 'group', name: 'Group', description: 'Cluster insights into coherent themes' },
  { id: 'segment', name: 'Segment Analysis', description: 'Analyze themes by customer segment' },
  { id: 'score', name: 'Score & Prioritize', description: 'Calculate opportunity scores' },
  { id: 'evidence', name: 'Evidence', description: 'Link supporting evidence to themes' },
  { id: 'report', name: 'Report', description: 'Generate synthesis report' },
]

export default function AnalysisPage() {
  const [state, setState] = useState<AnalysisState>({
    running: false,
    stage: 'pending',
    insights: 0,
    themes: 0,
    evidence: 0,
  })

  async function startAnalysis() {
    setState({ running: true, stage: 'extract', insights: 0, themes: 0, evidence: 0 })

    try {
      const response = await fetch('/api/analysis/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: 'proj-default' }),
      })

      const result = await response.json()

      if (result.error) {
        console.error('Analysis error:', result.error)
        setState({ running: false, stage: 'failed', insights: 0, themes: 0, evidence: 0 })
      } else {
        setState({
          running: false,
          stage: 'completed',
          insights: result.insights,
          themes: result.themes,
          evidence: result.evidence,
        })
      }
    } catch (error) {
      console.error('Error starting analysis:', error)
      setState({ running: false, stage: 'failed', insights: 0, themes: 0, evidence: 0 })
    }
  }

  const isStageComplete = (stageId: string) => {
    if (state.stage === 'completed') return true
    const stageIndex = stages.findIndex((s) => s.id === stageId)
    const currentIndex = stages.findIndex((s) => s.id === state.stage)
    return stageIndex < currentIndex
  }

  const isStageActive = (stageId: string) => {
    return state.stage === stageId && state.running
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="section-title">AI Analysis Pipeline</h1>
        <p className="text-slate-600">Run the multi-stage AI agent to analyze your research</p>
      </div>

      {/* Control */}
      <div className="card">
        {!state.running && state.stage !== 'completed' ? (
          <button onClick={startAnalysis} className="btn-primary flex items-center gap-2">
            <Play size={18} />
            Start Analysis
          </button>
        ) : state.running ? (
          <div className="text-center py-4">
            <div className="inline-block">
              <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
            </div>
            <p className="text-slate-600 mt-4">Running analysis...</p>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-800">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={20} />
              <strong>Analysis Complete!</strong>
            </div>
            <p className="text-sm">
              Extracted {state.insights} insights, identified {state.themes} themes, and generated {state.evidence} evidence connections.
            </p>
          </div>
        )}
      </div>

      {/* Pipeline Stages */}
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className={`card transition-all ${
              isStageActive(stage.id)
                ? 'border-blue-500 bg-blue-50'
                : isStageComplete(stage.id)
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 bg-slate-100 text-slate-700">
                {index + 1}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{stage.name}</h3>
                <p className="text-sm text-slate-600">{stage.description}</p>
              </div>

              <div className="flex-shrink-0">
                {isStageComplete(stage.id) ? (
                  <CheckCircle className="text-emerald-600" size={24} />
                ) : isStageActive(stage.id) ? (
                  <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                ) : (
                  <Clock className="text-slate-300" size={24} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Results Summary */}
      {state.stage === 'completed' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="stat-card">
            <div className="text-3xl font-bold text-emerald-600">{state.insights}</div>
            <div className="text-sm text-slate-600 mt-2">Atomic Insights</div>
            <p className="text-xs text-slate-500 mt-1">Extracted pain points and requests</p>
          </div>
          <div className="stat-card">
            <div className="text-3xl font-bold text-blue-600">{state.themes}</div>
            <div className="text-sm text-slate-600 mt-2">Themes</div>
            <p className="text-xs text-slate-500 mt-1">Semantic clusters of insights</p>
          </div>
          <div className="stat-card">
            <div className="text-3xl font-bold text-purple-600">{state.evidence}</div>
            <div className="text-sm text-slate-600 mt-2">Evidence Links</div>
            <p className="text-xs text-slate-500 mt-1">Theme to source connections</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      {state.stage === 'completed' && (
        <div className="flex gap-4">
          <Link href="/insights" className="btn-primary">
            View Insights
          </Link>
          <Link href="/opportunities" className="btn-secondary">
            View Opportunities
          </Link>
        </div>
      )}
    </div>
  )
}
