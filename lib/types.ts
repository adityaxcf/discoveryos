export interface ResearchProject {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface ResearchSource {
  id: string
  project_id: string
  title: string
  type: 'Customer Interview' | 'Support Ticket' | 'Survey Response' | 'Feedback Form' | 'Chat Feedback' | 'App Review' | 'Demo Feedback'
  customer_name?: string
  segment: string
  date: string
  raw_content: string
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
}

export interface UserSegment {
  id: string
  name: string
  description?: string
  value_tier?: string
}

export interface AtomicInsight {
  id: string
  source_id: string
  statement: string
  quote?: string
  sentiment: 'positive' | 'neutral' | 'negative'
  confidence: number
  segment?: string
  created_at: string
}

export interface Theme {
  id: string
  project_id: string
  name: string
  description: string
  insight_count: number
  source_count: number
  affected_segments: string[]
  confidence: number
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  business_impact: 'LOW' | 'MEDIUM' | 'HIGH'
  opportunity_score: number
  score_breakdown?: Record<string, any>
  created_at: string
}

export interface Evidence {
  id: string
  theme_id: string
  source_id: string
  quote: string
  context?: string
  sentiment?: string
  created_at: string
}

export interface AnalysisRun {
  id: string
  project_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  current_stage: string
  stages_data: Record<string, any>
  results: Record<string, any>
  created_at: string
  updated_at: string
}

export interface StageResult {
  stage: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  data: any
  timestamp: string
}

export interface ScoringBreakdown {
  frequency: number
  severity: string
  business_impact: string
  segment_value: number
  confidence: number
  total_score: number
}
