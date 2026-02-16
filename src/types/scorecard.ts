export interface SectionScore {
  score: number;
  feedback: string;
}

export interface ScorecardStrength {
  title: string;
  detail: string;
}

export interface FormatFeedback {
  length: string;
  layout: string;
  readability: string;
  overallFormat: string;
}

export interface ScorecardData {
  id: string;
  resumeId: string;
  overallScore: number;
  sectionScores: Record<string, SectionScore>;
  strengths: ScorecardStrength[];
  improvements: ScorecardStrength[];
  formatFeedback: FormatFeedback;
  createdAt: string;
}
