
export interface User {
  id: number;
  name: string;
  username: string;
  team: 'Giants' | 'Jets' | 'Eagles';
}

export interface Activity {
  id: string;
  type: 'note' | 'email' | 'meeting';
  date: string;
  summary: string;
  content: string; // Could be email body, note content, or meeting transcript
}

export interface Account {
  id:string;
  name: string;
  ae: string;
  team: 'Giants' | 'Jets' | 'Eagles';
  tier: 1 | 2 | 3 | 4 | 5;
  segment: 'Agency' | 'ISV' | 'Franchise/Multi-location' | 'Media' | 'MSP';
  activities: Activity[];
}

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export interface FilterCriteria {
    team: string;
    ae: string;
    startDate: string;
    endDate: string;
    tier: string;
    segment: string;
}

export interface KeyMoment {
    quote: string;
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    accountName: string;
}

export interface SentimentResult {
    overallScore: number; // -1 (negative) to 1 (positive)
    summary: string;
    keyMoments: KeyMoment[];
}