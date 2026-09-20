import { ref } from 'vue'

const SWIPE_CLOSE_THRESHOLD = 120

// Shared iOS-style drag handle: follows the finger 1:1, then either snaps back
// (CSS transition takes over once the inline override is cleared) or closes.
export function useSwipeToClose(onClose) {
    const isDragging = ref(false)
    const dragOffset = ref(0)
    const panelDragStyle = ref({})
    let touchStartY = 0

    function onHandleTouchStart(event) {
        touchStartY = event.touches[0].clientY
        isDragging.value = true
        dragOffset.value = 0
        panelDragStyle.value = {transform: 'translateY(0px)', transition: 'none'}
    }

    function onHandleTouchMove(event) {
        if (!isDragging.value) {
            return
        }

        dragOffset.value = Math.max(0, event.touches[0].clientY - touchStartY)
        panelDragStyle.value = {transform: `translateY(${dragOffset.value}px)`, transition: 'none'}
    }

    function onHandleTouchEnd() {
        if (!isDragging.value) {
            return
        }

        isDragging.value = false

        if (dragOffset.value > SWIPE_CLOSE_THRESHOLD) {
            onClose()
        }

        dragOffset.value = 0
        panelDragStyle.value = {}
    }

    return {
        panelDragStyle,
        onHandleTouchStart,
        onHandleTouchMove,
        onHandleTouchEnd
    }
}
