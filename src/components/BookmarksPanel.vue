<script setup>
import { useSwipeToClose } from '../composables/useSwipeToClose'

defineProps({
    show: Boolean,
    bookmarks: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['close', 'open-bookmark', 'clear-bookmarks'])

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

function formatBookmarkDate(mdDate) {
    const [rawMonth, rawDay] = String(mdDate || '').split('-')
    const month = Number(rawMonth)
    const day = Number(rawDay)

    if (!month || !day || month < 1 || month > 12) {
        return mdDate
    }

    return `${monthNames[month - 1]} ${day}`
}

function formatBookmarkPeriod(time) {
    return String(time).toLowerCase() === 'pm' ? 'Evening' : 'Morning'
}

function quoteVerse(text) {
    const normalized = String(text || '').trim().replace(/^"+|"+$/g, '')
    return normalized ? `"${normalized}"` : ''
}

const {panelDragStyle, onHandleTouchStart, onHandleTouchMove, onHandleTouchEnd} = useSwipeToClose(() => emit('close'))
</script>

<template>
    <section class="bookmarks-shell" :class="show ? 'is-open' : 'is-closed'">
        <button class="sheet-backdrop" aria-label="Close bookmarks" @click="emit('close')"></button>
        <div class="bookmarks-panel" :class="show ? 'panel-visible' : ''" :style="panelDragStyle">
            <button class="sheet-handle" aria-label="Close bookmarks"
                    @click="emit('close')"
                    @touchstart="onHandleTouchStart"
                    @touchmove="onHandleTouchMove"
                    @touchend="onHandleTouchEnd"></button>
            <div class="panel-head">
                <h2>Saved Devotionals</h2>
            </div>

            <p v-if="!bookmarks.length" class="hint">No bookmarks yet. Tap the bookmark icon in the top right in any devotional to save it.</p>

            <div v-else class="bookmark-list">
                <button
                    v-for="item in bookmarks"
                    :key="item.key"
                    class="bookmark-item"
                    @click="emit('open-bookmark', item)"
                >
                    <span class="bookmark-date">{{ formatBookmarkDate(item.date) }} — {{ formatBookmarkPeriod(item.time) }}</span>
                    <span class="bookmark-verse">{{ quoteVerse(item.keyverse) }}</span>
                    <span class="bookmark-ref" v-if="item.verseRef">{{ item.verseRef }}</span>
                </button>
            </div>

            <button v-if="bookmarks.length" class="clear-btn" @click="emit('clear-bookmarks')">Clear All</button>
        </div>
    </section>
</template>

<style scoped>
.bookmarks-shell {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: var(--footer-height, 0px);
    z-index: 15;
    pointer-events: none;
    display: flex;
    align-items: flex-end;
    opacity: 0;
    visibility: hidden;
    transition: opacity 180ms ease;
}

.bookmarks-shell.is-open {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
}

.sheet-backdrop {
    position: absolute;
    inset: 0;
    border: 0;
    background: var(--overlay-background);
}

.bookmarks-panel {
    width: 100%;
    max-height: min(75vh, calc(100dvh - var(--footer-height, 0px) - 3rem));
    border-radius: 1.6rem 1.6rem 0 0;
    background: linear-gradient(to bottom, color-mix(in srgb, var(--surface) 85%, var(--surface-secondary)), var(--surface-secondary));
    box-shadow: 0 -14px 36px rgba(23, 33, 48, 0.25);
    padding: 0.7rem 0.9rem 1.1rem;
    overflow: auto;
    transform: translateY(calc(100% + 1rem));
    transition: transform 260ms ease;
}

.panel-visible {
    /* translateY (not margin-top) reliably leaves a header gap on iOS Safari */
    transform: translateY(1em);
}

.sheet-handle {
    position: relative;
    display: block;
    width: 100%;
    height: 1.6rem;
    border: 0;
    background: transparent;
    margin: 0 auto 0.2rem;
    padding: 0;
    cursor: pointer;
    touch-action: none;
}

.sheet-handle::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 3rem;
    height: 0.34rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--text-secondary) 40%, transparent);
}

.panel-head {
    display: flex;
    align-items: center;
    margin-bottom: 0.55rem;
}

.panel-head h2 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1rem;
}

.hint {
    margin: 0.4rem 0;
    color: var(--text-secondary);
    font-size: 0.85rem;
    text-indent: 0;
}

.bookmark-list {
    display: grid;
    gap: 0.45rem;
}

.bookmark-item {
    border: 1px solid var(--border);
    background: var(--surface);
    border-radius: 0.8rem;
    text-align: left;
    padding: 0.6rem 0.68rem;
    display: grid;
    gap: 0.2rem;
}

.bookmark-date {
    font-size: 0.72rem;
    color: var(--text-secondary);
}

.bookmark-verse {
    font-size: 0.84rem;
    color: var(--text-primary);
}

.bookmark-ref {
    font-size: 0.76rem;
    color: var(--text-muted, var(--text-secondary));
}

.clear-btn {
    margin-top: 0.75rem;
    width: 100%;
    border: 0;
    border-radius: 0.75rem;
    min-height: 2.45rem;
    background: var(--support-row-background);
    color: var(--support-row-text);
    font-weight: 600;
    box-shadow: inset 0 0 0 1px var(--support-row-border);
}
</style>
