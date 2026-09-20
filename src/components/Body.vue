<script setup>
import { computed } from 'vue'
import { useAppStore} from "../store.js";

const props = defineProps({
    content: Object
})

const store = useAppStore()

const bodySections = computed(() => {
    const rawBody = props.content?.body

    if (Array.isArray(rawBody)) {
        return rawBody
            .map((item) => {
                if (item && typeof item === 'object') {
                    const content = String(item.content || '').replace(/[\u0080-\u009F]/g, '').trim()
                    if (!content) {
                        return null
                    }

                    return {
                        type: item.type === 'poetry' ? 'poetry' : 'paragraph',
                        content
                    }
                }

                const content = String(item || '').replace(/[\u0080-\u009F]/g, '').trim()
                if (!content) {
                    return null
                }

                return {
                    type: 'paragraph',
                    content
                }
            })
            .filter(Boolean)
    }

    const normalized = String(rawBody || '').replace(/[\u0080-\u009F]/g, '').trim()
    if (!normalized) {
        return []
    }

    const paragraphs = normalized
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
        .filter(Boolean)

    return paragraphs.map((content) => ({
        type: 'paragraph',
        content
    }))
})

const keyVerseText = computed(() => props.content?.keyVerseNoRef || props.content?.keyverse || '')
const verseReferenceText = computed(() => props.content?.verseRef || '')

function quoteVerse(text) {
    const normalized = String(text || '').trim().replace(/^"+|"+$/g, '')
    return normalized ? `"${normalized}"` : ''
}

const firstParagraphIndex = computed(() => bodySections.value.findIndex((section) => section.type === 'paragraph'))

const firstParagraph = computed(() => {
    if (firstParagraphIndex.value < 0) {
        return ''
    }

    return bodySections.value[firstParagraphIndex.value]?.content || ''
})

const bodySegments = computed(() => {
    const text = firstParagraph.value.replace(/^\s+/, '')

    const match = text.match(/[A-Za-z]/)

    if (!match || typeof match.index !== 'number') {
        return {
            leading: '',
            dropCap: '',
            rest: text
        }
    }

    const index = match.index
    return {
        leading: text.slice(0, index),
        dropCap: text.charAt(index),
        rest: text.slice(index + 1)
    }
})

function isFirstParagraph(index, section) {
    return section.type === 'paragraph' && index === firstParagraphIndex.value
}
</script>

<template>
    <section id="body" class="body-panel" :style="'font-size:'+ store.fontSize.toString() +'px;'">
        <div class="key-verse">
            <p class="key-verse-text" v-text="quoteVerse(keyVerseText)"></p>
            <p class="verse-ref" v-if="verseReferenceText" v-text="verseReferenceText"></p>
        </div>
        <div class="body-content">
            <p
                v-for="(section, index) in bodySections"
                :key="`section-${index}`"
                class="body-copy"
                :class="{
                    'first-paragraph': isFirstParagraph(index, section),
                    'indented-paragraph': section.type === 'paragraph' && !isFirstParagraph(index, section),
                    'poetry-paragraph': section.type === 'poetry'
                }"
            >
                <template v-if="isFirstParagraph(index, section)">
                    <span v-if="bodySegments.leading" v-text="bodySegments.leading"></span><span
                        v-if="bodySegments.dropCap"
                        class="drop-cap"
                        v-text="bodySegments.dropCap"
                    ></span><span v-text="bodySegments.rest"></span>
                </template>
                <template v-else>
                    <span v-text="section.content"></span>
                </template>
            </p>
        </div>
    </section>
    <div class="desktop-warning">
        Mobile-first layout with a classic reading mode.
    </div>
</template>

<style scoped>
.body-panel {
    margin: 0;
    background: transparent;
    color: var(--text-primary);
    overflow: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    text-align: left;
    flex: 1;
    min-height: 0;
}

.key-verse {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.94em;
    font-weight: 500;
    line-height: 1.45;
    letter-spacing: 0.012em;
    padding: 0.85rem;
    text-indent: 0;
    border-bottom: 1px solid var(--border);
}

.key-verse-text,
.verse-ref {
    margin: 0;
    text-indent: 0;
}

.verse-ref {
    margin-top: 0.12rem;
    color: var(--text-muted, var(--text-secondary));
    font-size: 0.92em;
}

.body-copy {
    margin: 0;
    color: var(--text-primary);
    text-align: justify;
    line-height: 1.62;
    letter-spacing: 0.002em;
    text-wrap: pretty;
    overflow-wrap: anywhere;
    font-family: "Iowan Old Style", "Palatino Linotype", Palatino, serif;
}

.body-content {
    padding: 0.9rem 1rem 1rem;
}

.first-paragraph {
    text-indent: 0;
}

.indented-paragraph {
    text-indent: 1.35em;
}

.poetry-paragraph {
    text-indent: 0;
    text-align: justify;
    font-style: italic;
    white-space: pre-line;
    background: color-mix(in srgb, var(--surface) 86%, var(--support-row-background, var(--surface-secondary)) 14%);
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent-primary);
    padding: 0.75rem 0.8rem;
    margin-top: 0.55rem;
}

.drop-cap {
    float: left;
    font-size: 3.7em;
    line-height: 0.68;
    margin-right: 0.165em;
    margin-left: -0.015em;
    padding-top: 0.08em;
    font-weight: 600;
    color: var(--accent-primary);
}

.desktop-warning {
    display: none;
}

@media (min-width: 1024px) {
    .body-content {
        padding-inline: 1.25rem;
    }

    .desktop-warning {
        display: block;
        text-align: center;
        color: var(--text-secondary);
        font-size: 0.84rem;
        letter-spacing: 0.03em;
        margin: 0 0 0.9rem;
    }
}
</style>