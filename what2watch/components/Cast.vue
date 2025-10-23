<template>
  <div class="cast-container">
    <div class="cast-scroll">
      <div v-for="member in cast" :key="member.cast_id" class="cast-card">
        <div class="card h-100">
          <img 
            :src="getProfileImage(member.profile_path)" 
            class="card-img-top" 
            :alt="member.name"
          />
          <div class="card-body">
            <h5 class="card-title">{{ member.name }}</h5>
            <p class="card-text text-muted">{{ member.character }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  cast: {
    type: Array,
    required: true,
    default: () => []
  }
});

const getProfileImage = (profilePath) => {
  if (profilePath) {
    return `https://image.tmdb.org/t/p/w185${profilePath}`;
  }
  // Use local placeholder image
  return '/_nuxt/assets/No-Image-Placeholder.png';
};
</script>

<style scoped>
.cast-container {
  width: 100%;
  overflow: hidden;
}

.cast-scroll {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  padding-bottom: 1rem;
  scroll-behavior: smooth;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.cast-scroll::-webkit-scrollbar {
  height: 8px;
}

.cast-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.cast-scroll::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.cast-scroll::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.cast-card {
  flex: 0 0 auto;
  width: 150px;
}

.card {
  transition: transform 0.2s;
  width: 100%;
}

.card:hover {
  transform: translateY(-5px);
}

.card-img-top {
  height: 225px;
  object-fit: cover;
}

.card-title {
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.card-text {
  font-size: 0.8rem;
}
</style>