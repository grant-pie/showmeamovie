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
    <div class="container mt-4">

      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
        <div v-for="movie in movies" :key="movie.id" class="col">
          <MovieCard
          :movie="movie"
          :genres="genres"
          />
        </div>
      </div>
    </div>
</template>

  
  <style scoped>
  .card {
    transition: transform 0.3s;
  }
  .card:hover {
    transform: translateY(-5px);
  }
  .card-img-top {
    height: 300px;
    object-fit: contain;
  }
  </style>