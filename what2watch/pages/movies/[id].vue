<script setup>

const route = useRoute()
const movie = ref({
    release_date: '',
    origin_country: [''],
    videos: { results: [] },
})
const credits = ref({
    crew : [],
    cast: [],
});
const languages = ref([]);
const consolidatedCrew = ref({});
const watchProviders = ref({});
const apiKey = useRuntimeConfig().public.apiKey
const isVideoOpen = ref(false);

const openVideo = () => {
  isVideoOpen.value = true;
};

const onVideoClose = () => {
  console.log('Video player closed');
};

async function getMovie(id){
    const url = `https://api.themoviedb.org/3/movie/${id}?append_to_response=release_dates,videos`;
    const options = {method: 'GET', headers: {accept: 'application/json', Authorization: 'Bearer ' + apiKey}};

    fetch(url, options)
    .then(res => res.json())
    .then((json) => { movie.value = json; console.log(movie.value); })
    .catch(err => console.error(err));
}

async function getWatchProviders(id){
    const url = `https://api.themoviedb.org/3/movie/${id}/watch/providers`;
    const options = {method: 'GET', headers: {accept: 'application/json', Authorization: 'Bearer ' + apiKey}};

    fetch(url, options)
    .then(res => res.json())
    .then((json) => { watchProviders.value = json; console.log(watchProviders.value); })
    .catch(err => console.error(err));
}

const getMovieCredits = async (id) => {
  try {
    const data = await $fetch(`https://api.themoviedb.org/3/movie/${id}/credits`, {
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer ' + apiKey
      }
    });
    credits.value = data;
    return data;
  } catch (error) {
    console.error('Error fetching credits:', error);
  }
};

async function getLanguages(){
    const url = `https://api.themoviedb.org/3/configuration/languages`;
    const options = {method: 'GET', headers: {accept: 'application/json', Authorization: 'Bearer ' + apiKey}};

    fetch(url, options)
    .then(res => res.json())
    .then((json) => { languages.value = json; console.log(languages.value); })
    .catch(err => console.error(err));
}

function getYear(dateString) {
    console.log(dateString);
  return dateString.split('-')[0];
}

function findCertification(movie) {
  // Check if release_dates results exist
  if (!movie.release_dates?.results) return null;
  
  // Get the origin country (it's usually an array, so take the first one)
  const originCountry = Array.isArray(movie.origin_country) 
    ? movie.origin_country[0] 
    : movie.origin_country;
  
  // Return null if no origin country
  if (!originCountry) return null;
  
  // Find the release dates object matching the origin country
  const release = movie.release_dates.results.find(
    result => result.iso_3166_1 === originCountry
  );
  
  // Return null if no matching release found
  if (!release || !release.release_dates || release.release_dates.length === 0) {
    return null;
  }
  
  // Find the first release date with a certification
  const releaseWithCert = release.release_dates.find(
    release => release.certification
  );
  
  return releaseWithCert?.certification || null;
}

function convertMinutesToHoursAndMinutes(totalMinutes) {
  // Return empty string or handle invalid input
  if (totalMinutes == null || totalMinutes < 0) return '';
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  // Build the result string
  let result = '';
  
  if (hours > 0) {
    result += `${hours}h`;
  }
  
  if (minutes > 0) {
    result += `${hours > 0 ? ' ' : ''}${minutes}m`;
  }
  
  // If both are 0, return "0m"
  if (result === '') {
    result = '0m';
  }
  
  return result;
}

function consolidateCrew(crew) {
  if (!crew || !Array.isArray(crew)) {
    console.error('Invalid crew data');
    return {};
  }
  
  const allowedDepartments = ['Directing', 'Writing'];
  
  return crew.reduce((acc, member) => {
    const { name, department } = member;
    
    // Only include allowed departments
    if (!allowedDepartments.includes(department)) {
      return acc;
    }
    
    if (!acc[name]) {
      acc[name] = [];
    }
    
    if (!acc[name].includes(department)) {
      acc[name].push(department);
    }
    
    return acc;
  }, {});
}

function getLanguageName(languageCode, languages) {
  const language = languages.find(lang => lang.iso_639_1 === languageCode);
  return language ? language.english_name : 'Unknown Language';
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}

onMounted(async () => {
    const id = route.params.id;
    getMovie(id);
    await getMovieCredits(id);

    console.log('Credits value:', credits.value); // Debug log

    if (credits.value && credits.value.crew && credits.value.crew.length > 0) {
    consolidatedCrew.value = consolidateCrew(credits.value.crew);
    console.log('Consolidated crew:', consolidatedCrew.value);
    } else {
    console.log('No crew data available');
    }
    getLanguages();
    getWatchProviders(id)
});
</script>

<template>

    <div 
    class="d-flex p-5 movie-backdrop"
    :style="{
        backgroundImage: movie.backdrop_path ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` : 'none'
    }"
    >

        <div class="card col-4">
            <img  :src="movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/assets/No-Image-Placeholder.png'" alt="">
        </div>

        <div class="col-8 ms-4 text-light">

            <div>
                <h2>
                    <a href="" class="fw-bold text-light text-decoration-none">{{ `${movie.title}`}}</a>
                    <span class="text-light ms-2">{{ `${'(' + getYear(movie.release_date) + ')'}`  }}</span>
                </h2>

                <span class="border border-light p-1">{{ findCertification(movie) }}</span>
                <span class="ms-2">{{ movie.release_date }} ({{ movie.origin_country[0] }})</span>
                <span class="ms-2 facts-separator">

                    <span v-for="(genre, index) in movie.genres">{{ genre.name }}{{ movie.genres.length > 1 && index != movie.genres.length - 1 ? ', ' : '' }} </span>

                </span>
                <span class="ms-2 facts-separator">

                    {{ convertMinutesToHoursAndMinutes(movie.runtime) }}

                </span>

            </div>

            <div class="mt-4 d-flex">
                <rating-circle
                :rating="Math.trunc(movie.vote_average * 10)"
                />
               
                <div 
                v-if="movie.videos.results.length > 0"
                class="align-self-center">
                    <button
                    @click="openVideo"
                    class="btn btn-primary ms-5 d-flex align-items-center gap-2">
                    <Icon class="fs-2" name="mdi:play" />
                    Play Trailer
                    </button>
                    <video-player
                      v-model="isVideoOpen"
                      :url="movie.videos.results[0].site === 'YouTube' ? `https://www.youtube.com/embed/${movie.videos.results[0].key}` : ''"
                      @close="onVideoClose"
                    />
                </div>
              
            </div>

            <p class="mt-4 fst-italic">{{ movie.tagline }}</p>
            <p>Overview:</p>
            <p>{{ movie.overview }}</p>

            <div class="d-flex">
                <div 
                v-for="(departments, name) in consolidatedCrew" :key="name"
                class="me-5">
                    <p class="fw-bold">{{ name }}</p>
                    <p>{{ departments.join(', ') }}</p>
                </div>
            </div>
        </div>

    </div>

    <div
    class="px-5 d-flex mt-5"
    >
        <div class="col-9">
            <cast
            :cast="credits.cast"
            ></cast>
        </div>

        <div class="text-light col-3 ms-5">
            <div>
                <p class="mb-0 fw-bold">Status:</p>
                <p>{{ movie.status }}</p>
            </div>
            <div>
                <p class="mb-0 fw-bold">Original Language:</p>
                <p>{{getLanguageName(movie.original_language, languages)  }}</p>
            </div>
            <div v-if="movie.budget > 0" >
                <p class="mb-0 fw-bold">Budget:</p>
                <p>{{ formatPrice(movie.budget) }}</p>
            </div>
            <div v-if="movie.revenue > 0" >
                <p class="mb-0 fw-bold">Revenue:</p>
                <p>{{ formatPrice(movie.revenue) }}</p>
            </div>
        </div>
    </div>

</template>

<style scoped>

.facts-separator::before {
    content: "|";
    margin: 0 8px;
    color: #ffffff;
}
.movie-backdrop {
  background-size: cover;
  background-position: center;
  position: relative;
}

.movie-backdrop::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7); /* Dark overlay for text readability */
  z-index: 0;
}

.movie-backdrop > * {
  position: relative;
  z-index: 1;
}
</style>