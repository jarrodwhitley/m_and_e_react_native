<script setup>
defineProps({
    currentPeriod: {
        type: String,
        default: 'am'
    },
    activePanel: {
        type: String,
        default: null
    }
})

defineEmits(['open-search', 'open-date', 'toggle-period', 'open-bookmarks', 'open-settings'])
</script>

<template>
    <nav class="control-bar" aria-label="Devotional controls">
        <button class="control-btn" :class="{'is-selected': activePanel === 'search'}" @click="$emit('open-search')" aria-label="Search devotionals">
            <span class="material-symbols-rounded icon" aria-hidden="true">search</span>
            <span class="label">Search</span>
        </button>
        <button class="control-btn" :class="{'is-selected': activePanel === 'date'}" @click="$emit('open-date')" aria-label="Select date">
            <span class="material-symbols-rounded icon" aria-hidden="true">calendar_month</span>
            <span class="label">Date</span>
        </button>
        <button class="control-btn" @click="$emit('toggle-period')" aria-label="Toggle morning evening">
            <span class="material-symbols-rounded icon" aria-hidden="true">{{ currentPeriod === 'am' ? 'light_mode' : 'dark_mode' }}</span>
            <span class="label">{{ currentPeriod === 'am' ? 'Morning' : 'Evening' }}</span>
        </button>
        <button class="control-btn" :class="{'is-selected': activePanel === 'settings'}" @click="$emit('open-settings')" aria-label="Open settings">
            <span class="material-symbols-rounded icon" aria-hidden="true">settings</span>
            <span class="label">Settings</span>
        </button>

        <button class="control-btn" :class="{'is-selected': activePanel === 'bookmarks'}" @click="$emit('open-bookmarks')" aria-label="Open saved devotionals">
            <span class="material-symbols-rounded icon icon-filled" aria-hidden="true">bookmark</span>
            <span class="label">Saved</span>
        </button>
    </nav>
</template>

<style scoped>
.control-bar {
    flex-shrink: 0;
    z-index: 18;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    border-top: 1px solid var(--border);
    background: color-mix(in srgb, var(--surface-secondary) 88%, transparent);
    backdrop-filter: blur(8px);
    padding: 0.15rem 0.2rem env(safe-area-inset-bottom, 0px);
    touch-action: none;
}

.control-btn {
    border: 0;
    background: transparent;
    color: var(--text-secondary);
    min-height: 66px;
    padding: 0.42rem 0.1rem 0.36rem;
    display: grid;
    justify-items: center;
    gap: 0.18rem;
    font-size: 0.68rem;
    letter-spacing: 0.03em;
    border-radius: 0.7rem;
    margin: 0.04rem;
    transition: background-color 150ms ease, color 150ms ease, transform 120ms ease;
}

.icon {
    font-size: 1.52rem;
    line-height: 1;
    font-variation-settings: 'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24;
}

.icon-filled {
    font-variation-settings: 'FILL' 1, 'wght' 650, 'GRAD' 0, 'opsz' 24;
}

.label {
    line-height: 1;
}

.control-btn.is-selected {
    color: var(--selected-text);
    background: color-mix(in srgb, var(--selected-background) 64%, transparent);
}

.control-btn:focus-visible {
    color: var(--text-primary);
    background: color-mix(in srgb, var(--surface) 72%, transparent);
}

.control-btn.is-selected:focus-visible {
    color: var(--selected-text);
    background: color-mix(in srgb, var(--selected-background) 64%, transparent);
}

.control-btn:active {
    transform: translateY(1px);
}
</style>
