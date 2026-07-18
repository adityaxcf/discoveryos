# DiscoveryOS - AI-Powered Product Discovery & User Research Intelligence

> Transform scattered customer insights into actionable product decisions with AI-powered analysis.

## 🎯 What is DiscoveryOS?

DiscoveryOS is a full-stack web application that uses AI to analyze customer research (interviews, support tickets, surveys, feedback) and automatically identifies:

- **Pain Points & Problems** - What's blocking customers from success
- **Feature Requests** - What customers need most
- **Opportunities** - High-impact areas for product improvement
- **Segment Insights** - How problems differ across customer segments
- **Research Gaps** - What questions remain to be answered

Perfect for Product Managers, Designers, and Research teams planning roadmaps.

## ✨ Key Features

### 📊 Research Management
- Browse and search research sources (20 demo sources included)
- Filter by source type, customer segment, or date
- View full source content with context
- Track analysis status

### 🤖 AI Analysis Pipeline
- **6-stage intelligent analysis**:
  1. Extract atomic insights from each source
  2. Group insights into semantic themes
  3. Analyze themes by customer segment
  4. Score opportunities (0-100)
  5. Generate supporting evidence
  6. Create synthesis report
- Real-time progress visualization
- Results saved to database for later reference

### 📈 Intelligence Dashboard
- Overview of research analysis at a glance
- Summary statistics (sources analyzed, insights extracted, themes identified)
- Interactive visualizations:
  - Top opportunities ranked by impact
  - Segment distribution
  - Sentiment analysis
  - Impact vs frequency scatter plot
- AI research brief (key findings summary)

### 🔍 Insights Browser
- Browse all identified themes
- View theme details and descriptions
- See severity and business impact ratings
- Understand which segments are affected
- Access supporting evidence (customer quotes)

### 🎯 Opportunity Prioritization
- Themes ranked by opportunity score
- Grouped by priority level:
  - **Prioritize Now** - High confidence + high impact
  - **Explore Further** - Promising, needs more research
  - **Don't Prioritize Yet** - Low confidence/signal
- Scoring breakdown shows why each opportunity ranked as it did

### 👥 Segment Analysis
- View analysis by customer segment (Free Users, Premium, Business)
- Segment-specific pain points
- How problems differ between segments
- Research source counts per segment

### 💬 Ask DiscoveryOS
- Conversational interface to query research
- Ask questions like:
  - "What's the biggest problem affecting premium customers?"
  - "Which issues affect multiple segments?"
  - "What features are most requested?"
- Evidence-backed responses with supporting metrics
- Smart question detection

### 📋 Problem Space Report
- Professional report suitable for roadmap planning
- Includes:
  - Executive summary
  - Top 5 critical problems
  - Segment-specific analysis
  - Emerging opportunities
  - Research gaps
  - Recommended product priorities
- Print-friendly layout
- Export to PDF

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- OpenAI API key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/discoveryos.git
cd discoveryos

# Install dependencies
npm install

# Create .env.local file
echo "OPENAI_API_KEY=your-key-here" > .env.local
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**The application will:**
1. Initialize the SQLite database
2. Load 20 demo research sources
3. Display the overview dashboard

### First Steps

1. **View Demo Data**: Go to "Research Sources" to browse the 20 sample fintech company sources
2. **Run Analysis**: Click "Analyze Research" to execute the AI pipeline
3. **Explore Results**: 
   - View identified themes in "Insights"
   - See ranked opportunities in "Opportunities"
   - Check segment-specific insights in "Segments"
4. **Ask Questions**: Use "Ask DiscoveryOS" to query the research
5. **Generate Report**: Create a "Problem Space Report" for stakeholder meetings

## 📁 Project Structure

```
discoveryos/
├── app/
│   ├── page.tsx                  # Overview dashboard
│   ├── research-sources/         # Browse sources
│   ├── analysis/                 # Pipeline execution
│   ├── insights/                 # View themes
│   ├── opportunities/            # Ranked opportunities
│   ├── segments/                 # Segment analysis
│   ├── ask/                      # Chat interface
│   ├── report/                   # Professional report
│   └── api/
│       ├── init/                 # Database setup
│       ├── sources/              # Fetch sources
│       ├── themes/               # Fetch themes
│       ├── insights/             # Fetch insights
│       ├── evidence/             # Fetch evidence
│       ├── analysis/             # Run pipeline
│       └── ask/                  # Q&A endpoint
├── components/                   # Reusable React components
├── lib/
│   ├── db.ts                     # Database setup
│   ├── ai-pipeline.ts           # AI analysis stages
│   ├── types.ts                  # TypeScript definitions
│   ├── utils.ts                  # Utility functions
│   └── demo-data.ts             # Sample sources
└── public/                       # Static assets
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed technical documentation.

## 🎨 Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS 3.3
- **Database**: SQLite with better-sqlite3
- **AI**: OpenAI API (GPT-4 Turbo)
- **Charts**: Recharts 2.10
- **Icons**: Lucide React 0.294
- **APIs**: RESTful endpoints with Next.js Route Handlers

## 💾 Database Schema

- `research_projects` - Project metadata
- `research_sources` - Raw research inputs
- `user_segments` - Customer segments
- `atomic_insights` - Extracted pain points
- `themes` - AI-identified themes
- `evidence` - Supporting quotes
- `analysis_runs` - Pipeline execution history

See [ARCHITECTURE.md](ARCHITECTURE.md) for full schema details.

## 🔌 API Endpoints

### Initialization
```
POST /api/init
```
Initialize database and load demo data.

### Data Retrieval
```
GET /api/sources?projectId=proj-default
GET /api/themes?projectId=proj-default
GET /api/insights
GET /api/evidence?themeId=THEME_ID
```

### Analysis
```
POST /api/analysis/run
Body: { projectId: "proj-default" }
```
Execute 6-stage AI pipeline.

### Conversational
```
POST /api/ask
Body: { question: "Your question", projectId: "proj-default" }
```
Query research data conversationally.

See [ARCHITECTURE.md](ARCHITECTURE.md) for full API documentation.

## 🤖 AI Pipeline (6 Stages)

1. **Extract** - Parse sources into 3-5 atomic insights per source
2. **Group** - Cluster insights into 8-12 themes
3. **Segment** - Analyze themes by customer segment
4. **Score** - Calculate opportunity scores 0-100
5. **Evidence** - Link supporting quotes to themes
6. **Report** - Generate synthesis and recommendations

Each stage builds on the previous, creating progressively richer analysis.

## 📊 Demo Data

Includes 20 research sources for a fintech payment company:
- 6 Free User sources (interviews, surveys, feedback)
- 7 Premium Customer sources
- 7 Small Business Customer sources

**Source Types Included**:
- Customer Interviews
- Support Tickets
- Survey Responses
- Feedback Forms
- Chat Feedback
- App Reviews
- Demo Feedback

## 🎯 Use Cases

### Product Management
- Plan quarterly roadmaps based on customer evidence
- Justify prioritization decisions with data
- Understand segment-specific needs
- Identify gaps in research

### UX/Design
- Understand user pain points
- Validate design decisions with customer feedback
- Discover which features to prioritize
- Understand segment-specific user needs

### Customer Success
- Track emerging customer issues
- Identify at-risk segments
- Understand feature requests by segment
- Plan training/support based on pain points

### Executive Leadership
- High-level view of customer health
- Data-driven roadmap presentations
- Segment performance insights
- Research-backed strategic decisions

## 🔧 Configuration

### Environment Variables
```bash
OPENAI_API_KEY=your-openai-api-key
```

### Database
- SQLite database stored in `data/discoveryos.db`
- Auto-initialized on first API call
- Demo data auto-populated if empty

## 📈 Performance

- **Search**: Instant across 20+ sources
- **Analysis**: ~30-45 seconds for full pipeline (depends on OpenAI latency)
- **Visualization**: Smooth with <20 data points per chart
- **Database**: Sub-100ms queries on demo dataset

## 🐛 Troubleshooting

### Database Issues
```bash
# Reset database
rm data/discoveryos.db
# Reinitialize
curl -X POST http://localhost:3000/api/init
```

### OpenAI Errors
- Verify `OPENAI_API_KEY` is set and valid
- Check OpenAI API quota and usage
- Ensure internet connectivity

### Build Issues
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
npm run dev
```

## 📚 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical deep dive
- [API Documentation](ARCHITECTURE.md#api-endpoints) - Full API reference
- [Database Schema](ARCHITECTURE.md#database-schema) - Table definitions
- [Pipeline Details](ARCHITECTURE.md#ai-pipeline-6-stages) - How analysis works

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel
```

### Docker
```bash
docker build -t discoveryos .
docker run -p 3000:3000 discoveryos
```

### Self-Hosted
```bash
npm run build
npm start
```

**Note**: For production, consider:
- Using PostgreSQL instead of SQLite
- Adding user authentication
- Implementing API rate limiting
- Setting up monitoring/logging

## 🔮 Roadmap

- [ ] User authentication & projects
- [ ] Real OpenAI integration for production
- [ ] Collaborative annotation
- [ ] Custom segment creation
- [ ] Multi-language support
- [ ] PDF export
- [ ] Real-time collaboration
- [ ] Scheduled analysis runs
- [ ] Webhook integrations
- [ ] Advanced search filters

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a Pull Request

## 💬 Support

For questions or issues:
1. Check [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
2. Review example API responses in documentation
3. Open an GitHub issue
4. Contact: support@discoveryos.dev

## 🎉 Getting Started Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Set OpenAI API key in `.env.local`
- [ ] Start dev server (`npm run dev`)
- [ ] Open http://localhost:3000
- [ ] Initialize database (automatic on first load)
- [ ] Browse demo sources
- [ ] Run AI analysis pipeline
- [ ] Explore insights and opportunities
- [ ] Try Ask DiscoveryOS
- [ ] Generate problem space report

---

**Built with ❤️ for Product Managers who want data-driven insights from customer research.**
