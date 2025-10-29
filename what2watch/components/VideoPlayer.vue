
<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  url: {
    type: String,
    required: true
  },
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'close']);

const videoRef = ref(null);
const iframeRef = ref(null);
const isOpen = ref(props.modelValue);

// Detect if URL is an embed URL (YouTube, Vimeo, etc.)
const isEmbedUrl = computed(() => {
  const url = props.url.toLowerCase();
  return url.includes('youtube.com/embed') || 
         url.includes('youtu.be') || 
         url.includes('vimeo.com') ||
         url.includes('dailymotion.com/embed') ||
         url.includes('player.vimeo.com');
});

// Convert regular YouTube URLs to embed format if needed
const embedUrl = computed(() => {
  let url = props.url;
  
  // Convert youtube.com/watch?v=ID to youtube.com/embed/ID
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (videoId) {
      url = `https://www.youtube.com/embed/${videoId}`;
    }
  }
  
  // Convert youtu.be/ID to youtube.com/embed/ID
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) {
      url = `https://www.youtube.com/embed/${videoId}`;
    }
  }
  
  // Add autoplay parameter for YouTube embeds
  if (url.includes('youtube.com/embed')) {
    url += (url.includes('?') ? '&' : '?') + 'autoplay=1';
  }
  
  return url;
});

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue;
  if (!newValue) {
    if (videoRef.value) {
      videoRef.value.pause();
    }
  }
});

// Watch isOpen to emit changes
watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue);
});

const closePlayer = () => {
  isOpen.value = false;
  if (videoRef.value) {
    videoRef.value.pause();
  }
  emit('close');
};

// Expose methods for parent component if needed
defineExpose({
  closePlayer
});
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="video-overlay" @click="closePlayer">
        <div class="video-container" @click.stop>
          <button class="close-button" @click="closePlayer" aria-label="Close video">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <!-- For YouTube/Vimeo/iframe embeds -->
          <iframe
            v-if="isEmbedUrl"
            ref="iframeRef"
            :src="embedUrl"
            class="video-player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
          
          <!-- For direct video files -->
          <video
            v-else
            ref="videoRef"
            :src="url"
            controls
            autoplay
            class="video-player"

          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>


<style scoped>
.video-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.video-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  width: fit-content;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  z-index: 10;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.9);
}

.close-button:focus {
  outline: 2px solid white;
  outline-offset: 2px;
}

.video-player {
  display: block;
  max-width: 90vw;
  max-height: 90vh;
  width: auto;
  height: auto;
}

/* Specific styling for iframes (YouTube, Vimeo, etc.) */
iframe.video-player {
  width: 80vw;
  height: 45vw; /* 16:9 aspect ratio */
  max-width: 1200px;
  max-height: 675px; /* 16:9 of 1200px */
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>