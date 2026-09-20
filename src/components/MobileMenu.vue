<script setup>
import {useAppStore} from '../store'
import {useSwipeToClose} from '../composables/useSwipeToClose'

const emit = defineEmits(['increaseFontSize', 'decreaseFontSize', 'resetSettings', 'theme-auto', 'theme-light', 'theme-dark', 'close-menu'])

const props = defineProps({
    showMenu: Boolean,
    content: Object,
    time: String,
    isIos: Boolean
})

const store = useAppStore()
const textSizeOptions = [
    {label: 'A', value: 14, className: 'size-sm'},
    {label: 'A', value: 17, className: 'size-md'},
    {label: 'A', value: 21, className: 'size-lg'},
]

function buyMeACoffee() {
    window.open('https://buymeacoffee.com/jarrodwhitley', '_blank')
}
function shareDevotion() {
    // Only works with https
    if (navigator.share) {
        navigator.share({
                title: 'Morning and Evening Devotion',
                text: 'Check out this devotion I found!',
                url: 'https://jarrodwhitley.github.io/m_and_e'
            })
            .then(() => console.log('Successful share'))
            .catch((error) => console.log('Error sharing', error));
    } else {
        console.log('Web Share API not supported');
    }
}

function setTextSize(size) {
    store.setFontSize(size)
}

const {panelDragStyle, onHandleTouchStart, onHandleTouchMove, onHandleTouchEnd} = useSwipeToClose(() => emit('close-menu'))
</script>

<template>
    <aside class="settings-shell"
           :class="props.showMenu ? 'is-open' : 'is-closed'"
           :style="'font-size:' + store.fontSize.toString() +'px;'">
        <button class="sheet-backdrop" aria-label="Close settings" @click="$emit('close-menu')"></button>
        <div class="settings-panel" :class="props.showMenu ? 'panel-visible' : 'panel-hidden'" :style="panelDragStyle">
            <button class="sheet-handle" aria-label="Close settings"
                    @click="$emit('close-menu')"
                    @touchstart="onHandleTouchStart"
                    @touchmove="onHandleTouchMove"
                    @touchend="onHandleTouchEnd"></button>
            <h2 class="settings-heading">Appearance</h2>
            <div class="settings-card">
                <label class="section-label">Theme</label>
                <div class="theme-grid">
                    <button class="theme-btn" :class="{'selected': store.theme === 'auto'}"
                            @click="$emit('theme-auto')">
                        Auto
                    </button>
                    <button class="theme-btn" :class="{'selected': store.theme === 'light'}"
                            @click="$emit('theme-light')">
                        Light
                    </button>
                    <button class="theme-btn" :class="{'selected': store.theme === 'dark'}"
                            @click="$emit('theme-dark')">
                        Dark
                    </button>
                </div>
            </div>
            <div class="settings-card">
                <div class="font-label-row">
                    <label class="section-label">Text Size</label>
                    <span class="font-size-pill">{{ store.fontSize }}</span>
                </div>
                <div class="font-presets">
                    <button v-for="option in textSizeOptions"
                            :key="option.value"
                            class="font-preset-btn"
                            :class="[option.className, {'selected': store.fontSize === option.value}]"
                            @click="setTextSize(option.value)">
                        {{ option.label }}
                    </button>
                </div>
            </div>
            <h2 class="settings-heading support-head">Support</h2>
            <div class="support-stack">
                <a class="menu-link" href="#" @click="shareDevotion">
                    <img class="w-4 mr-2 inline" src="../assets/share-solid-gray.svg"/>Share App</a>
                <a class="menu-link" @click="buyMeACoffee">
                    <img class="w-4 mr-2 inline -translate-y-[2px]" src="../assets/coffee-gray.png"/>Buy me a coffee</a>
                <a class="menu-link" href="mailto:support+m_and_e@jarrodwhitley.com">
                    <img class="w-4 mr-2 inline" src="../assets/bug-solid-gray.svg"/>Found a bug?</a>
            </div>
        </div>
    </aside>
</template>

<style lang="scss" scoped>
.settings-shell {
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

.settings-shell.is-open {
    pointer-events: auto;
    opacity: 1;
    visibility: visible;
}

.settings-shell.is-closed {
    pointer-events: none;
}

.sheet-backdrop {
    position: absolute;
    inset: 0;
    border: 0;
    background: var(--overlay-background);
    opacity: 0;
    transition: opacity 220ms ease;
}

.is-open .sheet-backdrop {
    opacity: 1;
}

.settings-panel {
    position: relative;
    width: 100%;
    max-height: min(74vh, 640px);
    border-radius: 2rem 2rem 0 0;
    background: linear-gradient(to bottom, color-mix(in srgb, var(--surface) 85%, var(--surface-secondary)), var(--surface-secondary));
    box-shadow: 0 -14px 36px rgba(23, 33, 48, 0.25), inset 0 0 0 1px var(--border);
    overflow-y: auto;
    padding: 0.7rem 0.9rem 1.15rem;
    color: var(--text-primary);
    transform: translateY(calc(100% + 1rem));
    transition: transform 280ms ease;
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

.panel-visible {
    opacity: 1;
    transform: translateY(0);
    transition: transform 280ms ease, opacity 220ms ease 60ms;
}

.panel-hidden {
    opacity: 0;
    transform: translateY(calc(100% + 1rem));
}

.settings-heading {
    margin: 0.2rem 0 0.55rem;
    color: var(--text-secondary);
    font-size: 0.94rem;
    letter-spacing: 0.07em;
    font-weight: 600;
    text-transform: uppercase;
}

.settings-card {
    border-radius: 1rem;
    background: var(--surface);
    box-shadow: inset 0 0 0 1px var(--border);
    padding: 0.75rem;
    margin-bottom: 0.65rem;
}

.section-label {
    display: block;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.theme-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.4rem;
}

.theme-btn {
    border: 0;
    border-radius: 0.7rem;
    padding: 0.55rem 0.35rem;
    background: var(--segmented-background);
    color: var(--segmented-text);
    font-weight: 600;
}

.theme-btn.selected {
    background: var(--button-primary);
    color: var(--button-primary-text);
}

.font-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.font-size-pill {
    background: var(--text-size-badge-background);
    color: var(--text-size-badge-text);
    border-radius: 999px;
    padding: 0.12rem 0.58rem;
    font-size: 0.85rem;
    font-weight: 600;
}

.font-presets {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
}

.font-preset-btn {
    border: 0;
    border-radius: 0.72rem;
    background: var(--segmented-background);
    color: var(--segmented-text);
    min-height: 2.5rem;
    font-family: "Iowan Old Style", "Palatino Linotype", Palatino, serif;
}

.font-preset-btn.size-sm {
    font-size: 1rem;
}

.font-preset-btn.size-md {
    font-size: 1.25rem;
}

.font-preset-btn.size-lg {
    font-size: 1.5rem;
}

.font-preset-btn.selected {
    background: var(--button-primary);
    color: var(--button-primary-text);
}

.support-head {
    margin-top: 0.95rem;
}

.support-stack {
    display: grid;
    gap: 0.35rem;
}

.menu-link {
    text-decoration: none;
    color: var(--support-row-text);
    background: var(--support-row-background);
    border-radius: 0.75rem;
    padding: 0.58rem 0.7rem;
    box-shadow: inset 0 0 0 1px var(--support-row-border);
}

@media (min-width: 768px) {
    .settings-panel {
        max-width: 30rem;
        margin: 0 auto;
        border-radius: 2rem;
        margin-bottom: 0.75rem;
    }
}
</style>