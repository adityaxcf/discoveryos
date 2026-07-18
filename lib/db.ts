import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dbPath = path.join(process.cwd(), 'data', 'discoveryos.db')

// Ensure data directory exists
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

export const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

export function initializeDatabase() {
  // ResearchProject table
  db.exec(`
    CREATE TABLE IF NOT EXISTS research_projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  // ResearchSource table
  db.exec(`
    CREATE TABLE IF NOT EXISTS research_sources (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      customer_name TEXT,
      segment TEXT NOT NULL,
      date TEXT NOT NULL,
      raw_content TEXT NOT NULL,
      analysis_status TEXT DEFAULT 'pending',
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES research_projects(id)
    )
  `)

  // UserSegment table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_segments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      value_tier TEXT
    )
  `)

  // AtomicInsight table
  db.exec(`
    CREATE TABLE IF NOT EXISTS atomic_insights (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      statement TEXT NOT NULL,
      quote TEXT,
      sentiment TEXT,
      confidence REAL,
      segment TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (source_id) REFERENCES research_sources(id)
    )
  `)

  // Theme table
  db.exec(`
    CREATE TABLE IF NOT EXISTS themes (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      insight_count INTEGER DEFAULT 0,
      source_count INTEGER DEFAULT 0,
      affected_segments TEXT,
      confidence REAL,
      severity TEXT,
      business_impact TEXT,
      opportunity_score REAL DEFAULT 0,
      score_breakdown TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES research_projects(id)
    )
  `)

  // ThemeInsight join table
  db.exec(`
    CREATE TABLE IF NOT EXISTS theme_insights (
      theme_id TEXT NOT NULL,
      insight_id TEXT NOT NULL,
      PRIMARY KEY (theme_id, insight_id),
      FOREIGN KEY (theme_id) REFERENCES themes(id),
      FOREIGN KEY (insight_id) REFERENCES atomic_insights(id)
    )
  `)

  // Evidence table
  db.exec(`
    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY,
      theme_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      quote TEXT NOT NULL,
      context TEXT,
      sentiment TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (theme_id) REFERENCES themes(id),
      FOREIGN KEY (source_id) REFERENCES research_sources(id)
    )
  `)

  // AnalysisRun table
  db.exec(`
    CREATE TABLE IF NOT EXISTS analysis_runs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      status TEXT NOT NULL,
      current_stage TEXT,
      stages_data TEXT,
      results TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES research_projects(id)
    )
  `)
}
