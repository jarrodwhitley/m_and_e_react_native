import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import content from '../data/content.json';
import { DevotionalEntry, Period, ThemePreference } from '../types/devotional';

const STORAGE_KEY = 'm_and_e_bookmarks';

function entryKey(date: string, time: string) {
  return `${date}:${time}`;
}

const contentMap = new Map<string, DevotionalEntry>();
for (const item of content as DevotionalEntry[]) {
  contentMap.set(entryKey(item.date, item.time), item);
}

const uniqueDateList = [...new Set((content as DevotionalEntry[]).map((item) => item.date))];

function formatPreview(text: string, maxLength = 170) {
  if (!text) {
    return '';
  }

  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
}

function normalizeBodyText(body: DevotionalEntry['body']) {
  if (Array.isArray(body)) {
    return body
      .map((item) => (item && typeof item === 'object' ? String(item.content || '') : String(item || '')))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return String(body || '').replace(/\s+/g, ' ').trim();
}

function rankSearchResult(entry: DevotionalEntry, needle: string) {
  const verse = (entry.keyVerseNoRef || entry.keyverse || '').toLowerCase();
  const body = normalizeBodyText(entry.body).toLowerCase();
  const topics = Array.isArray(entry.topics) ? entry.topics.map((topic) => String(topic || '').toLowerCase()).join(' ') : '';

  const verseIndex = verse.indexOf(needle);
  const bodyIndex = body.indexOf(needle);
  const topicIndex = topics.indexOf(needle);

  if (verseIndex === -1 && bodyIndex === -1 && topicIndex === -1) {
    return Number.POSITIVE_INFINITY;
  }

  if (verseIndex !== -1) {
    return verseIndex;
  }

  if (topicIndex !== -1) {
    return 500 + topicIndex;
  }

  return 1000 + bodyIndex;
}

export type BookmarkedDevotional = {
  key: string;
  date: string;
  time: string;
  keyverse: string;
  verseRef: string;
  preview: string;
};

// Pulled out so callers (e.g. useMemo) can compute this without creating a new
// array/object reference on every store snapshot, which would upset useSyncExternalStore.
export function computeBookmarkedDevotionals(bookmarks: string[]): BookmarkedDevotional[] {
  return bookmarks
    .map((bookmarkKey) => {
      const [date, time] = bookmarkKey.split(':');
      const entry = contentMap.get(bookmarkKey);
      if (!entry) {
        return null;
      }

      return {
        key: bookmarkKey,
        date,
        time,
        keyverse: entry.keyVerseNoRef || entry.keyverse || '',
        verseRef: entry.verseRef || '',
        preview: formatPreview(normalizeBodyText(entry.body)),
      };
    })
    .filter((item): item is BookmarkedDevotional => item !== null);
}

type AppState = {
  fontSize: number;
  theme: ThemePreference;
  currentDate: string;
  currentPeriod: Period;
  selectedDate: string | null;
  selectedPeriod: Period | null;
  bookmarks: string[];
  searchQuery: string;
  searchResults: DevotionalEntry[];

  // getters (Pinia -> plain functions reading current state)
  effectiveDate: () => string;
  effectivePeriod: () => Period;
  activeDevotional: () => DevotionalEntry | null;
  availableDates: () => string[];
  bookmarkedDevotionals: () => BookmarkedDevotional[];
  isBookmarked: (date: string, time: string) => boolean;

  // actions
  setFontSize: (fontSize: number) => void;
  resetSettings: () => void;
  setTheme: (theme: ThemePreference) => void;
  initializeDateContext: () => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedPeriod: (period: Period | null) => void;
  goToToday: () => void;
  togglePeriod: () => void;
  openDevotional: (date: string, time: Period) => void;
  loadBookmarksFromStorage: () => Promise<void>;
  toggleBookmark: (date: string, time: string) => void;
  clearBookmarks: () => void;
  runSearch: (query: string) => void;
};

function persistBookmarks(bookmarks: string[]) {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks)).catch((error) => {
    console.warn('Unable to persist bookmarks', error);
  });
}

export const useAppStore = create<AppState>((set, get) => ({
  fontSize: 17,
  theme: 'auto',
  currentDate: '',
  currentPeriod: 'am',
  selectedDate: null,
  selectedPeriod: null,
  bookmarks: [],
  searchQuery: '',
  searchResults: [],

  effectiveDate: () => get().selectedDate || get().currentDate,
  effectivePeriod: () => get().selectedPeriod || get().currentPeriod,
  activeDevotional: () => {
    const date = get().selectedDate || get().currentDate;
    const period = get().selectedPeriod || get().currentPeriod;
    return contentMap.get(entryKey(date, period)) || null;
  },
  availableDates: () => uniqueDateList,
  bookmarkedDevotionals: () => computeBookmarkedDevotionals(get().bookmarks),
  isBookmarked: (date, time) => get().bookmarks.includes(entryKey(date, time)),

  setFontSize: (fontSize) => set({ fontSize }),
  resetSettings: () => set({ fontSize: 17 }),
  setTheme: (theme) => set({ theme }),
  initializeDateContext: () => {
    const now = new Date();
    const currentDate = `${now.getMonth() + 1}-${now.getDate()}`;
    const currentPeriod: Period = now.getHours() >= 12 ? 'pm' : 'am';

    set((state) => {
      const next: Partial<AppState> = { currentDate, currentPeriod };

      if (!state.selectedDate && !state.selectedPeriod) {
        return next;
      }

      if (!state.selectedDate) {
        next.selectedPeriod = null;
      }

      return next;
    });
  },
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedPeriod: (period) => set({ selectedPeriod: period }),
  goToToday: () => {
    set({ selectedDate: null, selectedPeriod: null });
    get().initializeDateContext();
  },
  togglePeriod: () => {
    const activePeriod = get().effectivePeriod();
    set((state) => ({
      selectedDate: state.selectedDate || state.currentDate,
      selectedPeriod: activePeriod === 'am' ? 'pm' : 'am',
    }));
  },
  openDevotional: (date, time) => set({ selectedDate: date, selectedPeriod: time }),
  loadBookmarksFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        set({ bookmarks: parsed.filter((item) => typeof item === 'string') });
      }
    } catch (error) {
      console.warn('Unable to load bookmarks from storage', error);
    }
  },
  toggleBookmark: (date, time) => {
    const key = entryKey(date, time);
    set((state) => {
      const existingIndex = state.bookmarks.indexOf(key);
      const bookmarks =
        existingIndex >= 0
          ? state.bookmarks.filter((_, index) => index !== existingIndex)
          : [key, ...state.bookmarks];

      persistBookmarks(bookmarks);
      return { bookmarks };
    });
  },
  clearBookmarks: () => {
    persistBookmarks([]);
    set({ bookmarks: [] });
  },
  runSearch: (query) => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      set({ searchQuery: query, searchResults: [] });
      return;
    }

    const results = (content as DevotionalEntry[])
      .map((entry) => ({ entry, rank: rankSearchResult(entry, needle) }))
      .filter(({ rank }) => Number.isFinite(rank))
      .sort((a, b) => a.rank - b.rank)
      .map(({ entry }) => entry);

    set({ searchQuery: query, searchResults: results });
  },
}));
