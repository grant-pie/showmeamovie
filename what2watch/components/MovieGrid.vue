<template>
    <div class="container mt-4">

      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
        <div v-for="movie in movies" :key="movie.id" class="col">

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