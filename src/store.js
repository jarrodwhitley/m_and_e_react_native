import { defineStore } from 'pinia'
import content from './assets/content/content.json'

const STORAGE_KEY = 'm_and_e_bookmarks'

function entryKey(date, time) {
    return `${date}:${time}`
}

const contentMap = new Map()
for (const item of content) {
    contentMap.set(entryKey(item.date, item.time), item)
}

const uniqueDateList = [...new Set(content.map((item) => item.date))]

function formatPreview(text, maxLength = 170) {
    if (!text) {
        return ''
    }

    const normalized = text.replace(/\s+/g, ' ').trim()
    if (normalized.length <= maxLength) {
        return normalized
    }

    return `${normalized.slice(0, maxLength).trim()}...`
}

function normalizeBodyText(body) {
    if (Array.isArray(body)) {
        return body
            .map((item) => {
                if (item && typeof item === 'object') {
                    return String(item.content || '')
                }

                return String(item || '')
            })
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()
    }

    return String(body || '').replace(/\s+/g, ' ').trim()
}

function rankSearchResult(entry, needle) {
    const verse = (entry.keyVerseNoRef || entry.keyverse || '').toLowerCase()
    const body = normalizeBodyText(entry.body).toLowerCase()
    const topics = Array.isArray(entry.topics)
        ? entry.topics.map((topic) => String(topic || '').toLowerCase()).join(' ')
        : ''

    const verseIndex = verse.indexOf(needle)
    const bodyIndex = body.indexOf(needle)
    const topicIndex = topics.indexOf(needle)

    if (verseIndex === -1 && bodyIndex === -1 && topicIndex === -1) {
        return Number.POSITIVE_INFINITY
    }

    if (verseIndex !== -1) {
        return verseIndex
    }

    if (topicIndex !== -1) {
        return 500 + topicIndex
    }

    return 1000 + bodyIndex
}

export const useAppStore = defineStore({
    id: 'app',
    state: () => {
        return {
            fontSize: 17,
            theme: 'auto',
            currentDate: '',
            currentPeriod: 'am',
            selectedDate: null,
            selectedPeriod: null,
            bookmarks: [],
            searchQuery: '',
            searchResults: []
        }
    },
    getters: {
        effectiveDate(state) {
            return state.selectedDate || state.currentDate
        },
        effectivePeriod(state) {
            return state.selectedPeriod || state.currentPeriod
        },
        activeDevotional(state) {
            const date = state.selectedDate || state.currentDate
            const period = state.selectedPeriod || state.currentPeriod
            return contentMap.get(entryKey(date, period)) || null
        },
        availableDates() {
            return uniqueDateList
        },
        bookmarkedDevotionals(state) {
            return state.bookmarks
                .map((bookmarkKey) => {
                    const [date, time] = bookmarkKey.split(':')
                    const entry = contentMap.get(bookmarkKey)
                    if (!entry) {
                        return null
                    }

                    return {
                        key: bookmarkKey,
                        date,
                        time,
                        keyverse: entry.keyVerseNoRef || entry.keyverse || '',
                        verseRef: entry.verseRef || '',
                        preview: formatPreview(normalizeBodyText(entry.body))
                    }
                })
                .filter(Boolean)
        }
    },
    actions: {
        setFontSize(fontSize) {
            this.fontSize = fontSize
        },
        resetSettings() {
            this.fontSize = 17
        },
        setTheme(theme) {
            this.theme = theme
        },
        initializeDateContext() {
            const now = new Date()
            this.currentDate = `${now.getMonth() + 1}-${now.getDate()}`
            this.currentPeriod = now.getHours() >= 12 ? 'pm' : 'am'

            if (!this.selectedDate && !this.selectedPeriod) {
                return
            }

            if (!this.selectedDate) {
                this.selectedPeriod = null
            }
        },
        setSelectedDate(date) {
            this.selectedDate = date
        },
        setSelectedPeriod(period) {
            this.selectedPeriod = period
        },
        goToToday() {
            this.selectedDate = null
            this.selectedPeriod = null
            this.initializeDateContext()
        },
        togglePeriod() {
            const activePeriod = this.effectivePeriod

            if (!this.selectedDate) {
                this.selectedDate = this.currentDate
            }

            this.selectedPeriod = activePeriod === 'am' ? 'pm' : 'am'
        },
        openDevotional(date, time) {
            this.selectedDate = date
            this.selectedPeriod = time
        },
        isBookmarked(date, time) {
            return this.bookmarks.includes(entryKey(date, time))
        },
        loadBookmarksFromStorage() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY)
                if (!raw) {
                    return
                }

                const parsed = JSON.parse(raw)
                if (Array.isArray(parsed)) {
                    this.bookmarks = parsed.filter((item) => typeof item === 'string')
                }
            } catch (error) {
                console.warn('Unable to load bookmarks from storage', error)
            }
        },
        persistBookmarks() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.bookmarks))
        },
        toggleBookmark(date, time) {
            const key = entryKey(date, time)
            const existingIndex = this.bookmarks.indexOf(key)

            if (existingIndex >= 0) {
                this.bookmarks.splice(existingIndex, 1)
            } else {
                this.bookmarks.unshift(key)
            }

            this.persistBookmarks()
        },
        clearBookmarks() {
            this.bookmarks = []
            this.persistBookmarks()
        },
        searchDevotionals(query) {
            const normalized = (query || '').trim().toLowerCase()
            this.searchQuery = query

            if (!normalized) {
                this.searchResults = []
                return
            }

            const results = content
                .map((entry) => {
                    const score = rankSearchResult(entry, normalized)
                    return { entry, score }
                })
                .filter((item) => Number.isFinite(item.score))
                .sort((a, b) => a.score - b.score)
                .slice(0, 40)
                .map(({ entry }) => ({
                    key: entryKey(entry.date, entry.time),
                    date: entry.date,
                    time: entry.time,
                    keyverse: entry.keyVerseNoRef || entry.keyverse || '',
                    verseRef: entry.verseRef || '',
                    tags: Array.isArray(entry.topics) ? entry.topics : [],
                    preview: formatPreview(normalizeBodyText(entry.body))
                }))

            this.searchResults = results
        }
    }
})
