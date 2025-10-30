<script setup>
import placeholderImage from '~/assets/No-Image-Placeholder.png'
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
  return placeholderImage;
};
</script>

<template>
  <section class="cast-container" aria-labelledby="cast-heading">
    <h2 id="cast-heading" class="visually-hidden">Movie Cast</h2>
    <div 
      class="cast-scroll" 
      role="list"
      aria-label="Cast members"
      tabindex="0"
    >
      <article 
        v-for="member in cast" 
        :key="member.cast_id" 
        class="cast-card"
        role="listitem"
      >
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
            <h3 class="card-title">{{ member.name }}</h3>
            <p class="card-text text-muted">
              <span class="visually-hidden">Character: </span>
              {{ member.character }}
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
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

.cast-scroll:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
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

.card:hover,
.card:focus-within {
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

img {
  width: 100%;
  aspect-ratio: 1/1.5;
  display: block;
  object-position: center;
  object-fit: cover;
}

.blur-load::before {
  content: "";
  position: absolute;
  inset: 0;
  animation: pulse 2.5s infinite;
  background-color: rgba(255, 255, 255, 1);
}

.blur-load.loaded::before {
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
  background-image: url(../_nuxt/assets/Image-Loading-Placeholder.png);
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