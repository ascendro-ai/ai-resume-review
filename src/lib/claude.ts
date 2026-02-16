import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODELS = {
  scorecard: "claude-sonnet-4-5-20250929",
  rework: "claude-opus-4-6",
} as const;

export async function generateScorecard(resumeText: string) {
  const response = await anthropic.messages.create({
    model: MODELS.scorecard,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are an expert management consulting resume reviewer. You have reviewed thousands of resumes for McKinsey, BCG, Bain, Deloitte, and other top consulting firms.

Analyze the following resume and provide a detailed scorecard. Return your response as valid JSON with this exact structure:

{
  "overallScore": <number 0-100>,
  "sectionScores": {
    "education": { "score": <number 0-100>, "feedback": "<string>" },
    "experience": { "score": <number 0-100>, "feedback": "<string>" },
    "leadership": { "score": <number 0-100>, "feedback": "<string>" },
    "skills": { "score": <number 0-100>, "feedback": "<string>" }
  },
  "strengths": [
    { "title": "<string>", "detail": "<string>" },
    { "title": "<string>", "detail": "<string>" },
    { "title": "<string>", "detail": "<string>" }
  ],
  "improvements": [
    { "title": "<string>", "detail": "<string>" },
    { "title": "<string>", "detail": "<string>" },
    { "title": "<string>", "detail": "<string>" }
  ],
  "formatFeedback": {
    "length": "<string>",
    "layout": "<string>",
    "readability": "<string>",
    "overallFormat": "<string>"
  }
}

Evaluate against these consulting resume standards:
- Action-driven bullets starting with strong verbs (Led, Analyzed, Developed)
- Quantified impact with numbers, percentages, dollar amounts
- Context → Action → Result structure
- Conciseness (1-2 lines per bullet)
- No fluff words (helped, assisted, responsible for, various)
- One page for undergrad/early career
- Consistent formatting
- Relevant sections: Education, Experience, Leadership, Skills & Interests

RESUME:
${resumeText}

Respond ONLY with the JSON object, no other text.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return JSON.parse(content.text);
}

export async function getReworkQuestion(
  originalBullet: string,
  sectionTitle: string
) {
  const response = await anthropic.messages.create({
    model: MODELS.rework,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an expert management consulting resume coach. You're helping a candidate rewrite their resume line by line for consulting applications (McKinsey, BCG, Bain, Deloitte, etc.).

The candidate has this bullet point under their "${sectionTitle}" section:

"${originalBullet}"

Ask the candidate to explain what they actually did in their own words. Be specific in your questions — ask about:
- What exactly the project/task was
- What they personally did (not the team)
- What the measurable outcome or impact was
- Any numbers they can provide (team size, revenue impact, time saved, etc.)

Be conversational, warm, and encouraging. Keep your question to 2-3 sentences max. Don't rewrite the bullet yet — just ask the question.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return content.text;
}

export async function rewriteBullet(
  originalBullet: string,
  userExplanation: string,
  sectionTitle: string
) {
  const response = await anthropic.messages.create({
    model: MODELS.rework,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an expert management consulting resume writer. Rewrite the following resume bullet point for a top-tier consulting application.

Section: ${sectionTitle}
Original bullet: "${originalBullet}"
Candidate's explanation of what they actually did: "${userExplanation}"

Rewrite this into a polished consulting-style bullet point that:
1. Starts with a strong action verb
2. Follows the Action → Context → Impact structure
3. Includes specific numbers and metrics from their explanation
4. Is concise (1-2 lines maximum)
5. Avoids fluff words like "helped," "assisted," "responsible for"

Return your response as JSON:
{
  "revisedBullet": "<the rewritten bullet point>",
  "explanation": "<brief 1-sentence explanation of why you structured it this way>"
}

Respond ONLY with the JSON object.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return JSON.parse(content.text);
}
