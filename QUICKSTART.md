# DiscoveryOS Quick Start Guide

Get up and running with DiscoveryOS in 5 minutes!

## Step 1: Prerequisites

Make sure you have:
- **Node.js 18+** ([download](https://nodejs.org))
- **npm 9+** (comes with Node.js)
- **OpenAI API Key** ([get one free](https://platform.openai.com/api-keys))

## Step 2: Clone & Install

```bash
git clone https://github.com/yourusername/discoveryos.git
cd discoveryos
npm install
```

This installs all 15 dependencies including Next.js, React, Tailwind, and OpenAI.

## Step 3: Configure API Key

Create `.env.local` in the project root:

```bash
echo "OPENAI_API_KEY=sk-your-actual-key-here" > .env.local
```

Replace `sk-your-actual-key-here` with your real OpenAI API key.

## Step 4: Start Development Server

```bash
npm run dev
```

You'll see:
```
> next dev

  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
```

## Step 5: Open in Browser

Open [http://localhost:3000](http://localhost:3000)

You should see:
1. **Overview Dashboard** with 4 stat cards
2. **Database initializes** automatically
3. **Demo data loads** (20 research sources)

## 🎯 Your First 5 Minutes

### 1. Browse Demo Sources (1 min)
- Click **"Research Sources"** in sidebar
- See 20 fintech company research sources
- Click one to read full content
- Try searching or filtering by segment

### 2. Run Analysis (2 min)
- Click **"AI Analysis"** in sidebar
- Click **"Start Analysis"** button
- Watch 6-stage pipeline execute:
  - ✅ Extract insights
  - ✅ Group into themes
  - ✅ Analyze segments
  - ✅ Score opportunities
  - ✅ Find evidence
  - ✅ Generate report
- See summary: "Extracted X insights, identified Y themes..."

### 3. Explore Results (2 min)
- Click **"Insights"** → Browse identified themes
- Click **"Opportunities"** → See ranked by score
- Click **"Segments"** → View by customer type
- Click **"Ask DiscoveryOS"** → Try "What's the biggest problem?"

## 📊 What You're Seeing

The demo includes research from a fintech payment company:

**20 Research Sources:**
- 6 from Free Users (individual freelancers)
- 7 from Premium Customers (small businesses)
- 7 from Business Customers (enterprises)

**After Analysis, You Get:**
- ~40-50 atomic insights (specific pain points)
- ~8-12 themes (grouped problems)
- Opportunity scores for each theme (0-100)
- Supporting evidence (customer quotes)
- Segment-specific analysis

## 🔥 Quick Tips

### Try These Searches
In "Ask DiscoveryOS":
- "What's the biggest problem?"
- "Which themes affect all segments?"
- "What features are most requested?"
- "What should we prioritize?"

### Explore These Pages
- **Overview** - High-level dashboard with charts
- **Research Sources** - Browse raw data
- **Insights** - Click to see supporting evidence
- **Opportunities** - Click "Why [Score]?" for breakdown
- **Report** - Professional format for stakeholders

### Customize Demo Data
Edit `lib/demo-data.ts` to:
- Change source titles, types, or content
- Add more research sources
- Modify customer segments
- Update dates

## 🛠️ Common Tasks

### Change OpenAI Model
Edit `lib/ai-pipeline.ts` line 31:
```typescript
model: 'gpt-4-turbo-preview',  // or gpt-3.5-turbo
```

### Reset Database
```bash
rm data/discoveryos.db
# Restart server - will reinitialize automatically
```

### Enable Debug Logging
Edit `lib/ai-pipeline.ts` - look for `console.log()` statements

### Stop the Server
Press `Ctrl+C` in the terminal

## 📱 Mobile-Friendly?

Yes! The app is fully responsive:
- Desktop: Full sidebar + full-width content
- Tablet: Responsive grid layouts
- Mobile: Stack vertically, touch-friendly

## 🚀 Next Steps

### For Development
```bash
npm run dev      # Start dev server
npm run build    # Create production build
npm run start    # Run production build
npm run lint     # Check code quality
```

### For Deployment
See main README.md "Deployment" section

### For Customization
See ARCHITECTURE.md for:
- API endpoint details
- Database schema
- Component structure
- Pipeline stages

## ❓ Troubleshooting

### "OpenAI API error"
- ✅ Check `OPENAI_API_KEY` is set correctly
- ✅ Verify key has API access (not just dashboard)
- ✅ Check OpenAI account has credits

### "Database locked"
- ✅ Close other instances
- ✅ Delete `data/discoveryos.db` and restart

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Port 3000 already in use"
```bash
npm run dev -- -p 3001  # Use port 3001 instead
```

## 📚 Learn More

- **[Full README](README.md)** - Complete documentation
- **[Architecture Guide](ARCHITECTURE.md)** - Technical deep dive
- **[API Docs](ARCHITECTURE.md#api-endpoints)** - Endpoint reference
- **[Database Schema](ARCHITECTURE.md#database-schema)** - Table details

## 🎉 You're Ready!

You now have a fully functional AI-powered research analysis tool. Try it out, explore the features, and build from here!

Questions? Open an issue or contact support.

Happy analyzing! 🚀
