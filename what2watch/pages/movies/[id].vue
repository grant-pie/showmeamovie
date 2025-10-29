<script setup>

const route = useRoute()
const router = useRouter()

// Reactive state
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

// Loading and error states
const isLoadingMovie = ref(true);
const isLoadingCredits = ref(true);
const isLoadingLanguages = ref(true);
const isLoadingWatchProviders = ref(true);
const movieError = ref(null);
const creditsError = ref(null);
const languagesError = ref(null);
const watchProvidersError = ref(null);
const movieNotFound = ref(false);
const posterImageError = ref(false);
const backdropImageError = ref(false);

const apiKey = useRuntimeConfig().public.apiKey
const isVideoOpen = ref(false);
const showBackToTop = ref(false);
const screenReaderAnnouncement = ref('');
const playTrailerButtonRef = ref(null);

const posterLoaded = ref(false);

const openVideo = () => {
  isVideoOpen.value = true;
  screenReaderAnnouncement.value = 'Video player opened. Press Escape to close.';
};

const onVideoClose = () => {
  isVideoOpen.value = false;
  screenReaderAnnouncement.value = 'Video player closed.';
  
  // Return focus to the Play Trailer button
  nextTick(() => {
    if (playTrailerButtonRef.value) {
      playTrailerButtonRef.value.focus();
    }
  });
};

// Global keyboard event handler
const handleGlobalKeydown = (e) => {
  // Don't trigger shortcuts if user is typing in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return;
  }
  
  switch(e.key) {
    case 'Escape':
      if (isVideoOpen.value) {
        e.preventDefault();
        onVideoClose();
      }
      break;
  }
};

// Open watch provider (currently just opens TMDB, but can be customized)
const openWatchProvider = (provider) => {
    console.log('Opening watch provider:', provider);
    // You can customize this to link to the actual provider if TMDB provides URLs
    // For now, it opens TMDB with provider info
    window.open(`https://www.themoviedb.org/`, '_blank', 'noopener,noreferrer');
    screenReaderAnnouncement.value = `Opening ${provider.provider_name} in a new tab`;
};

// Handle image load errors
const handlePosterError = () => {
    posterImageError.value = true;
};

const handleBackdropError = () => {
    backdropImageError.value = true;
};

// Get poster URL with fallback
const getPosterUrl = computed(() => {
    if (posterImageError.value || !movie.value.poster_path) {
        // Return a better fallback - you can replace this with your actual placeholder
        return 'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=No+Poster+Available';
    }
    return `https://image.tmdb.org/t/p/w500${movie.value.poster_path}`;
});

// Get backdrop style with fallback
const getBackdropStyle = computed(() => {
    if (backdropImageError.value || !movie.value.backdrop_path) {
        return {
            backgroundColor: '#1a1a1a'
        };
    }
    return {
        backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.value.backdrop_path})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    };
});

async function getMovie(id){
    isLoadingMovie.value = true;
    movieError.value = null;
    movieNotFound.value = false;
    
    const url = `https://api.themoviedb.org/3/movie/${id}?append_to_response=release_dates,videos`;
    const options = {
        method: 'GET', 
        headers: {
            accept: 'application/json', 
            Authorization: 'Bearer ' + apiKey
        }
    };

    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            if (response.status === 404) {
                movieNotFound.value = true;
                throw new Error('Movie not found');
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Please check your configuration.');
            } else {
                throw new Error(`Failed to fetch movie details. Status: ${response.status}`);
            }
        }
        
        const json = await response.json();
        movie.value = json;
        console.log('Movie data:', json);
        // Announce movie title to screen readers
        screenReaderAnnouncement.value = `Movie loaded: ${json.title}`;
        
        // Update meta tags after movie data is loaded
        updateMetaTags();
    } catch (err) {
        movieError.value = err.message || 'Failed to load movie details. Please try again later.';
        console.error('Error fetching movie:', err);
    } finally {
        isLoadingMovie.value = false;
    }
}

async function getWatchProviders(id){
    isLoadingWatchProviders.value = true;
    watchProvidersError.value = null;
    
    const url = `https://api.themoviedb.org/3/movie/${id}/watch/providers`;
    const options = {
        method: 'GET', 
        headers: {
            accept: 'application/json', 
            Authorization: 'Bearer ' + apiKey
        }
    };

    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch watch providers. Status: ${response.status}`);
        }
        
        const json = await response.json();
        watchProviders.value = json;
    } catch (err) {
        watchProvidersError.value = err.message || 'Failed to load watch providers.';
        console.error('Error fetching watch providers:', err);
    } finally {
        isLoadingWatchProviders.value = false;
    }
}

async function getMovieCredits(id) {
    isLoadingCredits.value = true;
    creditsError.value = null;
    
    const url = `https://api.themoviedb.org/3/movie/${id}/credits`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer ' + apiKey
        }
    };
    
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch credits. Status: ${response.status}`);
        }
        
        const json = await response.json();
        credits.value = json;
        
        // Consolidate crew after credits are loaded
        if (credits.value && credits.value.crew && credits.value.crew.length > 0) {
            consolidatedCrew.value = consolidateCrew(credits.value.crew);
        }
        
        return json;
    } catch (error) {
        creditsError.value = 'Failed to load cast and crew information.';
        console.error('Error fetching credits:', error);
    } finally {
        isLoadingCredits.value = false;
    }
}

async function getLanguages(){
    isLoadingLanguages.value = true;
    languagesError.value = null;
    
    const url = `https://api.themoviedb.org/3/configuration/languages`;
    const options = {
        method: 'GET', 
        headers: {
            accept: 'application/json', 
            Authorization: 'Bearer ' + apiKey
        }
    };

    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch languages. Status: ${response.status}`);
        }
        
        const json = await response.json();
        languages.value = json;
    } catch (err) {
        languagesError.value = err.message || 'Failed to load language information.';
        console.error('Error fetching languages:', err);
    } finally {
        isLoadingLanguages.value = false;
    }
}

function getYear(dateString) {
    try {
        if (!dateString) return '';
        return dateString.split('-')[0];
    } catch (error) {
        console.error('Error parsing date:', error);
        return '';
    }
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

  return releaseWithCert?.certification || 'NR';
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
  
  const allowedJobs = ['Director', 'Screenplay'];
  
  return crew.reduce((acc, member) => {
    const { name, job } = member;
    
    // Only include allowed jobs
    if (!allowedJobs.includes(job)) {
      return acc;
    }
    
    if (!acc[name]) {
      acc[name] = [];
    }
    
    if (!acc[name].includes(job)) {
      acc[name].push(job);
    }
    
    return acc;
  }, {});
}

function getLanguageName(languageCode, languages) {
  if (!languageCode) return 'Unknown Language';
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

function getTrailerUrl(videos) {
  if (!videos || !Array.isArray(videos) || videos.length === 0) {
    return '';
  }
  
  const trailer = videos.find(video => 
    video.name.toLowerCase().includes('trailer') && 
    video.site === 'YouTube'
  );
  return trailer ? `https://www.youtube.com/embed/${trailer.key}` : '';
}

// Function to generate dynamic meta tags
function updateMetaTags() {
    if (!movie.value || !movie.value.title) return;
    
    const title = `${movie.value.title} (${getYear(movie.value.release_date)})`;
    const description = movie.value.overview 
        ? movie.value.overview.substring(0, 160) 
        : `Watch ${movie.value.title} - ${movie.value.tagline || 'Movie details, cast, and information'}`;
    
    // Generate genre text for meta
    const genreText = movie.value.genres?.map(g => g.name).join(', ') || '';
    const fullDescription = genreText 
        ? `${genreText}. ${description}`
        : description;
    
    // Get current URL
    const currentUrl = typeof window !== 'undefined' 
        ? window.location.href
        : '';
    
    // Use backdrop or poster for OG image
    const ogImage = movie.value.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.value.backdrop_path}`
        : movie.value.poster_path
        ? `https://image.tmdb.org/t/p/w780${movie.value.poster_path}`
        : '';
    
    useHead({
        title: title,
        meta: [
            // Standard meta tags
            { name: 'description', content: fullDescription },
            { name: 'robots', content: 'index, follow' },
            { name: 'keywords', content: `${movie.value.title}, ${genreText}, movie, ${getYear(movie.value.release_date)}` },
            
            // Open Graph meta tags
            { property: 'og:type', content: 'video.movie' },
            { property: 'og:title', content: title },
            { property: 'og:description', content: fullDescription },
            { property: 'og:url', content: currentUrl },
            { property: 'og:image', content: ogImage },
            { property: 'og:image:width', content: '1280' },
            { property: 'og:image:height', content: '720' },
            { property: 'og:image:alt', content: `${movie.value.title} poster` },
            { property: 'og:site_name', content: 'Discover Movies' },
            
            // Movie specific OG tags
            ...(movie.value.release_date ? [{ property: 'og:video:release_date', content: movie.value.release_date }] : []),
            ...(movie.value.runtime ? [{ property: 'og:video:duration', content: (movie.value.runtime * 60).toString() }] : []),
            
            // Twitter Card meta tags
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: title },
            { name: 'twitter:description', content: fullDescription },
            { name: 'twitter:image', content: ogImage },
            { name: 'twitter:image:alt', content: `${movie.value.title} poster` },
        ],
        link: [
            { rel: 'canonical', href: currentUrl }
        ]
    });
}

// Retry function for failed requests
function retryFailedRequest(type) {
    const id = route.params.id;
    
    switch(type) {
        case 'movie':
            getMovie(id);
            break;
        case 'credits':
            getMovieCredits(id);
            break;
        case 'languages':
            getLanguages();
            break;
        case 'watchProviders':
            getWatchProviders(id);
            break;
    }
}

// Validate movie ID
function isValidMovieId(id) {
    // TMDB movie IDs are positive integers
    return /^\d+$/.test(id) && parseInt(id) > 0;
}

// Back to top functionality
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

// Show/hide back to top button based on scroll position
const handleScroll = () => {
    showBackToTop.value = window.scrollY > 300;
};

onMounted(async () => {
    const id = route.params.id;
    
    // Validate movie ID
    if (!isValidMovieId(id)) {
        movieNotFound.value = true;
        movieError.value = 'Invalid movie ID';
        isLoadingMovie.value = false;
        return;
    }
    
    // Fetch all data in parallel for better performance
    await Promise.all([
        getMovie(id),
        getMovieCredits(id),
        getLanguages(),
        getWatchProviders(id)
    ]);
    
    // Add scroll listener for back to top button
    if (typeof window !== 'undefined') {
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('keydown', handleGlobalKeydown);
    }
});

onUnmounted(() => {
    // Clean up event listeners
    if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('keydown', handleGlobalKeydown);
    }
});
</script>

<template>

    <!-- Skip Navigation Link -->
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <!-- ARIA Live Region for screen reader announcements -->
    <div aria-live="polite" aria-atomic="true" class="visually-hidden">
        {{ screenReaderAnnouncement }}
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingMovie" class="d-flex justify-content-center align-items-center" style="min-height: 70vh;">
        <div class="text-center">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Loading movie details...</span>
            </div>
            <p class="text-light mt-3">Loading movie details...</p>
        </div>
    </div>

    <!-- 404 / Movie Not Found -->
    <div v-else-if="movieNotFound" class="d-flex justify-content-center align-items-center flex-column" style="min-height: 70vh;">
        <div class="text-center text-light">
            <h1 class="display-1">404</h1>
            <h2>Movie Not Found</h2>
            <p class="mt-3">The movie you're looking for doesn't exist or has been removed.</p>
            <button @click="router.push('/')" class="btn btn-primary mt-3">
                Back to Home
            </button>
        </div>
    </div>

    <!-- Error State -->
    <div v-else-if="movieError" class="container mt-5">
        <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">Error Loading Movie</h4>
            <p>{{ movieError }}</p>
            <hr>
            <button class="btn btn-outline-danger" @click="retryFailedRequest('movie')">
                Retry
            </button>
            <button @click="router.push('/')" class="btn btn-outline-secondary ms-2">
                Back to Home
            </button>
        </div>
    </div>

    <!-- Movie Content -->
    <main v-else id="main-content" tabindex="-1">
        <!-- Hidden image for backdrop error detection -->
        <img 
            v-if="movie.backdrop_path && !backdropImageError"
            :src="`https://image.tmdb.org/t/p/original${movie.backdrop_path}`"
            @error="handleBackdropError"
            style="display: none;"
            aria-hidden="true"
            loading="lazy"
        >
        
        <section 
        aria-label="Movie information"
        class="d-flex p-5 movie-backdrop"
        :style="getBackdropStyle"
        role="banner"
        >

            <div class="card col-4">
                <div
                class="blur-load"
                :class="posterLoaded ? 'loaded' : ''"
                >
                    <img  
                        :src="getPosterUrl"
                        :alt="`${movie.title} movie poster`"
                        loading="lazy"
                        @error="handlePosterError"
                        @load="posterLoaded = true"
                    >
                </div>
            </div>

            <div class="col-8 ms-4 text-light">

                <div>
                    <h1 class="h2">
                        <span class="fw-bold">{{ movie.title }}</span>
                        <span class="text-light ms-2">{{ getYear(movie.release_date) ? `(${getYear(movie.release_date)})` : '' }}</span>
                    </h1>

                    <div class="movie-facts">
                        <span v-if="findCertification(movie)" class="border border-light p-1" aria-label="Movie rating">
                            {{ findCertification(movie) }}
                        </span>
                        <span v-if="movie.release_date" class="ms-2">
                            {{ movie.release_date }} 
                            <span v-if="movie.origin_country && movie.origin_country[0]">({{ movie.origin_country[0] }})</span>
                        </span>
                        <span v-if="movie.genres && movie.genres.length > 0" class="ms-2 facts-separator">
                            <span v-for="(genre, index) in movie.genres" :key="genre.id">
                                {{ genre.name }}{{ movie.genres.length > 1 && index != movie.genres.length - 1 ? ', ' : '' }} 
                            </span>
                        </span>
                        <span v-if="movie.runtime" class="ms-2 facts-separator">
                            {{ convertMinutesToHoursAndMinutes(movie.runtime) }}
                        </span>
                    </div>

                </div>

                <div class="mt-4 d-flex align-items-center flex-wrap gap-5">
                    <div class="d-flex flex-column">
                        <rating-circle
                        v-if="movie.vote_count"
                        :rating="Math.trunc(movie.vote_average * 10)"
                        aria-label="User rating"
                        />
                        <span class="small text-light mt-1 text-center"
                        v-if="movie.vote_count"
                        >
                            User Score
                        </span>
                        <span class="text-muted" style="font-size: 0.75rem; text-align: center;">
                            {{ movie.vote_count.toLocaleString() }} votes
                        </span>
                    </div>
                   
                    <div 
                    v-if="movie.videos && movie.videos.results && movie.videos.results.length > 0"
                    class="align-self-center">
                        <button
                        ref="playTrailerButtonRef"
                        @click="openVideo"
                        class="btn btn-primary d-flex align-items-center gap-2"
                        aria-label="Play movie trailer. Press Escape to close when open.">
                        <Icon class="fs-2" name="mdi:play" aria-hidden="true" />
                        Play Trailer
                        </button>
                        <video-player
                          v-model="isVideoOpen"
                          :url="getTrailerUrl(movie.videos.results)"
                          @close="onVideoClose"
                        />
                    </div>
                  
                </div>

                <p v-if="movie.tagline" class="mt-4 fst-italic">"{{ movie.tagline }}"</p>
                
                <div class="mt-4">
                    <h2 class="h5">Overview</h2>
                    <p v-if="movie.overview">{{ movie.overview }}</p>
                    <p v-else class="text-muted fst-italic">No overview available for this movie.</p>
                </div>

                <!-- Credits Error -->
                <div v-if="creditsError" class="alert alert-warning mt-3" role="alert">
                    {{ creditsError }}
                    <button class="btn btn-sm btn-outline-warning ms-2" @click="retryFailedRequest('credits')">
                        Retry
                    </button>
                </div>

                <!-- Crew -->
                <div v-else-if="Object.keys(consolidatedCrew).length > 0" class="d-flex flex-wrap mt-3">
                    <div 
                    v-for="(departments, name) in consolidatedCrew" :key="name"
                    class="me-5 mb-3">
                        <p class="fw-bold mb-0">{{ name }}</p>
                        <p class="small text-muted">{{ departments.join(', ') }}</p>
                    </div>
                </div>
                
                <!-- No crew available -->
                <div v-else-if="!isLoadingCredits" class="mt-3">
                    <p class="small text-muted fst-italic">Director and screenplay information not available.</p>
                </div>
            </div>

        </section>

        <div
        class="px-5 d-flex mt-5"
        >
            <article class="col-9">
                <h2 class="h4 text-light mb-4">Cast</h2>
                
                <!-- Cast Loading State -->
                <div v-if="isLoadingCredits" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading cast...</span>
                    </div>
                    <p class="text-light mt-2">Loading cast information...</p>
                </div>
                
                <!-- Cast Component -->
                <cast
                v-else-if="!creditsError && credits.cast && credits.cast.length > 0"
                :cast="credits.cast"
                ></cast>
                
                <!-- No Cast Available -->
                <div v-else-if="!creditsError" class="text-light">
                    <p class="text-muted fst-italic">Cast information is not available for this movie.</p>
                </div>
                
                <!-- Cast Error (already shown above, but can add note here too) -->
                <div v-else class="text-light">
                    <p class="text-muted fst-italic">Unable to load cast information. Please try again.</p>
                </div>
            </article>

            <aside class="text-light col-3 ms-5">
                <!-- Languages Error -->
                <div v-if="languagesError" class="alert alert-warning" role="alert">
                    <small>{{ languagesError }}</small>
                </div>

                <div>
                    <p class="mb-0 fw-bold">Status</p>
                    <p>{{ movie.status || 'Unknown' }}</p>
                </div>
                <div v-if="!isLoadingLanguages">
                    <p class="mb-0 fw-bold">Original Language</p>
                    <p>{{ getLanguageName(movie.original_language, languages) }}</p>
                </div>
                <div v-if="movie.budget && movie.budget > 0" >
                    <p class="mb-0 fw-bold">Budget</p>
                    <p>{{ formatPrice(movie.budget) }}</p>
                </div>
                <div v-if="movie.revenue && movie.revenue > 0" >
                    <p class="mb-0 fw-bold">Revenue</p>
                    <p>{{ formatPrice(movie.revenue) }}</p>
                </div>
                
                <!-- Watch Providers Section -->
                <div v-if="!isLoadingWatchProviders && !watchProvidersError && watchProviders.results && watchProviders.results.US" class="mt-4">
                    <p class="mb-2 fw-bold">Where to Watch (US)</p>
                    
                    <!-- Streaming -->
                    <div v-if="watchProviders.results.US.flatrate && watchProviders.results.US.flatrate.length > 0" class="mb-3">
                        <p class="mb-1 small text-muted">Stream</p>
                        <div class="d-flex flex-wrap gap-2" role="list">
                            <button
                                v-for="provider in watchProviders.results.US.flatrate.slice(0, 4)" 
                                :key="provider.provider_id"
                                class="watch-provider-btn"
                                :aria-label="`Stream on ${provider.provider_name}`"
                                :title="provider.provider_name"
                                @click="openWatchProvider(provider)"
                                role="listitem"
                            >
                                <img 
                                    :src="`https://image.tmdb.org/t/p/w92${provider.logo_path}`"
                                    :alt="`${provider.provider_name} logo`"
                                    class="watch-provider-logo"
                                    loading="lazy"
                                >
                            </button>
                        </div>
                    </div>
                    
                    <!-- Rent -->
                    <div v-if="watchProviders.results.US.rent && watchProviders.results.US.rent.length > 0" class="mb-3">
                        <p class="mb-1 small text-muted">Rent</p>
                        <div class="d-flex flex-wrap gap-2" role="list">
                            <button
                                v-for="provider in watchProviders.results.US.rent.slice(0, 4)" 
                                :key="provider.provider_id"
                                class="watch-provider-btn"
                                :aria-label="`Rent on ${provider.provider_name}`"
                                :title="provider.provider_name"
                                @click="openWatchProvider(provider)"
                                role="listitem"
                            >
                                <img 
                                    :src="`https://image.tmdb.org/t/p/w92${provider.logo_path}`"
                                    :alt="`${provider.provider_name} logo`"
                                    class="watch-provider-logo"
                                    loading="lazy"
                                >
                            </button>
                        </div>
                    </div>
                    
                    <!-- Buy -->
                    <div v-if="watchProviders.results.US.buy && watchProviders.results.US.buy.length > 0">
                        <p class="mb-1 small text-muted">Buy</p>
                        <div class="d-flex flex-wrap gap-2" role="list">
                            <button
                                v-for="provider in watchProviders.results.US.buy.slice(0, 4)" 
                                :key="provider.provider_id"
                                class="watch-provider-btn"
                                :aria-label="`Buy on ${provider.provider_name}`"
                                :title="provider.provider_name"
                                @click="openWatchProvider(provider)"
                                role="listitem"
                            >
                                <img 
                                    :src="`https://image.tmdb.org/t/p/w92${provider.logo_path}`"
                                    :alt="`${provider.provider_name} logo`"
                                    class="watch-provider-logo"
                                    loading="lazy"
                                >
                            </button>
                        </div>
                    </div>
                    
                    <p class="small text-muted mt-2">
                        <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" class="text-muted">
                            Powered by TMDB
                        </a>
                    </p>
                </div>
                
                <!-- Watch Providers Loading -->
                <div v-else-if="isLoadingWatchProviders" class="mt-4">
                    <p class="mb-0 fw-bold">Where to Watch</p>
                    <div class="spinner-border spinner-border-sm text-light mt-2" role="status">
                        <span class="visually-hidden">Loading watch providers...</span>
                    </div>
                </div>
                
                <!-- Watch Providers Error -->
                <div v-else-if="watchProvidersError" class="mt-4">
                    <p class="mb-0 fw-bold">Where to Watch</p>
                    <p class="small text-muted">Unable to load watch providers</p>
                </div>
            </aside>
        </div>
        
        <!-- Back to Top Button -->
        <transition name="fade">
            <button 
                v-show="showBackToTop"
                @click="scrollToTop"
                class="back-to-top-btn"
                aria-label="Back to top"
                title="Back to top"
            >
                <Icon name="mdi:arrow-up" class="fs-4" />
            </button>
        </transition>
    </main>

</template>

<style scoped>

/* Skip Navigation Link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 1100;
  border-radius: 0 0 4px 0;
  font-weight: 600;
  transition: top 0.2s ease;
}

.skip-link:focus {
  top: 0;
  outline: 3px solid #0d6efd;
  outline-offset: 2px;
}

.facts-separator::before {
    content: "|";
    margin: 0 8px;
    color: #ffffff;
}
.movie-backdrop {
  position: relative;
  min-height: 400px;
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

/* Focus indicators for accessibility */
button:focus-visible {
  outline: 3px solid #0d6efd;
  outline-offset: 2px;
}

a:focus-visible {
  outline: 3px solid #0d6efd;
  outline-offset: 2px;
  border-radius: 4px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  button:focus-visible,
  a:focus-visible,
  .watch-provider-btn:focus-visible {
    outline-width: 4px;
    outline-color: currentColor;
  }
  
  .skip-link:focus {
    outline-width: 4px;
  }
}

/* Improved loading state styling */
.spinner-border {
  animation: spinner-border 0.75s linear infinite;
}

/* Watch provider logos */
.watch-provider-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  pointer-events: none; /* Prevent image from being clicked, only button */
}

/* Watch provider buttons */
.watch-provider-btn {
  background: none;
  border: 2px solid transparent;
  padding: 0;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: inline-block;
}

.watch-provider-btn:hover {
  border-color: #0d6efd;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.watch-provider-btn:focus-visible {
  outline: 3px solid #0d6efd;
  outline-offset: 3px;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.watch-provider-btn:active {
  transform: scale(1.05);
}

.watch-provider-logo:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .movie-backdrop {
    flex-direction: column;
  }
  
  .movie-backdrop .card {
    width: 100%;
    margin-bottom: 1rem;
  }
  
  .movie-backdrop .col-8 {
    width: 100%;
    margin-left: 0 !important;
  }
}

/* Back to top button */
.back-to-top-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #0d6efd;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
  z-index: 1000;
}

.back-to-top-btn:hover {
  background-color: #0b5ed7;
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
}

.back-to-top-btn:active {
  transform: translateY(-2px);
}

.back-to-top-btn:focus-visible {
  outline: 3px solid #ffffff;
  outline-offset: 2px;
}

/* Fade transition for back-to-top button */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
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