# DiscoveryOS - Quick Reference Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install (1 minute)
```bash
npm install
echo "OPENAI_API_KEY=sk-your-key-here" > .env.local
```

### Step 2: Start (30 seconds)
```bash
npm run dev
```

### Step 3: View (30 seconds)
Open [http://localhost:3000](http://localhost:3000)

---

## 📍 Navigation Map

```
DiscoveryOS
├── 📊 Overview (/)
│   └── Dashboard with stats and charts
├── 📁 Research Sources (/research-sources)
│   └── Browse and filter 20 sources
├── ⚡ AI Analysis (/analysis)
│   └── Run 6-stage pipeline
├── 🔍 Insights (/insights)
│   └── Explore themes with evidence
├── 📈 Opportunities (/opportunities)
│   └── Ranked by opportunity score
├── 👥 Segments (/segments)
│   └── Analysis by customer segment
├── 🧠 Ask DiscoveryOS (/ask)
│   └── Chat Q&A interface
└── 📄 Problem Space Report (/report)
    └── Executive summary
```

---

## 🎯 Demo Flow (3-5 minutes)

### Minute 1: Dashboard
- Show 4 stat cards (20 sources)
- Highlight "Analyze Research Now" CTA

### Minute 2: Research Sources
- Click "Research Sources" in sidebar
- Show 20 sources, search, filter
- Click one to view full content

### Minutes 3-4: Analysis
- Click "Analyze Selected"
- Watch 6 stages execute
- Highlight stage progression

### Minute 5: Explore
- View Insights (click Evidence button)
- View Opportunities (show scoring breakdown)
- Ask DiscoveryOS a question
- Show Report (PDF-ready)

---

## 📚 Key Files Reference

| File | Purpose | Key Content |
|------|---------|-------------|
| `lib/demo-data.ts` | Demo sources | 20 sources, 3 segments |
| `lib/ai-pipeline.ts` | AI logic | 6 pipeline stages |
| `lib/db.ts` | Database | Schema and initialization |
| `lib/types.ts` | TypeScript | All interface definitions |
| `app/globals.css` | Styling | Tailwind utilities |
| `components/layout/Sidebar.tsx` | Navigation | 8-page menu |
| `.env.example` | Config | Environment variables |

---

## 🔧 Common Tasks

### Change Demo Data
```bash
# Edit file:
nano lib/demo-data.ts

# The file structure is simple:
// Add/edit sources in DEMO_DATASET.sources array
// Each source has: id, title, type, customer_name, segment, date, raw_content
```

### Adjust Scoring Formula
```bash
# Edit file:
nano lib/ai-pipeline.ts

# Look for scoreThemes() function (~line 200)
# Modify these values:
// - Severity scoring (HIGH=40, MEDIUM=25, LOW=10)
// - Impact scoring (HIGH=30, MEDIUM=20, LOW=10)
// - Frequency scoring (sources * 5, max 20)
// - Confidence scoring (0-1 * 10)
```

### Change OpenAI Model
```bash
# Edit file:
nano lib/ai-pipeline.ts

# Change model on line 31 and similar:
// model: 'gpt-4-turbo-preview'  // or 'gpt-3.5-turbo'
```

### Reset Database
```bash
# Delete the database file:
rm data/discoveryos.db

# Restart server (creates new one):
npm run dev
```

### Use Different Port
```bash
# Use port 3001 instead of 3000:
npm run dev -- -p 3001
```

---

## 📊 Data Structure

### Theme Model
```typescript
{
  id: string                      // Unique ID
  name: string                    // "Payment Failure Handling"
  description: string             // Long description
  insight_count: number           // How many insights in this theme
  source_count: number            // How many sources mention this
  affected_segments: string[]     // ["Free Users", "Premium"]
  confidence: number              // 0-1
  severity: "HIGH" | "MEDIUM" | "LOW"
  business_impact: "HIGH" | "MEDIUM" | "LOW"
  opportunity_score: number       // 0-100
  score_breakdown: {
    severity: number              // 10-40
    impact: number                // 10-30
    frequency: number             // 0-20
    confidence: number            // 0-10
    total: number                 // 0-100
  }
}
```

### Evidence Model
```typescript
{
  id: string                      // Unique ID
  theme_id: string                // Which theme this quotes supports
  source_id: string               // Which source this is from
  quote: string                   // The actual quote
  context?: string                // Additional context
  sentiment?: string              // "positive", "neutral", "negative"
  source?: {                      // Enriched source data
    title: string
    customer_name?: string
    segment: string
    type: string
    date: string
  }
}
```

---

## 🎨 UI Component Quick Reference

### Buttons
```tsx
// Primary button
<button className="btn-primary">Click me</button>

// Secondary button
<button className="btn-secondary">Click me</button>

// Small button
<button className="btn-primary btn-sm">Click me</button>
```

### Cards
```tsx
// Card wrapper
<div className="card">Content here</div>

// Hoverable card
<div className="card-hover">Content here</div>
```

### Badges
```tsx
// Badge with color
<span className="badge bg-blue-50 text-blue-700 border-blue-200">
  Label
</span>
```

### Typography
```tsx
// Page title
<h1 className="section-title">Title</h1>

// Subtitle
<h2 className="section-subtitle">Subtitle</h2>
```

---

## 🐛 Debugging Tips

### Check API Responses
1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Make a request
4. Click the request to see response

### Check Database
1. Find database file: `data/discoveryos.db`
2. Open with SQLite viewer or:
```bash
sqlite3 data/discoveryos.db
.tables                          # List all tables
SELECT COUNT(*) FROM research_sources;  # Count sources
```

### View Console Logs
1. Press F12 in browser
2. Go to "Console" tab
3. Look for errors in red

### Check Pipeline Progress
1. Go to AI Analysis page
2. Click "Start Analysis"
3. Watch browser console for `console.log()` output

---

## 💡 Pro Tips

### Tip 1: Quick Demo Setup
```bash
# Have everything ready before showing
npm install
npm run dev
# Let it boot while you set up presentation
```

### Tip 2: Use Test Questions
When demoing Ask DiscoveryOS, try these:
- "What is the biggest problem?"
- "What affects premium customers?"
- "What features are requested?"
- "What should we prioritize?"

### Tip 3: Show Evidence
Always click "Evidence" buttons to show:
- Real customer quotes
- Source information
- Segment data
- This proves it's data-backed

### Tip 4: Highlight Scoring
Click "Why 85/100?" on opportunities to show:
- Severity component (40 pts)
- Impact component (30 pts)
- Frequency component (15 pts)
- Confidence component (10 pts)
- This shows the math is transparent

### Tip 5: Segment Analysis
Show how same problem affects segments differently:
- Free Users: "Onboarding friction"
- Premium: "Scaling/performance"
- Business: "Security/compliance"

---

## 🚨 Troubleshooting Quick Answers

| Problem | Solution |
|---------|----------|
| "Module not found" | `rm -rf node_modules && npm install` |
| "API Error" | Check OPENAI_API_KEY is set in `.env.local` |
| "Database locked" | `rm data/discoveryos.db && npm run dev` |
| "Port 3000 in use" | `npm run dev -- -p 3001` |
| "Data not loading" | Try `/api/init` endpoint manually |
| "Analysis hangs" | Check OpenAI account has API credits |
| "Blank page" | Check browser console (F12) for errors |

---

## 📱 Responsive Breakpoints

DiscoveryOS is responsive:
- **Desktop** (>1024px): Full sidebar visible
- **Tablet** (768-1024px): Sidebar collapses
- **Mobile** (<768px): Vertical layout

Test with: Open DevTools → Toggle device toolbar

---

## 🌐 URLs Reference

| Page | URL | Shortcut |
|------|-----|----------|
| Home | http://localhost:3000 | `cmd+k` → type name |
| Sources | http://localhost:3000/research-sources | Click sidebar |
| Analysis | http://localhost:3000/analysis | Click sidebar |
| Insights | http://localhost:3000/insights | Click sidebar |
| Opportunities | http://localhost:3000/opportunities | Click sidebar |
| Segments | http://localhost:3000/segments | Click sidebar |
| Ask | http://localhost:3000/ask | Click sidebar |
| Report | http://localhost:3000/report | Click sidebar |

---

## ⚙️ Advanced Configuration

### .env.local Variables
```bash
# Required
OPENAI_API_KEY=sk-xxx...

# Optional (defaults shown)
DATABASE_PATH=data/discoveryos.db
DEFAULT_PROJECT_ID=proj-default
DEBUG=false
```

### Customize Styling
Edit `tailwind.config.js` to:
- Change primary color (blue)
- Change font
- Add custom utilities
- Change spacing

### Add New Pages
1. Create `app/newpage/page.tsx`
2. Add to `components/layout/Sidebar.tsx`
3. Implement using same patterns

---

## 📦 Dependencies Overview

| Package | Version | Purpose |
|---------|---------|---------|
| next | 14.0.0 | React framework |
| react | 18.2.0 | UI library |
| typescript | 5.3.0 | Type safety |
| tailwindcss | 3.3.0 | Styling |
| recharts | 2.10.0 | Charts |
| openai | 4.20.0 | AI integration |
| better-sqlite3 | 9.1.1 | Database |

---

## 🎓 Learning Resources

### Understand the Code
1. Start with `lib/types.ts` - understand data models
2. Read `app/page.tsx` - see how pages fetch data
3. Check `app/api/analysis/run/route.ts` - understand pipeline
4. Review `components/layout/Sidebar.tsx` - see navigation

### Deployment
1. [Vercel Deployment](https://vercel.com/new)
2. [AWS Deployment](https://aws.amazon.com/getting-started/)
3. [Heroku Deployment](https://www.heroku.com/)

### Further Reading
- QUICKSTART.md - 5-minute setup
- ARCHITECTURE.md - Technical deep dive
- DEMO_INSTRUCTIONS.md - Demo script
- README.md - Full documentation

---

## 🎉 Ready to Go?

Everything is set up. Just:

```bash
npm install
echo "OPENAI_API_KEY=sk-your-key" > .env.local
npm run dev
```

Then open **http://localhost:3000** and start exploring!

---

**Need help?** Check QUICKSTART.md or DEMO_INSTRUCTIONS.md

**Ready to deploy?** Use Vercel (simplest option) or see ARCHITECTURE.md for other platforms.

**Questions about features?** Check README.md or ARCHITECTURE.md

**Happy analyzing! 🚀**
