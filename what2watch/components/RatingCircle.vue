
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
</script>

<template>
  <div class="rating-circle">
    <svg :width="size" :height="size" viewBox="0 0 100 100">
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
      >
        {{ rating }}%
      </text>
    </svg>
  </div>
</template>

<style scoped>
.rating-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

svg {
  display: block;
}
</style>