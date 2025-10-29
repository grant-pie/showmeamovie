<script setup>
const props = defineProps({
  cast: {
    type: Array,
    required: true,
    default: () => []
  }
});

const profileLoaded = ref(false);

const getProfileImage = (profilePath) => {
  if (profilePath) {
    return `https://image.tmdb.org/t/p/w185${profilePath}`;
  }
  // Use local placeholder image
  return '/_nuxt/assets/No-Image-Placeholder.png';
};
</script>

<template>
  <div class="cast-container">
    <div class="cast-scroll">
      <div v-for="member in cast" :key="member.cast_id" class="cast-card">
        <div class="card h-100">
          <div 
          class="blur-load"
          :class="profileLoaded ? 'loaded' : ''" 
          >
            <img 
            :src="getProfileImage(member.profile_path)" 
            class="card-img-top" 
            :alt="`${member.name} as ${member.character}`"
            loading="lazy"
            @load="profileLoaded = true"
          />
          </div>
          <div class="card-body">
            <h5 class="card-title">{{ member.name }}</h5>
            <p class="card-text text-muted">{{ member.character }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

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

img{
    width: 100%;
    aspect-ratio: 1/1.5;
    display: block;
    object-position: center;
    object-fit: cover;
}

.blur-load::before{
    content: "";
    position: absolute;
    inset: 0;
    animation: pulse 2.5s infinite;
    background-color: rgba(255, 255, 255, 1);
}

.blur-load.loaded::before{
    content: none;
}

@keyframes pulse {
    0% {
        opacity: 0;
    }
    50% {
        opacity: 0.1;
    }
    100% {
        opacity: 0;
    }
}

.blur-load {
    background-image: url(_nuxt/assets/Image-Loading-Placeholder.png);
    background-size: cover;
    background-position: center;
}

.blur-load > img {
    opacity: 1!important;
}

.blur-load > img {
    opacity: 0;
    transition: opacity 200ms ease-in-out;
}

</style>