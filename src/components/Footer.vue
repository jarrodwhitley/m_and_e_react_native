<script setup>
import { ref } from 'vue'

defineProps({
  msg: String,
})

const count = ref(0)
</script>

<template>
<div class="bg-slate-800 p-8 text-white absolute bottom-0 left-0 right-0 h-fit">Footer</div>
</template>

<style scoped>

</style>
