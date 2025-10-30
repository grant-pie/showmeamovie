<script setup>
import { useRouter } from 'vue-router';
import placeholderImage from '~/assets/No-Image-Placeholder.png'
const router = useRouter();

const props = defineProps({
  movie: {
    type: Object,
    required: true
  },
  genres: {
    type: Array,
    required: true
  }
});

const imgLoaded = ref(false);

function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function getGenreName(genreId) {
  const genre = props.genres.find(g => g.id === genreId);
  return genre ? genre.name : 'Unknown';
}

function navigateToMovie() {
  router.push(`/movies/${props.movie.id}`);
}

function handleKeyPress(event) {
  // Activate on Enter or Space key
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    navigateToMovie();
  }
}
</script>

<template>
  <article 
    class="card h-100 shadow"
    role="button"
    tabindex="0"
    :aria-label="`View details for ${movie.title}`"
    @click="navigateToMovie"
    @keydown="handleKeyPress"
  >
    <div 
      class="blur-load"
      :class="imgLoaded ? 'loaded' : ''" 
    >
      <img 
        :src="movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : placeholderImage" 
        class="card-img-top p-2"
        :alt="`${movie.title} poster`"
        loading="lazy"
        @load="imgLoaded = true"
      />
    </div>

    <div class="card-body">
      <h3 class="card-title">{{ movie.title }}</h3>
      <p class="card-text small text-muted">
        <time :datetime="movie.release_date">
          {{ formatDate(movie.release_date) }}
        </time>
      </p>
      
      <div class="d-flex align-items-center mb-2">
        <span 
          class="badge bg-warning me-2"
          role="img"
          :aria-label="`Rating: ${movie.vote_average?.toFixed(1) || 'N/A'} out of 10`"
        >
          <i class="bi bi-star-fill me-1" aria-hidden="true"></i>
          {{ movie.vote_average?.toFixed(1) || 'N/A' }}
        </span>
        <small class="text-muted">
          <span class="visually-hidden">Based on </span>
          {{ movie.vote_count }} votes
        </small>
      </div>
      
      <p class="card-text small">
        {{ movie.overview }}
      </p>
    </div>

    <footer class="card-footer bg-transparent">
      <div 
        class="d-flex flex-wrap gap-1"
        role="list"
        aria-label="Movie genres"
      >
        <span 
          v-for="genreId in movie.genre_ids" 
          :key="genreId" 
          class="badge bg-secondary small"
          role="listitem"
        >
          {{ getGenreName(genreId) }}
        </span>
      </div>
    </footer>
  </article>
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

.card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover,
.card:focus {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.card:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

.overview-text {
  height: 4.5rem; 
  overflow-y: scroll; 
  text-overflow: ellipsis;
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
  background-image: url('~/assets/Image-Loading-Placeholder.png');
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