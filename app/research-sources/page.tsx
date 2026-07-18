'use client'

import { useEffect, useState } from 'react'
import { Search, Play, X } from 'lucide-react'
import Link from 'next/link'

interface ResearchSource {
  id: string
  title: string
  type: string
  customer_name?: string
  segment: string
  date: string
  raw_content: string
  analysis_status: string
}

export default function ResearchSourcesPage() {
  const [sources, setSources] = useState<ResearchSource[]>([])
  const [filtered, setFiltered] = useState<ResearchSource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedSource, setSelectedSource] = useState<ResearchSource | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchSources()
  }, [])

  async function fetchSources() {
    try {
      const res = await fetch('/api/sources?projectId=proj-default')
      const data = (await res.json()) as ResearchSource[]
      setSources(data)
      setFiltered(data)
    } catch (error) {
      console.error('Error fetching sources:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let result = sources

    if (searchTerm) {
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedSegment) {
      result = result.filter((s) => s.segment === selectedSegment)
    }

    if (selectedType) {
      result = result.filter((s) => s.type === selectedType)
    }

    setFiltered(result)
  }, [searchTerm, selectedSegment, selectedType, sources])

  const segments = [...new Set(sources.map((s) => s.segment))]
  const types = [...new Set(sources.map((s) => s.type))]

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Customer Interview': 'bg-blue-50 text-blue-700 border-blue-200',
      'Support Ticket': 'bg-red-50 text-red-700 border-red-200',
      'Survey Response': 'bg-green-50 text-green-700 border-green-200',
      'Feedback Form': 'bg-purple-50 text-purple-700 border-purple-200',
      'Chat Feedback': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'App Review': 'bg-pink-50 text-pink-700 border-pink-200',
      'Demo Feedback': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    }
    return colors[type] || 'bg-slate-50 text-slate-700 border-slate-200'
  }

  const getSegmentColor = (segment: string) => {
    const colors: Record<string, string> = {
      'Free Users': 'bg-slate-100 text-slate-700',
      'Premium Customers': 'bg-blue-100 text-blue-700',
      'Small Business Customers': 'bg-purple-100 text-purple-700',
    }
    return colors[segment] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="section-title">Research Sources</h1>
        <p className="text-slate-600">Manage and analyze your customer research data</p>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by title or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={selectedSegment}
          onChange={(e) => setSelectedSegment(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Segments</option>
          {segments.map((seg) => (
            <option key={seg} value={seg}>
              {seg}
            </option>
          ))}
        </select>

        <Link href="/analysis" className="btn-primary flex items-center gap-2">
          <Play size={16} />
          Analyze Selected
        </Link>
      </div>

      {/* Results */}
      <div className="space-y-2">
        <div className="text-sm text-slate-600">
          Showing {filtered.length} of {sources.length} sources
        </div>

        <div className="grid gap-4">
          {filtered.map((source) => (
            <div
              key={source.id}
              className="card-hover cursor-pointer"
              onClick={() => {
                setSelectedSource(source)
                setShowModal(true)
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{source.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{source.customer_name || 'Anonymous'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge border ${getSegmentColor(source.segment)}`}>{source.segment}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`badge border ${getTypeColor(source.type)}`}>{source.type}</span>
                <span className="text-xs text-slate-500">{new Date(source.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Source Detail Modal */}
        {showModal && selectedSource && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">{selectedSource.title}</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Customer/Respondent</h3>
                  <p className="text-slate-700">{selectedSource.customer_name || 'Anonymous'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Source Type</h3>
                    <p className={`badge border ${getTypeColor(selectedSource.type)}`}>{selectedSource.type}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Segment</h3>
                    <p className={`badge border ${getSegmentColor(selectedSource.segment)}`}>{selectedSource.segment}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Date</h3>
                  <p className="text-slate-700">{new Date(selectedSource.date).toLocaleDateString()}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Content</h3>
                  <div className="bg-slate-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <p className="text-slate-700 whitespace-pre-wrap text-sm">{selectedSource.raw_content}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
