<script setup>
import { ref, watch } from 'vue'
import { useSwipeToClose } from '../composables/useSwipeToClose'

const props = defineProps({
    show: Boolean,
    query: {
        type: String,
        default: ''
    },
    results: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['close', 'update-query', 'open-result'])

const localQuery = ref(props.query)

watch(() => props.query, (nextQuery) => {
    localQuery.value = nextQuery
})

function onQueryInput() {
    emit('update-query', localQuery.value)
}

function selectResult(item) {
    emit('open-result', item)
}

function quoteVerse(text) {
    const normalized = String(text || '').trim().replace(/^"+|"+$/g, '')
    return normalized ? `"${normalized}"` : ''
}

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

function formatDatePeriod(date, time) {
    const [rawMonth, rawDay] = String(date || '').split('-')
    const month = Number(rawMonth)
    const day = Number(rawDay)
    const monthLabel = month >= 1 && month <= 12 ? monthNames[month - 1] : date
    const period = String(time).toLowerCase() === 'pm' ? 'Evening' : 'Morning'
    return `${monthLabel} ${day} — ${period}`
}

const {panelDragStyle, onHandleTouchStart, onHandleTouchMove, onHandleTouchEnd} = useSwipeToClose(() => emit('close'))
</script>

<template>
    <section class="search-shell" :class="show ? 'is-open' : 'is-closed'">
        <button class="sheet-backdrop" aria-label="Close search" @click="emit('close')"></button>
        <div class="search-panel" :class="show ? 'panel-visible' : 'panel-hidden'" :style="panelDragStyle">
            <button class="sheet-handle" aria-label="Close search"
                    @click="emit('close')"
                    @touchstart="onHandleTouchStart"
                    @touchmove="onHandleTouchMove"
                    @touchend="onHandleTouchEnd"></button>
            <div class="panel-head">
                <h2>Search Devotionals</h2>
            </div>
            <input
                v-model="localQuery"
                class="search-input"
                type="search"
                placeholder="Search by keyword"
                @input="onQueryInput"
            />
            <p v-if="!query.trim()" class="hint">Type a keyword to search by verse or devotional body text.</p>
            <p v-else-if="!results.length" class="hint">No devotionals found for this keyword.</p>
            <div v-else class="results-list">
                <button
                    v-for="item in results"
                    :key="item.key"
                    class="result-item"
                    @click="selectResult(item)"
                >
                    <span class="result-date">{{ formatDatePeriod(item.date, item.time) }}</span>
                    <span class="result-verse">{{ quoteVerse(item.keyverse) }}</span>
                    <span class="result-ref" v-if="item.verseRef">{{ item.verseRef }}</span>
                    <div class="result-tags" v-if="item.tags?.length">
                        <span class="tag-pill" v-for="tag in item.tags" :key="`${item.key}-${tag}`">{{ tag }}</span>
                    </div>
                </button>
            </div>
        </div>
    </section>
</template>

<style scoped>
.search-shell {
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

.search-shell.is-open {
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

.search-panel {
    position: relative;
    width: 100%;
    max-height: 80vh;
    border-radius: 1.6rem 1.6rem 0 0;
    background: linear-gradient(to bottom, color-mix(in srgb, var(--surface) 85%, var(--surface-secondary)), var(--surface-secondary));
    box-shadow: 0 -14px 36px rgba(23, 33, 48, 0.25);
    overflow: auto;
    padding: 0.7rem 0.9rem 1rem;
    transform: translateY(calc(100% + 1rem));
    transition: transform 260ms ease;
}

.panel-visible {
    transform: translateY(0);
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
    margin-bottom: 0.5rem;
}

.panel-head h2 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1rem;
}

.search-input {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 0.8rem;
    padding: 0.7rem 0.8rem;
    font-size: 0.95rem;
    color: var(--text-primary);
    background: var(--surface);
}

.hint {
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin: 0.7rem 0 0.5rem;
    text-indent: 0;
}

.results-list {
    display: grid;
    gap: 0.45rem;
    margin-top: 0.55rem;
}

.result-item {
    border: 1px solid var(--border);
    background: var(--surface);
    border-radius: 0.8rem;
    text-align: left;
    padding: 0.55rem 0.65rem;
    display: grid;
    gap: 0.2rem;
}

.result-date {
    font-size: 0.72rem;
    color: var(--text-secondary);
}

.result-verse {
    font-size: 0.83rem;
    color: var(--text-primary);
}

.result-ref {
    font-size: 0.74rem;
    color: var(--text-muted, var(--text-secondary));
}

.result-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.32rem;
    margin-top: 0.18rem;
}

.tag-pill {
    font-size: 0.69rem;
    line-height: 1;
    padding: 0.24rem 0.4rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--support-row-background, var(--surface-secondary)) 88%, var(--surface) 12%);
    color: var(--support-row-text, var(--text-secondary));
    border: 1px solid var(--support-row-border, var(--border));
    text-transform: capitalize;
}

</style>
