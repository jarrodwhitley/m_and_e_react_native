<script setup>
import spurgeonIcon from '../assets/spurgeon_icon.png'

const props = defineProps({
    loading: Boolean,
    time: String,
})
</script>

<template>
    <div id="loadingOverlay" class="absolute top-0 bottom-0 left-0 right-0 z-50 bg-cover flex justify-center items-center duration-500 pointer-events-none"
         :class="loading ? 'opacity-100 ' : 'opacity-0'">
        <img :src="spurgeonIcon"
             class="w-3/4 max-w-[300px] h-auto z-10 mix-blend-screen animate-grow"
             alt="icon image"/>
    </div>
</template>

<style lang="scss" scoped>
#loadingOverlay {
    // Evening color at the top fading into the morning accent at the bottom
    // gives the icon (mix-blend-screen) enough contrast in both themes.
    background: linear-gradient(180deg, #1A2433 0%, #2A3A4F 45%, #C9923D 100%);
}
@keyframes grow {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
}
.animate-grow {
    animation: grow 2s infinite;
}
</style>