<script setup>
import { computed, nextTick, onBeforeMount, onMounted, onUnmounted, ref, watch } from 'vue'
import Header from './components/Header.vue'
import Body from './components/Body.vue'
import MobileMenu from './components/MobileMenu.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'
import FooterControlBar from './components/FooterControlBar.vue'
import SearchPanel from './components/SearchPanel.vue'
import DatePickerPanel from './components/DatePickerPanel.vue'
import BookmarksPanel from './components/BookmarksPanel.vue'
import { useAppStore } from './store'
import { eveningTheme, morningTheme, themeToCssVariables } from './theme'
import spurgeonIcon from './assets/spurgeon_icon.png'

const isLoading = ref(true)
const footerBar = ref(null)
const footerHeight = ref(0)
let footerResizeObserver = null
const showMenu = ref(false)
const showAbout = ref(false)
const showSearch = ref(false)
const showDatePicker = ref(false)
const showBookmarks = ref(false)
const showClearBookmarksConfirm = ref(false)
const showBookmarkToast = ref(false)
const bookmarkToastMessage = ref('')
const isIos = ref(navigator.userAgent.match(/(iPod|iPhone|iPad)/))

const store = useAppStore()
let dateTimer = null
let bookmarkToastTimer = null

const selectedContent = computed(() => store.activeDevotional || {})
const effectiveDate = computed(() => store.effectiveDate)
const effectiveTime = computed(() => store.effectivePeriod)

const isCurrentBookmarked = computed(() => {
    if (!effectiveDate.value || !effectiveTime.value) {
        return false
    }

    return store.isBookmarked(effectiveDate.value, effectiveTime.value)
})

const activePanel = computed(() => {
    if (showSearch.value) {
        return 'search'
    }
    if (showDatePicker.value) {
        return 'date'
    }
    if (showMenu.value) {
        return 'settings'
    }
    if (showBookmarks.value) {
        return 'bookmarks'
    }
    return null
})

const theme = computed(() => {
    if (store.theme === 'auto') {
        return effectiveTime.value === 'am' ? 'morning' : 'evening'
    }

    return store.theme === 'light' ? 'morning' : 'evening'
})

const activeTheme = computed(() => (theme.value === 'morning' ? morningTheme : eveningTheme))
const themeCssVariables = computed(() => themeToCssVariables(activeTheme.value))

watch(activePanel, (nextPanel, previousPanel) => {
    if (nextPanel || !previousPanel) {
        return
    }

    // iOS Safari can leave the page scrolled/blank after the keyboard (from the
    // search input) dismisses, so force focus away and reset scroll on close.
    document.activeElement?.blur?.()
    window.scrollTo(0, 0)
})

onBeforeMount(() => {
    store.initializeDateContext()
    store.loadBookmarksFromStorage()
    setStatusBarTheme()
})

onMounted(() => {
    setTimeout(() => {
        isLoading.value = false
    }, 2000)

    dateTimer = setInterval(() => {
        store.initializeDateContext()
    }, 60000)
})

watch(isLoading, async (loading) => {
    if (loading) {
        return
    }

    await nextTick()

    if (footerBar.value?.$el) {
        footerResizeObserver = new ResizeObserver((entries) => {
            // contentRect excludes padding, so it misses the safe-area-inset-bottom
            // padding on the control bar; use the element's full border-box height instead.
            footerHeight.value = entries[0].target.offsetHeight
        })
        footerResizeObserver.observe(footerBar.value.$el)
    }
})

onUnmounted(() => {
    if (dateTimer) {
        clearInterval(dateTimer)
    }

    if (bookmarkToastTimer) {
        clearTimeout(bookmarkToastTimer)
    }

    if (footerResizeObserver) {
        footerResizeObserver.disconnect()
    }
})

watch(theme, () => {
    setStatusBarTheme()
})

function closeNavigationPanels() {
    showSearch.value = false
    showDatePicker.value = false
    showBookmarks.value = false
}

function toggleMenu() {
    showMenu.value = !showMenu.value
    showAbout.value = false

    if (showMenu.value) {
        closeNavigationPanels()
    }
}

function toggleAbout() {
    showAbout.value = !showAbout.value
}

function openSearchPanel() {
    if (showSearch.value) {
        showSearch.value = false
        return
    }

    showMenu.value = false
    showDatePicker.value = false
    showBookmarks.value = false
    showSearch.value = true
}

function openDatePanel() {
    if (showDatePicker.value) {
        showDatePicker.value = false
        return
    }

    showMenu.value = false
    showSearch.value = false
    showBookmarks.value = false
    showDatePicker.value = true
}

function openBookmarksPanel() {
    if (showBookmarks.value) {
        showBookmarks.value = false
        return
    }

    showMenu.value = false
    showSearch.value = false
    showDatePicker.value = false
    showBookmarks.value = true
}

function openSettingsPanel() {
    if (showMenu.value) {
        showMenu.value = false
        return
    }

    closeNavigationPanels()
    showAbout.value = false
    showMenu.value = true
}

function openSearchResult(item) {
    store.openDevotional(item.date, item.time)
    showSearch.value = false
}

function applyDateSelection(payload) {
    store.openDevotional(payload.date, payload.period)

    if (!payload.keepOpen) {
        showDatePicker.value = false
    }
}

function goToToday() {
    store.goToToday()
    showDatePicker.value = false
}

function togglePeriodQuick() {
    store.togglePeriod()
}

function toggleBookmark() {
    if (!effectiveDate.value || !effectiveTime.value) {
        return
    }

    const wasBookmarked = store.isBookmarked(effectiveDate.value, effectiveTime.value)
    store.toggleBookmark(effectiveDate.value, effectiveTime.value)

    if (!wasBookmarked) {
        showSavedToast('Saved to favorites')
    }
}

function showSavedToast(message) {
    bookmarkToastMessage.value = message
    showBookmarkToast.value = true

    if (bookmarkToastTimer) {
        clearTimeout(bookmarkToastTimer)
    }

    bookmarkToastTimer = setTimeout(() => {
        showBookmarkToast.value = false
    }, 1700)
}

function openBookmarkItem(item) {
    store.openDevotional(item.date, item.time)
    showBookmarks.value = false
}

function clearBookmarks() {
    if (!store.bookmarks.length) {
        return
    }

    showClearBookmarksConfirm.value = true
}

function cancelClearBookmarks() {
    showClearBookmarksConfirm.value = false
}

function confirmClearBookmarks() {
    store.clearBookmarks()
    showClearBookmarksConfirm.value = false
}

function setAppTheme(nextTheme) {
    store.setTheme(nextTheme)
    setStatusBarTheme()
}

function setStatusBarTheme() {
    const pageColor = activeTheme.value.background
    const statusBarColor = theme.value === 'morning'
        ? (activeTheme.value.accentPrimary || pageColor)
        : pageColor

    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
        metaTheme.setAttribute('content', statusBarColor)
    }

    // Keep root backgrounds in sync so iOS status area never falls back to white.
    document.documentElement.style.backgroundColor = pageColor
    document.body.style.backgroundColor = pageColor

    const appRoot = document.getElementById('app')
    if (appRoot) {
        appRoot.style.backgroundColor = pageColor
    }
}
</script>

<template>
    <LoadingOverlay :loading="isLoading" :time="effectiveTime"/>
    <div v-if="!isLoading" class="app-scene" :class="theme" :style="themeCssVariables">
        <div class="scene-shape shape-a"></div>
        <div class="scene-shape shape-b"></div>
        <div class="scene-shape shape-c"></div>
        <div class="reader-shell" :style="{'--footer-height': footerHeight + 'px'}">
            <Header
                id="header"
                v-if="effectiveDate"
                :date="effectiveDate"
                :time="effectiveTime"
                :is-bookmarked="isCurrentBookmarked"
                @toggle-bookmark="toggleBookmark"
                @toggle-about="toggleAbout"
            />
            <Body
                v-if="selectedContent.body"
                :content="selectedContent"
            />
            <FooterControlBar
                ref="footerBar"
                :current-period="effectiveTime"
                :active-panel="activePanel"
                @open-search="openSearchPanel"
                @open-date="openDatePanel"
                @toggle-period="togglePeriodQuick"
                @open-settings="openSettingsPanel"
                @open-bookmarks="openBookmarksPanel"
            />
            <MobileMenu
                id="mobileMenu"
                :show-menu="showMenu"
                :content="selectedContent"
                :time="effectiveTime"
                :isIos="isIos"
                @close-menu="toggleMenu"
                @reset-settings="store.resetSettings"
                @theme-auto="setAppTheme('auto')"
                @theme-light="setAppTheme('light')"
                @theme-dark="setAppTheme('dark')"
            />
            <SearchPanel
                :show="showSearch"
                :query="store.searchQuery"
                :results="store.searchResults"
                @close="showSearch = false"
                @update-query="store.searchDevotionals"
                @open-result="openSearchResult"
            />
            <DatePickerPanel
                :show="showDatePicker"
                :available-dates="store.availableDates"
                :current-date="effectiveDate"
                :current-period="effectiveTime"
                @close="showDatePicker = false"
                @select-date="applyDateSelection"
                @go-today="goToToday"
            />
            <BookmarksPanel
                :show="showBookmarks"
                :bookmarks="store.bookmarkedDevotionals"
                @close="showBookmarks = false"
                @open-bookmark="openBookmarkItem"
                @clear-bookmarks="clearBookmarks"
            />
        </div>
        <div class="bookmark-toast" :class="showBookmarkToast ? 'is-visible' : ''" role="status" aria-live="polite">
            {{ bookmarkToastMessage }}
        </div>
        <div v-if="showClearBookmarksConfirm" class="confirm-overlay" @click="cancelClearBookmarks">
            <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="clear-bookmarks-title" @click.stop>
                <h2 id="clear-bookmarks-title">Clear all saved devotionals?</h2>
                <div class="confirm-actions">
                    <button class="confirm-btn cancel" @click="cancelClearBookmarks">Cancel</button>
                    <button class="confirm-btn confirm" @click="confirmClearBookmarks">Clear All</button>
                </div>
            </div>
        </div>
        <div class="modal transition-all" :class="showAbout ? '-translate-x-0' : '-translate-x-full'">
            <button class="modal-close" @click="toggleAbout" aria-label="Close about dialog">×</button>
            <img class="w-20 mx-auto" :src="spurgeonIcon" alt="spurgeon icon black"/>
            <h1 class="text-3xl text-center">Morning & Evening</h1>
            <h3 class="text-center">By Charles Haddon Spurgeon</h3>
            <p class="mt-8">Charles Haddon Spurgeon (1834-1892) was a British Baptist minister and renowned author who is considered one of the most influential figures in Christian history. Known as the "Prince of Preachers," Spurgeon delivered powerful sermons that attracted thousands of people every week, filling London's Metropolitan Tabernacle to capacity. He was also a prolific writer, penning countless devotionals, commentaries, and sermons that continue to inspire and encourage readers today.</p>
            <p>"Morning and Evening" is a collection of daily devotionals that Spurgeon wrote to provide readers with a daily reminder of God's presence and grace. The devotionals are organized into morning and evening entries for each day of the year, offering timeless insights and encouragement that are still relevant to readers today.</p>
            <p>With its eloquent language and profound spiritual truths, "Morning and Evening" is a beloved classic in Christian literature that continues to inspire and uplift readers around the world.</p>
            <p class="public-domain-information mt-4">
                <em>This work is in the public domain in the United States because it was published before January 1, 1923.</em>
            </p>
        </div>
    </div>
</template>

<style lang="scss">
html {
    height: 100vh;
    overflow: hidden;
}

body,
#app {
    height: 100%;
    min-height: 100%;
}

body {
    margin: 0;
    overflow: hidden;
    position: fixed;
    inset: 0;
    width: 100%;
    touch-action: manipulation;
    font-family: "Avenir Next", "Segoe UI", sans-serif;
}

#app {
    display: flex;
    overflow: hidden;
}

.app-scene {
    --safe-top: env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
    --control-bar-height: 64px;
    height: 100vh;
    height: 100dvh;
    height: -webkit-fill-available;
    height: var(--app-height, 100dvh);
    width: 100%;
    display: flex;
    justify-content: center;
    overflow: hidden;
    background: radial-gradient(circle at 20% 20%, var(--header-gradient-start) 0%, var(--background) 60%);
    padding: 0;
    color: var(--text-primary);
}

.scene-shape {
    position: absolute;
    border-radius: 999px;
    opacity: 0.35;
    filter: blur(0px);
    pointer-events: none;
}

.shape-a {
    width: 18rem;
    height: 18rem;
    background: color-mix(in srgb, var(--accent-secondary) 35%, transparent);
    left: -4rem;
    top: -4rem;
}

.shape-b {
    width: 22rem;
    height: 22rem;
    background: color-mix(in srgb, var(--accent-primary) 24%, transparent);
    right: -7rem;
    bottom: -8rem;
}

.shape-c {
    width: 14rem;
    height: 14rem;
    background: color-mix(in srgb, var(--highlight) 35%, transparent);
    right: 8%;
    top: 10%;
}

.reader-shell {
    width: 100%;
    max-width: 28rem;
    height: 100vh;
    height: 100dvh;
    height: -webkit-fill-available;
    height: var(--app-height, 100dvh);
    position: relative;
    z-index: 2;
    border-radius: 0;
    border: 0;
    background: var(--surface-secondary);
    box-shadow: 0 18px 42px rgba(16, 24, 36, 0.18), inset 0 0 0 1px var(--border);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 30;
    overflow: auto;
    padding: 2rem;
    background: var(--surface);
    color: var(--text-primary);
    box-shadow: 0 20px 45px rgba(22, 25, 32, 0.22);
}

.modal-close {
    position: absolute;
    top: 0.9rem;
    right: 0.9rem;
    width: 2.2rem;
    height: 2.2rem;
    border: 0;
    border-radius: 999px;
    background: var(--button-secondary-background);
    color: var(--button-secondary-text);
    font-size: 1.45rem;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.bookmark-toast {
    position: absolute;
    left: 50%;
    top: calc(var(--safe-top, 0px) + 0.75rem);
    transform: translate(-50%, -10px);
    opacity: 0;
    pointer-events: none;
    z-index: 35;
    background: color-mix(in srgb, var(--surface) 92%, var(--surface-secondary));
    color: var(--text-primary);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 0.46rem 0.8rem;
    font-size: 0.82rem;
    letter-spacing: 0.015em;
    box-shadow: 0 9px 20px rgba(16, 24, 36, 0.22);
    transition: opacity 170ms ease, transform 170ms ease;
}

.bookmark-toast.is-visible {
    opacity: 1;
    transform: translate(-50%, 0);
}

.confirm-overlay {
    position: absolute;
    inset: 0;
    z-index: 36;
    background: var(--overlay-background);
    display: grid;
    place-items: center;
    padding: 1rem;
}

.confirm-dialog {
    width: min(100%, 21rem);
    background: var(--surface);
    color: var(--text-primary);
    border: 1px solid var(--border);
    border-radius: 1rem;
    box-shadow: 0 16px 34px rgba(16, 24, 36, 0.3);
    padding: 1rem;
}

.confirm-dialog h2 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
    line-height: 1.3;
}

.confirm-actions {
    margin-top: 0.9rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.55rem;
}

.confirm-btn {
    border: 0;
    border-radius: 0.7rem;
    min-height: 2.25rem;
    padding: 0.4rem 0.75rem;
    font-weight: 600;
}

.confirm-btn.cancel {
    background: var(--support-row-background, var(--button-secondary-background));
    color: var(--support-row-text, var(--button-secondary-text));
    box-shadow: inset 0 0 0 1px var(--support-row-border, var(--border));
}

.confirm-btn.confirm {
    background: var(--button-primary);
    color: var(--button-primary-text);
}

@media (max-width: 767px) {
    .shape-c {
        display: none;
    }
}

@media (min-width: 960px) {
    .reader-shell {
        height: calc(var(--app-height, 100dvh) - 2rem);
        max-height: calc(var(--app-height, 100dvh) - 2rem);
    }
}
</style>
