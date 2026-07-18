# DiscoveryOS Architecture & Implementation Guide

## Project Overview

DiscoveryOS is a full-stack AI-powered Product Discovery and User Research Intelligence application built with Next.js, TypeScript, Tailwind CSS, and SQLite.

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS 3.3 + PostCSS
- **Database**: SQLite (better-sqlite3)
- **AI/ML**: OpenAI API (GPT-4 Turbo)
- **Charts**: Recharts 2.10
- **Icons**: Lucide React 0.294
- **State Management**: React hooks + API calls

## Directory Structure

```
discoveryos/
├── app/
│   ├── layout.tsx                 # Root layout with sidebar
│   ├── globals.css               # Global Tailwind styles
│   ├── page.tsx                  # Overview dashboard
│   ├── api/
│   │   ├── init/route.ts         # Database initialization & demo data
│   │   ├── sources/route.ts      # Fetch research sources
│   │   ├── themes/route.ts       # Fetch AI-identified themes
│   │   ├── insights/route.ts     # Fetch atomic insights
│   │   ├── evidence/route.ts     # Fetch supporting evidence
│   │   ├── analysis/run/route.ts # Execute full AI pipeline
│   │   └── ask/route.ts          # Conversational Q&A endpoint
│   ├── research-sources/page.tsx # Browse & manage sources
│   ├── analysis/page.tsx         # Pipeline progress visualization
│   ├── insights/page.tsx         # View extracted themes
│   ├── opportunities/page.tsx    # Ranked opportunities
│   ├── segments/page.tsx         # Segment-specific analysis
│   ├── ask/page.tsx              # Chat interface
│   └── report/page.tsx           # Professional report generation
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx           # Navigation sidebar
│   └── ui/
│       ├── Badge.tsx             # Reusable badge component
│       ├── Button.tsx            # Reusable button component
│       ├── Card.tsx              # Card container component
│       ├── Modal.tsx             # Modal/dialog component
│       └── LoadingSpinner.tsx    # Loading indicator
├── lib/
│   ├── db.ts                     # SQLite database setup
│   ├── types.ts                  # TypeScript interfaces
│   ├── utils.ts                  # Utility functions
│   ├── ai-pipeline.ts            # 6-stage AI analysis pipeline
│   └── demo-data.ts              # 20 fintech sample sources
├── data/
│   └── discoveryos.db            # SQLite database (created at runtime)
├── public/                        # Static assets
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## Database Schema

### Tables

1. **research_projects**: Stores project metadata
2. **research_sources**: Raw research inputs (interviews, surveys, tickets)
3. **user_segments**: Customer segments (Free Users, Premium, Business)
4. **atomic_insights**: Individual extracted pain points/requests
5. **themes**: Grouped themes identified by AI
6. **theme_insights**: Junction table linking themes to insights
7. **evidence**: Supporting quotes/context for themes
8. **analysis_runs**: Tracks pipeline execution history

## API Endpoints

### Data Initialization
- `POST /api/init` - Initialize database and seed demo data

### Data Retrieval
- `GET /api/sources?projectId=proj-default` - Fetch research sources
- `GET /api/themes?projectId=proj-default` - Fetch identified themes
- `GET /api/insights` - Fetch atomic insights
- `GET /api/evidence?themeId=X` - Fetch evidence for theme

### Analysis
- `POST /api/analysis/run` - Execute 6-stage AI pipeline
- `GET /api/analysis/run?runId=X` - Get pipeline execution status

### Conversational
- `POST /api/ask` - Q&A endpoint for research insights

## AI Pipeline (6 Stages)

The pipeline in `lib/ai-pipeline.ts` runs the following stages:

1. **Extract** (Stage 1): Parse sources into atomic insights
   - Uses GPT-4 to extract 3-5 specific pain points/requests per source
   - Adds sentiment analysis and confidence scores
   - Output: ~40-60 atomic insights

2. **Group** (Stage 2): Cluster insights into themes
   - Groups semantically similar insights
   - Creates theme names and descriptions
   - Identifies affected segments
   - Output: ~8-12 themes

3. **Segment Analysis** (Stage 3): Analyze themes by segment
   - Calculates segment-specific impact
   - Identifies cross-segment patterns
   - Updates affected_segments field

4. **Score & Prioritize** (Stage 4): Calculate opportunity scores
   - Scores 0-100 based on:
     - Frequency (% of sources mentioning)
     - Severity (HIGH/MEDIUM/LOW)
     - Business Impact (HIGH/MEDIUM/LOW)
     - Segment reach (how many segments affected)
   - Generates score_breakdown JSON

5. **Generate Evidence** (Stage 5): Link quotes to themes
   - Extracts direct quotes from sources
   - Links quotes to themes
   - Adds context and sentiment
   - Output: ~20-40 evidence items

6. **Generate Report** (Stage 6): Create synthesis
   - Creates executive summary
   - Lists top problems and recommendations
   - Output: Markdown report

## Page Components

### Overview Dashboard (app/page.tsx)
- Summary stats (sources, insights, themes, segments)
- 4-panel visualization grid:
  - Top opportunities (bar chart-style list)
  - Segment distribution (pie chart)
  - Sentiment analysis (pie chart)
  - Impact vs frequency (scatter plot)
- AI research brief (markdown summary)
- "Analyze Research" CTA

### Research Sources (app/research-sources/page.tsx)
- List all 20 demo research sources
- Filters: Type, Segment, Search
- Click source to view full content in modal
- "Analyze Selected" button

### AI Analysis (app/analysis/page.tsx)
- Visual 6-stage pipeline with progress
- Real-time stage status updates
- Results summary (insights, themes, evidence counts)
- Navigation to Insights/Opportunities pages

### Insights (app/insights/page.tsx)
- Grid of theme cards
- Each card shows:
  - Theme name & description
  - Opportunity score (0-100)
  - Severity & Business Impact badges
  - Affected segments
  - Source & insight counts
- Click card for detailed view
- "Evidence" button shows supporting quotes

### Opportunities (app/opportunities/page.tsx)
- Three priority sections:
  1. Prioritize Now (high score + high confidence)
  2. Explore Further (medium score)
  3. Don't Prioritize Yet (low score)
- Each opportunity shows:
  - Rank number
  - Opportunity score (large)
  - Theme name & description
  - Severity & impact
  - Affected segments
  - "Why [Score]?" breakdown button

### Segments (app/segments/page.tsx)
- One card per segment (Free Users, Premium, Business)
- For each segment:
  - Research source count
  - Top themes (ranked by score)
  - Theme details (severity, impact, source count)
  - List of research sources
  - Segment-specific stats

### Ask DiscoveryOS (app/ask/page.tsx)
- Chat-style conversational interface
- 6 example questions to click
- Question types detected:
  - "biggest problem" → Top theme
  - "affect segments" → Cross-segment themes
  - "features" → Feature request themes
  - Segment-specific ("free users", "premium") → Segment analysis
  - "prioritize" → Top 5 by score
- Response includes:
  - Direct answer
  - Key findings (bullet list)
  - Metrics (in cards)
  - Supporting evidence

### Problem Space Report (app/report/page.tsx)
- Professional, printable report
- Sections:
  - Executive summary
  - Top 5 critical problems
  - Segment-specific analysis
  - Emerging opportunities
  - Don't prioritize yet
  - Research gaps
  - Recommended priorities (3-5 actionable items)
- Print/export buttons
- Print-friendly CSS styling

## Styling System

### Tailwind Components (globals.css)
- `.card` - Base card styling
- `.card-hover` - Card with hover effect
- `.btn-primary` - Primary button (blue)
- `.btn-secondary` - Secondary button (gray)
- `.section-title` - Large heading
- `.section-subtitle` - Medium heading
- `.stat-card` - Statistic card
- `.badge` - Inline badge/tag

### Color Scheme
- Primary: Blue (600, 700)
- Success: Green (100, 200, 700, 800)
- Warning: Yellow (100, 200, 600, 700)
- Danger: Red (50, 100, 200, 600, 700, 800)
- Neutral: Slate (50, 100, 200, 300, 400, 500, 600, 700, 800, 900)

## Demo Data

### Sources (20 total)
- 6 Free Users sources
- 7 Premium Customers sources
- 7 Small Business sources

### Source Types
- Customer Interview
- Support Ticket
- Survey Response
- Feedback Form
- Chat Feedback
- App Review
- Demo Feedback

### Segments
1. Free Users (Low value)
2. Premium Customers (High value)
3. Small Business Customers (Very high value)

## Key Features

✅ **Research Source Management**
- Browse 20 demo sources
- Filter by type, segment, or search
- View full source content in modal
- Timestamps and customer names

✅ **AI Analysis Pipeline**
- 6-stage processing visible in UI
- Real-time progress updates
- Extract insights from sources
- Group into themes
- Score opportunities (0-100)
- Generate supporting evidence

✅ **Intelligence Dashboard**
- Real-time stats (sources, insights, themes)
- 4 interactive charts (recharts)
- Top opportunities visualization
- AI research brief

✅ **Insights & Evidence**
- Browse identified themes
- View supporting quotes
- See severity & impact ratings
- Understand affected segments
- Access original sources

✅ **Opportunity Prioritization**
- Ranked by opportunity score
- Grouped by priority level
- Scoring breakdown explanation
- Cross-segment impact analysis

✅ **Segment Analysis**
- Segment-specific pain points
- Theme distribution by segment
- Research source counts
- Comparative insights

✅ **Conversational Interface**
- Ask questions about research
- Intelligent question detection
- Evidence-backed answers
- Suggested question starters

✅ **Professional Reporting**
- Executive summary
- Top 5 problems with evidence
- Segment analysis
- Research gaps & next steps
- Product recommendations
- Print/export functionality

## Running the Application

### Prerequisites
```bash
node 18+
npm 9+
OPENAI_API_KEY (for AI features)
```

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
# Open http://localhost:3000
```

### Build
```bash
npm run build
npm start
```

## API Response Examples

### GET /api/sources
```json
[{
  "id": "src-f1",
  "title": "Customer Interview: Sarah",
  "type": "Customer Interview",
  "customer_name": "Sarah M.",
  "segment": "Free Users",
  "date": "2024-01-15",
  "raw_content": "...",
  "analysis_status": "pending"
}]
```

### GET /api/themes
```json
[{
  "id": "theme-1",
  "name": "Payment Failure Recovery",
  "description": "Customers experience confusion and friction when payments fail...",
  "insight_count": 12,
  "source_count": 8,
  "affected_segments": ["Free Users", "Premium Customers"],
  "confidence": 0.92,
  "severity": "HIGH",
  "business_impact": "HIGH",
  "opportunity_score": 91,
  "score_breakdown": {
    "frequency": 30,
    "severity": 25,
    "impact": 20,
    "confidence": 16
  }
}]
```

### POST /api/ask
Request:
```json
{
  "question": "What is the biggest problem affecting premium customers?",
  "projectId": "proj-default"
}
```

Response:
```json
{
  "answer": "The biggest problem is **Payment Failure Recovery**...",
  "findings": [
    "Affects all three segments",
    "Severity: HIGH",
    "Business Impact: HIGH"
  ],
  "metrics": [
    "8 sources",
    "12 insights",
    "91 score"
  ],
  "supportingEvidence": [
    "Quote 1 from source",
    "Quote 2 from source"
  ]
}
```

## Performance Optimization

- SQLite queries cached with proper indexing
- Component-level React memoization
- Recharts optimized for <20 data points
- Modal/drawer pattern for evidence details
- Lazy-loaded feature components

## Future Enhancements

1. User authentication & project management
2. Real OpenAI integration for full pipeline
3. Multi-language support
4. Export to PDF reports
5. Collaborative annotation tools
6. Custom segment creation
7. Scheduled analysis runs
8. Webhook integrations
9. Real-time collaboration
10. Advanced filtering & search

## Troubleshooting

### Database not initializing
- Check `data/` directory exists
- Verify write permissions
- Clear and re-run `/api/init`

### API errors
- Verify OPENAI_API_KEY set
- Check network connectivity
- Review console logs

### Styling issues
- Clear `.next` build cache
- Rebuild with `npm run build`
- Verify Tailwind config

## Support

For issues or questions, refer to the main README.md file.
