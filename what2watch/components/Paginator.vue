  
  <script setup>
  import { ref, computed } from 'vue';
  
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
  
  // Watch for changes to emit update events
  import { watch } from 'vue';
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
    <div>
      <button 
        v-show="currentPage > 1"
        class="btn btn-primary me-1"
        @click="currentPage > 1 ? currentPage-- : currentPage = totalPages"
      >Previous</button>
      
      <!-- First page -->
      <button
        v-if="totalPages > 0"
        class="btn me-1"
        :class="currentPage != 1 ? 'btn-primary' : 'border border-dark'"
        @click="currentPage = 1"
      >1</button>
      
      <!-- Left ellipsis -->
      <button 
        v-if="showLeftEllipsis"
        class="btn btn-primary me-1"
        disabled
      >...</button>
      
      <!-- Middle pages -->
      <button
        v-for="index in middlePages"
        :key="index"
        class="btn me-1"
        :class="currentPage != index ? 'btn-primary' : 'border border-dark'"
        @click="currentPage = index"
      >{{ index }}</button>
      
      <!-- Right ellipsis -->
      <button 
        v-if="showRightEllipsis"
        class="btn btn-primary me-1"
        disabled
      >...</button>
      
      <!-- Last page -->
      <button
        v-if="totalPages > 1"
        class="btn me-1"
        :class="currentPage != totalPages ? 'btn-primary' : 'border border-dark'"
        @click="currentPage = totalPages"
      >{{ totalPages }}</button>
      
      <button 
        v-show="currentPage < totalPages"
        class="btn btn-primary me-1"
        @click="currentPage < totalPages ? currentPage++ : currentPage = 1"
      >Next</button>
    </div>
</template>
