# AI Resume Review

AI-powered consulting resume review and interactive rework tool. Upload your resume, get instant feedback, then rework it line-by-line with an AI coach — built specifically for MBB, Big 4, and boutique consulting applications.

**Powered by Claude (Anthropic)**

## Features

### Free Tier — Resume Scorecard
- Upload a PDF resume
- Get an overall score (0-100) graded against consulting standards
- Section-by-section breakdown (Education, Experience, Leadership, Skills)
- Top 3 strengths and top 3 areas for improvement
- Format and structure feedback
- 3 scorecards per account

### Paid Tier — Interactive Line-by-Line Rework ($19.99)
- Claude walks through every bullet point on your resume
- Asks you to explain what you actually did in plain language
- Rewrites each bullet in consulting format (Action → Context → Impact)
- Accept, edit, or request revision for each bullet
- Pause and resume sessions across days
- Download polished resume as PDF in a clean consulting template
- Also available as a 3-pack ($39.99)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| AI | Claude API — Sonnet for scorecards, Opus for rework |
| Auth | NextAuth.js (Google OAuth) |
| Database | PostgreSQL + Prisma ORM |
| Payments | Stripe (one-time checkout) |
| PDF | jsPDF (client-side generation) |

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- API keys: Anthropic, Google OAuth, Stripe

### Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/ascendro-ai/ai-resume-review.git
   cd ai-resume-review
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Fill in all values in `.env.local` (see comments in the file for where to get each key).

3. **Set up database**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Create Stripe products**
   In the [Stripe Dashboard](https://dashboard.stripe.com/products), create:
   - "Single Rework" — $19.99, one-time payment. Copy the Price ID.
   - "3-Pack Rework" — $39.99, one-time payment. Copy the Price ID.

   Add both Price IDs to your `.env.local`.

5. **Run dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth route handler
│   │   ├── dashboard/     # User dashboard data
│   │   ├── rework/        # Rework session + bullet APIs
│   │   ├── scorecard/     # Scorecard generation
│   │   ├── stripe/        # Checkout + webhook
│   │   └── upload/        # PDF upload + text extraction
│   ├── dashboard/         # User dashboard page
│   ├── login/             # Google sign-in
│   ├── pricing/           # Pricing page with Stripe checkout
│   ├── rework/            # Interactive rework + result pages
│   └── scorecard/         # Free scorecard page
├── components/
│   ├── FileUpload.tsx     # Drag-and-drop PDF upload
│   ├── Navbar.tsx         # Navigation bar
│   ├── ReworkChat.tsx     # Line-by-line rework chat interface
│   └── ScorecardDisplay.tsx # Scorecard visualization
├── lib/
│   ├── auth.ts            # NextAuth config
│   ├── claude.ts          # Claude API integration
│   ├── generate-pdf.ts    # PDF generation (consulting template)
│   ├── pdf.ts             # PDF parsing + bullet extraction
│   ├── prisma.ts          # Prisma client
│   └── stripe.ts          # Stripe config
└── types/                 # Shared TypeScript types
```

## Deployment

Deploy to [Vercel](https://vercel.com):

1. Connect your GitHub repo
2. Add all environment variables from `.env.example`
3. Set up Stripe webhook pointing to `https://yourdomain.com/api/stripe/webhook`
4. Deploy

## License

Private — all rights reserved.
