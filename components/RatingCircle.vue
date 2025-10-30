<script setup>
import { computed } from 'vue';

const props = defineProps({
  rating: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 100
  },
  size: {
    type: Number,
    default: 100
  },
  strokeWidth: {
    type: Number,
    default: 8
  },
  backgroundColor: {
    type: String,
    default: '#ef4444' // red
  },
  progressColor: {
    type: String,
    default: '#22c55e' // green
  }
});

const radius = computed(() => (100 - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const dashOffset = computed(() => {
  const progress = props.rating / 100;
  return circumference.value * (1 - progress);
});
const fontSize = computed(() => props.size / 5);

// Provide descriptive text for screen readers
const ratingDescription = computed(() => {
  if (props.rating >= 70) return 'High rating';
  if (props.rating >= 40) return 'Average rating';
  return 'Low rating';
});
</script>

<template>
  <figure class="rating-circle" role="img" :aria-label="`${ratingDescription}: ${rating} percent`">
    <svg 
      :width="size" 
      :height="size" 
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      <!-- Background circle (red) -->
      <circle
        cx="50"
        cy="50"
        :r="radius"
        fill="none"
        :stroke="backgroundColor"
        :stroke-width="strokeWidth"
      />
      
      <!-- Progress circle (green) -->
      <circle
        cx="50"
        cy="50"
        :r="radius"
        fill="none"
        :stroke="progressColor"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        transform="rotate(-90 50 50)"
      />
      
      <!-- Center text showing the rating -->
      <text
        x="50"
        y="50"
        text-anchor="middle"
        dominant-baseline="middle"
        :font-size="fontSize"
        font-weight="bold"
        :fill="progressColor"
        aria-hidden="true"
      >
        {{ rating }}%
      </text>
    </svg>
    <figcaption class="visually-hidden">
      Rating: {{ rating }} out of 100
    </figcaption>
  </figure>
</template>

<style scoped>
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.rating-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}

svg {
  display: block;
}
</style>