export type DevotionalBodyItem = {
  type: string;
  content: string;
};

export type DevotionalEntry = {
  date: string; // "M-D"
  time: 'am' | 'pm';
  month: number;
  day: number;
  keyverse: string;
  body: DevotionalBodyItem[];
  keyVerseNoRef: string;
  verseRef: string;
  topics: string[];
};

export type Period = 'am' | 'pm';

export type ThemePreference = 'auto' | 'light' | 'dark';
