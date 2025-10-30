<script setup>
const props = defineProps({
  movies: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: 'Movie Collection'
  },
  genres: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <section class="container mt-4" aria-labelledby="movie-grid-heading">
    <h2 id="movie-grid-heading" class="visually-hidden">{{ title }}</h2>
    
    <div 
      class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4"
      role="list"
      :aria-label="`${title} - ${movies.length} movies`"
    >
      <div 
        v-for="movie in movies" 
        :key="movie.id" 
        class="col"
        role="listitem"
      >
        <MovieCard
          :movie="movie"
          :genres="genres"
        />
      </div>
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

.card {
  transition: transform 0.3s;
}

.card:hover,
.card:focus-within {
  transform: translateY(-5px);
}

.card-img-top {
  height: 300px;
  object-fit: contain;
}
</style>