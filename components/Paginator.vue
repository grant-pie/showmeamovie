<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

// Props
const props = defineProps({
  totalPages: {
    type: Number,
    required: true
  },
  modelValue: {
    type: Number,
    default: 1
  }
});

// Emits
const emit = defineEmits(['update:modelValue']);

// State
const currentPage = ref(props.modelValue);
const isMobile = ref(false);

// Check if device is mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // Adjust breakpoint as needed
};

// Lifecycle hooks
onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

// Watch for changes to emit update events
watch(currentPage, (newValue) => {
  emit('update:modelValue', newValue);
});

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== currentPage.value) {
    currentPage.value = newValue;
  }
});

// Computed properties
const middlePages = computed(() => {
  if (props.totalPages <= 8) {
    // If 8 or fewer pages, show all pages from 2 to totalPages-1
    return Array.from({ length: Math.max(0, props.totalPages - 2) }, (_, i) => i + 2);
  }
  
  // Otherwise, determine which middle pages to show
  let start, end;
  
  if (currentPage.value < 5) {
    // Near beginning: show pages 2-6
    start = 2;
    end = 6;
  } else if (currentPage.value > props.totalPages - 4) {
    // Near end: show last 5 pages before the final page
    start = props.totalPages - 5;
    end = props.totalPages - 1;
  } else {
    // In middle: show 2 pages before and 2 pages after current
    start = currentPage.value - 2;
    end = currentPage.value + 2;
  }
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

const showLeftEllipsis = computed(() => {
  // Show left ellipsis if we're not displaying the second page
  return props.totalPages > 8 && middlePages.value.length > 0 && middlePages.value[0] > 2;
});

const showRightEllipsis = computed(() => {
  // Show right ellipsis if we're not displaying the second-to-last page
  return props.totalPages > 8 && 
    middlePages.value.length > 0 && 
    middlePages.value[middlePages.value.length - 1] < props.totalPages - 1;
});
</script>

<template>
  <nav aria-label="Pagination navigation">
    <!-- Mobile view: Previous | Current | Next -->
    <ul v-if="isMobile" class="pagination-list pagination-mobile">
      <li>
        <button 
          class="btn btn-primary"
          :disabled="currentPage === 1"
          :aria-label="`Go to previous page, page ${currentPage - 1}`"
          @click="currentPage > 1 ? currentPage-- : null"
        >
          <span aria-hidden="true">Previous</span>
        </button>
      </li>
      
      <li>
        <span class="current-page-indicator text-light">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
      </li>
      
      <li>
        <button 
          class="btn btn-primary"
          :disabled="currentPage === totalPages"
          :aria-label="`Go to next page, page ${currentPage + 1}`"
          @click="currentPage < totalPages ? currentPage++ : null"
        >
          <span aria-hidden="true">Next</span>
        </button>
      </li>
    </ul>

    <!-- Desktop view: Full pagination -->
    <ul v-else class="pagination-list">
      <li v-show="currentPage > 1">
        <button 
          class="btn btn-primary me-1"
          :aria-label="`Go to previous page, page ${currentPage - 1}`"
          @click="currentPage > 1 ? currentPage-- : currentPage = totalPages"
        >
          <span aria-hidden="true">Previous</span>
        </button>
      </li>
      
      <!-- First page -->
      <li v-if="totalPages > 0">
        <button
          class="btn me-1"
          :class="currentPage != 1 ? 'btn-primary' : 'border border-dark'"
          :aria-label="currentPage === 1 ? 'Current page, page 1' : 'Go to page 1'"
          :aria-current="currentPage === 1 ? 'page' : undefined"
          @click="currentPage = 1"
        >
          1
        </button>
      </li>
      
      <!-- Left ellipsis -->
      <li v-if="showLeftEllipsis">
        <span 
          class="btn btn-primary me-1 ellipsis"
          aria-hidden="true"
          disabled
        >...</span>
      </li>
      
      <!-- Middle pages -->
      <li
        v-for="index in middlePages"
        :key="index"
      >
        <button
          class="btn me-1"
          :class="currentPage != index ? 'btn-primary' : 'border border-dark'"
          :aria-label="currentPage === index ? `Current page, page ${index}` : `Go to page ${index}`"
          :aria-current="currentPage === index ? 'page' : undefined"
          @click="currentPage = index"
        >
          {{ index }}
        </button>
      </li>
      
      <!-- Right ellipsis -->
      <li v-if="showRightEllipsis">
        <span 
          class="btn btn-primary me-1 ellipsis"
          aria-hidden="true"
          disabled
        >...</span>
      </li>
      
      <!-- Last page -->
      <li v-if="totalPages > 1">
        <button
          class="btn me-1"
          :class="currentPage != totalPages ? 'btn-primary' : 'border border-dark'"
          :aria-label="currentPage === totalPages ? `Current page, page ${totalPages}` : `Go to page ${totalPages}`"
          :aria-current="currentPage === totalPages ? 'page' : undefined"
          @click="currentPage = totalPages"
        >
          {{ totalPages }}
        </button>
      </li>
      
      <li v-show="currentPage < totalPages">
        <button 
          class="btn btn-primary me-1"
          :aria-label="`Go to next page, page ${currentPage + 1}`"
          @click="currentPage < totalPages ? currentPage++ : currentPage = 1"
        >
          <span aria-hidden="true">Next</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.pagination-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0;
}

.pagination-list li {
  display: inline-block;
}

.btn:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ellipsis {
  cursor: default;
  pointer-events: none;
}

/* Mobile-specific styles */
.pagination-mobile {
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 8px;
}

.pagination-mobile li {
  flex: 0 0 auto;
}

.current-page-indicator {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}
</style>