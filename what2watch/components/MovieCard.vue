<script setup>
import { useRouter } from 'vue-router';
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
</script>

<template>

    <div class="card h-100 shadow"
    @click="navigateToMovie"
    >

        <img 
        :src="movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '_nuxt/assets/No-Image-Placeholder.png'" 
        class="card-img-top p-2" 
        :alt="movie.title"
        >

        <div class="card-body">
            <h5 class="card-title">{{ movie.title }}</h5>
            <p class="card-text small text-muted">{{ formatDate(movie.release_date) }}</p>
            <div class="d-flex align-items-center mb-2">
            <span class="badge bg-warning me-2">
                <i class="bi bi-star-fill me-1"></i>
                {{ movie.vote_average?.toFixed(1) || 'N/A'  }}
            </span>
            <small class="text-muted">{{ movie.vote_count }} votes</small>
            </div>
            <p class="card-text small" >
            {{ movie.overview }}
            </p>
        </div>

        <div class="card-footer bg-transparent">
            <div class="d-flex flex-wrap gap-1">
            <span v-for="genreId in movie.genre_ids" :key="genreId" 
            class="badge bg-secondary small">
                {{ getGenreName(genreId) }}
            </span>
            </div>
        </div>

    </div>

</template>

<style scoped>
.card {
    cursor: pointer;
}

.overview-text {
    height: 4.5rem; 
    overflow-y: scroll; 
    text-overflow: ellipsis;
}

</style>