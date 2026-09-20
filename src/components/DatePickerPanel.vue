<script setup>
import { computed, ref, watch } from 'vue'
import { useSwipeToClose } from '../composables/useSwipeToClose'

const props = defineProps({
    show: Boolean,
    availableDates: {
        type: Array,
        default: () => []
    },
    currentDate: {
        type: String,
        default: ''
    },
    currentPeriod: {
        type: String,
        default: 'am'
    }
})

const emit = defineEmits(['close', 'select-date', 'go-today'])

const selectedPeriod = ref('am')
const selectedMonth = ref('')
const selectedDay = ref('')

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const monthToDaysMap = computed(() => {
    const map = new Map()

    for (const rawDate of props.availableDates) {
        const [rawMonth, rawDay] = String(rawDate).split('-')
        const month = Number(rawMonth)
        const day = Number(rawDay)

        if (!month || !day) {
            continue
        }

        if (!map.has(month)) {
            map.set(month, [])
        }

        const days = map.get(month)
        if (!days.includes(day)) {
            days.push(day)
            days.sort((a, b) => a - b)
        }
    }

    return map
})

const monthOptions = computed(() => [...monthToDaysMap.value.keys()].sort((a, b) => a - b))

const dayOptions = computed(() => {
    const month = Number(selectedMonth.value)
    if (!month || !monthToDaysMap.value.has(month)) {
        return []
    }

    return monthToDaysMap.value.get(month)
})

function initializeSelectedDate() {
    const [rawMonth, rawDay] = String(props.currentDate || '').split('-')
    const currentMonth = Number(rawMonth)
    const currentDay = Number(rawDay)

    if (currentMonth && currentDay && monthToDaysMap.value.get(currentMonth)?.includes(currentDay)) {
        selectedMonth.value = String(currentMonth)
        selectedDay.value = String(currentDay)
        return
    }

    const firstMonth = monthOptions.value[0]
    const firstDay = firstMonth ? monthToDaysMap.value.get(firstMonth)?.[0] : null
    selectedMonth.value = firstMonth ? String(firstMonth) : ''
    selectedDay.value = firstDay ? String(firstDay) : ''
}

function emitSelectedDevotional(keepOpen = false) {
    if (!selectedMonth.value || !selectedDay.value) {
        return
    }

    emit('select-date', {
        date: `${Number(selectedMonth.value)}-${Number(selectedDay.value)}`,
        period: selectedPeriod.value,
        keepOpen
    })
}

watch(() => props.show, (isOpen) => {
    if (!isOpen) {
        return
    }

    initializeSelectedDate()
    selectedPeriod.value = props.currentPeriod || 'am'
})

watch(selectedMonth, () => {
    const dayList = dayOptions.value
    if (!dayList.length) {
        selectedDay.value = ''
        return
    }

    if (!dayList.includes(Number(selectedDay.value))) {
        selectedDay.value = String(dayList[0])
    }
})

function chooseToday() {
    emit('go-today')
}

function onPeriodChange(period) {
    selectedPeriod.value = period
}

function confirmJumpToDate() {
    emitSelectedDevotional(false)
}

const {panelDragStyle, onHandleTouchStart, onHandleTouchMove, onHandleTouchEnd} = useSwipeToClose(() => emit('close'))
</script>

<template>
    <section class="date-shell" :class="show ? 'is-open' : 'is-closed'">
        <button class="sheet-backdrop" aria-label="Close date picker" @click="emit('close')"></button>
        <div class="date-panel" :class="show ? 'panel-visible' : ''" :style="panelDragStyle">
            <button class="sheet-handle" aria-label="Close date picker"
                    @click="emit('close')"
                    @touchstart="onHandleTouchStart"
                    @touchmove="onHandleTouchMove"
                    @touchend="onHandleTouchEnd"></button>

            <label class="field-label" for="devotional-month">Date</label>
            <div class="date-fields">
                <select id="devotional-month" v-model="selectedMonth" class="date-select">
                    <option v-for="month in monthOptions" :key="month" :value="String(month)">
                        {{ monthNames[month - 1] }}
                    </option>
                </select>
                <select id="devotional-day" v-model="selectedDay" class="date-select">
                    <option v-for="day in dayOptions" :key="day" :value="String(day)">
                        {{ day }}
                    </option>
                </select>
            </div>

            <div class="period-row">
                <button class="period-btn" :class="selectedPeriod === 'am' ? 'selected' : ''" @click="onPeriodChange('am')">Morning</button>
                <button class="period-btn" :class="selectedPeriod === 'pm' ? 'selected' : ''" @click="onPeriodChange('pm')">Evening</button>
            </div>

            <div class="action-row">
                <button class="primary-btn" @click="confirmJumpToDate">Jump To Date</button>
                <button class="secondary-btn" @click="chooseToday">Go To Today</button>
            </div>
        </div>
    </section>
</template>

<style scoped>
.date-shell {
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

.date-shell.is-open {
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

.date-panel {
    width: 100%;
    border-radius: 1.6rem 1.6rem 0 0;
    background: linear-gradient(to bottom, color-mix(in srgb, var(--surface) 85%, var(--surface-secondary)), var(--surface-secondary));
    box-shadow: 0 -14px 36px rgba(23, 33, 48, 0.25);
    padding: 0.7rem 0.9rem 1.1rem;
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

.field-label {
    display: block;
    margin-bottom: 0.35rem;
    color: var(--text-secondary);
    font-weight: 600;
}

.date-fields {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 0.5rem;
}

.date-select {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 0.8rem;
    padding: 0.7rem 0.8rem;
    font-size: 0.95rem;
    color: var(--text-primary);
    background: var(--surface);
}

/* iOS Safari renders the native select caret/text using the light color
   scheme by default, making it black on the dark evening theme. */
:global(.evening) .date-select {
    color-scheme: dark;
}

:global(.morning) .date-select {
    color-scheme: light;
}

.period-row {
    margin-top: 0.6rem;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
}

.period-btn {
    border: 0;
    border-radius: 0.75rem;
    background: var(--segmented-background);
    color: var(--segmented-text);
    min-height: 2.4rem;
    font-weight: 600;
}

.period-btn.selected {
    background: var(--button-primary);
    color: var(--button-primary-text);
}

.action-row {
    margin-top: 2rem;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
}

.secondary-btn {
    border: 0;
    border-radius: 0.75rem;
    min-height: 2.45rem;
    font-weight: 600;
}

.secondary-btn {
    background: var(--support-row-background);
    color: var(--support-row-text);
    box-shadow: inset 0 0 0 1px var(--support-row-border);
}

.primary-btn {
    border: 0;
    border-radius: 0.75rem;
    min-height: 2.45rem;
    font-weight: 600;
    background: var(--button-primary);
    color: var(--button-primary-text);
}
</style>
