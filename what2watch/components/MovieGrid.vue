<template>
    <div class="container mt-4">

      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
        <div v-for="movie in movies" :key="movie.id" class="col">
          <div class="card h-100 shadow">
            <img 
              :src="movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'" 
              class="card-img-top p-2" 
              :alt="movie.title"
            >
            <div class="card-body">
              <h5 class="card-title">{{ movie.title }}</h5>
              <p class="card-text small text-muted">{{ formatDate(movie.release_date) }}</p>
              <div class="d-flex align-items-center mb-2">
                <span class="badge bg-warning me-2">
                  <i class="bi bi-star-fill me-1"></i>
                  {{ movie.vote_average.toFixed(1) }}
                </span>
                <small class="text-muted">{{ movie.vote_count }} votes</small>
              </div>
              <p class="card-text small" style="height: 4.5rem; overflow-y: scroll; text-overflow: ellipsis;">
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
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'MovieGrid',
    props: {
      movies: {
        type: Array,
        required: true
      },
      title: {
        type: String,
        default: 'Movie Collection'
      },
    },
    data() {
      return {
        genres: [
          { id: 28, name: "Action" },
          { id: 12, name: "Adventure" },
          { id: 16, name: "Animation" },
          { id: 35, name: "Comedy" },
          { id: 80, name: "Crime" },
          { id: 99, name: "Documentary" },
          { id: 18, name: "Drama" },
          { id: 10751, name: "Family" },
          { id: 14, name: "Fantasy" },
          { id: 36, name: "History" },
          { id: 27, name: "Horror" },
          { id: 10402, name: "Music" },
          { id: 9648, name: "Mystery" },
          { id: 10749, name: "Romance" },
          { id: 878, name: "Science Fiction" },
          { id: 10770, name: "TV Movie" },
          { id: 53, name: "Thriller" },
          { id: 10752, name: "War" },
          { id: 37, name: "Western" }
        ]
      };
    },
    methods: {
      formatDate(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      },
      getGenreName(genreId) {
        const genre = this.genres.find(g => g.id === genreId);
        return genre ? genre.name : 'Unknown';
      }
    }
  };
  </script>
  
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