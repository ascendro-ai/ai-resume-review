# Product Requirements Document: AI Resume Review

## 1. Product Overview

**AI Resume Review** is a web application that helps candidates — starting with consulting applicants — improve their resumes using Claude as the AI backbone. It offers two tiers:

- **Free Tier (Resume Scorecard):** Upload a resume, get a top-level overview of strengths, weaknesses, and actionable feedback tailored to consulting recruiting.
- **Paid Tier (Full Resume Rework):** An interactive, line-by-line guided rewrite where Claude walks the user through each bullet, asks them to explain what they actually did in plain language, and transforms their answers into polished, consulting-ready resume bullets.

---

## 2. Target User

- University students and early-career professionals applying to **management consulting** roles (MBB, Big 4, boutique firms).
- Users who know their experience is strong but struggle to articulate it in the concise, impact-driven format consulting firms expect.

---

## 3. Core User Flows

### 3.1 Free Tier — Resume Scorecard

```
Upload Resume (PDF) → Claude analyzes → Scorecard displayed
```

1. User uploads their resume (PDF).
2. System extracts text from the PDF.
3. Claude evaluates the resume against consulting resume best practices and returns:
   - **Overall Score** (e.g., 72/100)
   - **Section-by-section breakdown** (Education, Experience, Leadership, Skills/Interests)
   - **Top 3 Strengths** — what's already working
   - **Top 3 Areas for Improvement** — specific, actionable feedback
   - **Format & Structure Check** — length, layout, readability flags
4. Results are displayed on a single scorecard page. Account required (to enforce 3-scorecard limit).

### 3.2 Paid Tier — Interactive Line-by-Line Rework

```
Upload Resume → Claude identifies all bullet points → For each bullet:
  Claude asks "What did you actually do here?" → User explains →
  Claude rewrites the bullet → User approves/edits → Next bullet
→ Final polished resume generated
```

1. User uploads their resume (PDF).
2. System extracts and parses the resume into structured sections and individual bullet points.
3. Claude presents the **first bullet point** and asks the user to explain, in their own words, what they actually did. Example prompt:
   > Your current bullet says: *"Helped the team with data analysis for a client project."*
   > Can you tell me more? What was the project? What data did you analyze? What was the outcome or impact?
4. User responds with their plain-language explanation.
5. Claude transforms the explanation into a polished consulting-style bullet using the **Action → Context → Impact** format. Example:
   > **Revised:** Analyzed 50K+ rows of customer transaction data to identify $2M revenue leakage for a Fortune 500 retail client, informing pricing strategy recommendations presented to the C-suite.
6. User can **accept**, **request a revision**, or **edit directly**.
7. Process repeats for every bullet point on the resume.
8. Once all bullets are complete, Claude generates the **final reworked resume** as a downloadable PDF.

---

## 4. Consulting Resume Standards (Baked into Prompts)

Claude's evaluation and rewriting will be grounded in these consulting-specific principles:

- **Action-driven bullets:** Start with a strong action verb (Led, Analyzed, Developed, etc.)
- **Quantify impact:** Numbers, percentages, dollar amounts wherever possible
- **Context → Action → Result structure**
- **Conciseness:** Each bullet should be 1-2 lines max
- **No fluff words:** Remove "helped," "assisted," "responsible for," "various," etc.
- **One page only** (for undergrad/early career)
- **Consistent formatting:** Dates right-aligned, company/title clearly delineated
- **Relevant sections:** Education, Experience, Leadership/Extracurriculars, Skills & Interests

---

## 5. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (React) with TypeScript |
| Styling | Tailwind CSS |
| Backend API | Next.js API Routes |
| AI | Claude API (Anthropic) — claude-sonnet-4-5-20250929 for scorecard, claude-opus-4-6 for rework |
| PDF Parsing | pdf-parse (Node.js) |
| PDF Generation | @react-pdf/renderer or Puppeteer |
| Auth | NextAuth.js (Google + email login) |
| Payments | Stripe (one-time payment per rework session) |
| Database | PostgreSQL via Prisma ORM |
| Hosting | Vercel |

---

## 6. Monetization

| Tier | Price | What You Get |
|------|-------|-------------|
| Free | $0 | Resume Scorecard (3 per account) |
| Single Rework | $19.99 | One full interactive resume rework session |
| 3-Pack | $39.99 | Three rework sessions |

---

## 7. Pages / Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page — value prop, upload CTA, pricing |
| `/scorecard` | Free tier — upload & view scorecard results |
| `/rework` | Paid tier — interactive line-by-line rework chat |
| `/rework/result` | Final reworked resume — preview & download |
| `/pricing` | Pricing page with Stripe checkout |
| `/login` | Auth page |
| `/dashboard` | User's past scorecards and rework sessions |

---

## 8. Data Model (Draft)

```
User
  - id
  - email
  - name
  - createdAt

Resume
  - id
  - userId
  - originalPdfUrl
  - extractedText
  - createdAt

Scorecard
  - id
  - resumeId
  - overallScore
  - strengths (JSON)
  - improvements (JSON)
  - sectionScores (JSON)
  - createdAt

ReworkSession
  - id
  - resumeId
  - status (in_progress | completed)
  - currentBulletIndex
  - createdAt

ReworkBullet
  - id
  - reworkSessionId
  - originalText
  - userExplanation
  - revisedText
  - status (pending | in_conversation | accepted)
  - order
```

---

## 9. MVP Scope (v1)

**In scope:**
- [ ] Landing page with clear value prop
- [ ] PDF upload and text extraction
- [ ] Free scorecard generation via Claude
- [ ] User auth (Google sign-in)
- [ ] Paid interactive rework flow (line-by-line chat)
- [ ] Stripe payment integration
- [ ] Final resume PDF download
- [ ] Basic dashboard (past sessions)

**Out of scope for v1:**
- Job-posting-specific tailoring (future feature)
- Multiple resume templates/styles
- Cover letter generation
- LinkedIn optimization
- Mobile app
- Team/enterprise features

---

## 10. Key Decisions (Resolved)

1. **Rework session persistence:** Yes — users can pause and resume rework sessions. Session state is persisted in the database (current bullet index, all accepted/pending bullets). Users pick up exactly where they left off.
2. **Resume format output:** Standard clean consulting template. We control the output format — no need to reverse-engineer the user's original PDF layout. One professional template for v1.
3. **Model selection:** Sonnet (claude-sonnet-4-5-20250929) for scorecards — fast and cost-effective. Opus (claude-opus-4-6) for interactive rework — higher quality conversational guidance.
4. **Free tier limits:** 3 scorecards per user (lifetime). Requires account creation to track usage.
5. **Refund policy:** TBD — revisit after launch.

---

## 11. Open Questions

_(None at this time — ready to build.)_
