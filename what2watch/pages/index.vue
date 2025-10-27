<script setup>
import { ref, onMounted, watch } from 'vue'

const route = useRoute();
const router = useRouter();

const genres = ref([]);
const languages = ref([]);
const dropdowns = ref({
    genre: {activeItem: null,values: [], options: {}},
    rating: {activeItem: null, values: [], options: {}},
    year: {activeItem: null, values: [], options: {}},
    language: {activeItem: null, values: [], options: {underlineFirstItem: true}},
    sort: {activeItem: null,  values: [
    "Popularity Ascending",
    "Popularity Descending",
    "Revenue Ascending",
    "Revenue Descending",
    "Release Date Ascending",
    "Release Date Descending",
    "Rating Ascending",
    "Rating Descending",
    "Vote Count Ascending",
    "Vote Count Descending",
    "Title (A-Z)",
    "Title (Z-A)"
    ],options: {}}
});
const sortOptions = [
  {
    name: "Popularity Ascending",
    value: "popularity.asc"
  },
  {
    name: "Popularity Descending",
    value: "popularity.desc"
  },
  {
    name: "Revenue Ascending",
    value: "revenue.asc"
  },
  {
    name: "Revenue Descending",
    value: "revenue.desc"
  },
  {
    name: "Release Date Ascending",
    value: "primary_release_date.asc"
  },
  {
    name: "Release Date Descending",
    value: "primary_release_date.desc"
  },
  {
    name: "Rating Ascending",
    value: "vote_average.asc"
  },
  {
    name: "Rating Descending",
    value: "vote_average.desc"
  },
  {
    name: "Vote Count Ascending",
    value: "vote_count.asc"
  },
  {
    name: "Vote Count Descending",
    value: "vote_count.desc"
  },
  {
    name: "Title (A-Z)",
    value: "original_title.asc"
  },
  {
    name: "Title (Z-A)",
    value: "original_title.desc"
  }
];

const moviesLoaded = ref(false);
const movies = ref([]);
const totalPages = ref(0);
const currentPage = ref(1);

// Loading and error states
const isLoadingMovies = ref(false);
const isLoadingGenres = ref(false);
const isLoadingLanguages = ref(false);
const errorMessage = ref(null);
const genresError = ref(null);
const languagesError = ref(null);

const apiKey = useRuntimeConfig().public.apiKey


onMounted(() => {
    // Get genres
    getMovieGenres();

    // Populate rating
    for(let i=0; i<=9; i++){
        if(i < 9){
            dropdowns.value.rating.values.push(i+1+'+');
        } else {
            dropdowns.value.rating.values.push('10');
        }
    }

    // Calculate years
    calcYears();

    // Get languages
    getLanguages();
});

// Watch totalPages to ensure currentPage doesn't exceed it
watch(totalPages, (newTotal) => {
    if (newTotal > 0 && currentPage.value > newTotal) {
        currentPage.value = newTotal;
    }
});

watch(genres, (genres) => {
    genres.forEach((genre)=>{
        dropdowns.value.genre.values.push(genre.name);
    });
    
    // After genres are loaded, restore from URL
    restoreFromURL();
});

watch(languages, (language) => {
    dropdowns.value.language.values.push('English');
    language.forEach((language)=>{
        if(language.english_name != 'English'){
            dropdowns.value.language.values.push(language.english_name);
        }
    });
    
    // After languages are loaded, restore from URL
    restoreFromURL();
});

watch(currentPage, (newPage, oldPage) => {
    // Bounds checking for pagination
    if (newPage < 1) {
        currentPage.value = 1;
        return;
    }
    
    // If we have totalPages loaded and newPage exceeds it, cap at totalPages
    if (totalPages.value > 0 && newPage > totalPages.value) {
        currentPage.value = totalPages.value;
        return;
    }
    
    // TMDB API has a max limit of 500 pages
    if (newPage > 500) {
        currentPage.value = 500;
        return;
    }
    
    updateURL();
    getMovies();
});

// Watch for changes in dropdown selections
watch(() => dropdowns.value.genre.activeItem, () => {
    currentPage.value = 1; // Reset to page 1 when filters change
    updateURL();
    getMovies();
});

watch(() => dropdowns.value.rating.activeItem, () => {
    currentPage.value = 1;
    updateURL();
    getMovies();
});

watch(() => dropdowns.value.year.activeItem, () => {
    currentPage.value = 1;
    updateURL();
    getMovies();
});

watch(() => dropdowns.value.language.activeItem, () => {
    currentPage.value = 1;
    updateURL();
    getMovies();
});

watch(() => dropdowns.value.sort.activeItem, () => {
    currentPage.value = 1;
    updateURL();
    getMovies();
});

// Function to update URL with current filter state
function updateURL() {
    const query = {
        page: currentPage.value.toString()
    };
    
    if (dropdowns.value.genre.activeItem) {
        query.genre = dropdowns.value.genre.activeItem;
    }
    
    if (dropdowns.value.rating.activeItem) {
        query.rating = dropdowns.value.rating.activeItem;
    }
    
    if (dropdowns.value.year.activeItem) {
        query.year = dropdowns.value.year.activeItem;
    }
    
    if (dropdowns.value.language.activeItem) {
        query.language = dropdowns.value.language.activeItem;
    }
    
    if (dropdowns.value.sort.activeItem) {
        query.sort = dropdowns.value.sort.activeItem;
    }
    
    // Update URL without reloading the page
    router.push({ query });
}

// Function to restore state from URL
function restoreFromURL() {
    // Only restore if data is loaded
    if (genres.value.length === 0 || languages.value.length === 0) {
        return;
    }
    
    const query = route.query;
    
    // Restore page with validation
    if (query.page) {
        let pageNum = parseInt(query.page);
        
        // Validate page number
        if (isNaN(pageNum) || pageNum < 1) {
            pageNum = 1;
        } else if (pageNum > 500) {
            // TMDB API max limit
            pageNum = 500;
        }
        
        currentPage.value = pageNum;
    }
    
    // Restore genre
    if (query.genre && dropdowns.value.genre.values.includes(query.genre)) {
        dropdowns.value.genre.activeItem = query.genre;
    }
    
    // Restore rating
    if (query.rating && dropdowns.value.rating.values.includes(query.rating)) {
        dropdowns.value.rating.activeItem = query.rating;
    }
    
    // Restore year
    if (query.year && dropdowns.value.year.values.includes(query.year)) {
        dropdowns.value.year.activeItem = query.year;
    }
    
    // Restore language
    if (query.language && dropdowns.value.language.values.includes(query.language)) {
        dropdowns.value.language.activeItem = query.language;
    }
    
    // Restore sort
    if (query.sort && dropdowns.value.sort.values.includes(query.sort)) {
        dropdowns.value.sort.activeItem = query.sort;
    }
    
    // Fetch movies with restored filters
    if (Object.keys(query).length > 0) {
        getMovies();
    }
}

async function getMovieGenres() {
    isLoadingGenres.value = true;
    genresError.value = null;
    
    const url = 'https://api.themoviedb.org/3/genre/movie/list?language=en';
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
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your configuration.');
            } else if (response.status === 404) {
                throw new Error('Genres endpoint not found.');
            } else {
                throw new Error(`Failed to fetch genres. Status: ${response.status}`);
            }
        }
        
        const json = await response.json();
        genres.value = json.genres;
    } catch (err) {
        genresError.value = err.message || 'Failed to load movie genres. Please try again later.';
        console.error('Error fetching genres:', err);
    } finally {
        isLoadingGenres.value = false;
    }
}

async function getLanguages() {
    isLoadingLanguages.value = true;
    languagesError.value = null;
    
    const url = 'https://api.themoviedb.org/3/configuration/languages';
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
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your configuration.');
            } else if (response.status === 404) {
                throw new Error('Languages endpoint not found.');
            } else {
                throw new Error(`Failed to fetch languages. Status: ${response.status}`);
            }
        }
        
        const json = await response.json();
        languages.value = json;
    } catch (err) {
        languagesError.value = err.message || 'Failed to load languages. Please try again later.';
        console.error('Error fetching languages:', err);
    } finally {
        isLoadingLanguages.value = false;
    }
}

function calcYears(){
    // Get year ranges
    const currentYear = parseInt(new Date().getFullYear());

    // Push first year range
    dropdowns.value.year.values.push('All');
    dropdowns.value.year.values.push('<1950' );

    for(let i = 1950; i <= currentYear; i = i + 10) {
        dropdowns.value.year.values.push( i.toString() + '-' + (i + 9).toString() );
    }

    dropdowns.value.year.values.push( 'Latest' );
}

async function getMovies(){
    isLoadingMovies.value = true;
    errorMessage.value = null;
    console.log('Fetching movies with current filters...');
    console.log({dropdowns: dropdowns.value, currentPage: currentPage.value});
    try {
        // Calc url
        let url = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false?';

        // Page
        url+= '&page=' + currentPage.value;

        // Genre
        if(dropdowns.value.genre.activeItem != null){
            const genre = genres.value.find((element) => element.name ===  dropdowns.value.genre.activeItem);
            if (genre) {
                const genreURLAppend = genre.id;
                url+='&with_genres=' + genreURLAppend;
            }
        }

        // Rating
        if(dropdowns.value.rating.activeItem != null){
            const ratingURLAppend = dropdowns.value.rating.activeItem.includes('+') ? dropdowns.value.rating.activeItem.replace('+', '') : dropdowns.value.rating.activeItem
            url+='&vote_average.gte=' + ratingURLAppend
        }

        // Year
        if(dropdowns.value.year.activeItem != null){
            let yearURLAppend = '';

            if(dropdowns.value.year.activeItem.includes('<1950')){
                yearURLAppend = '&release_date.lte=1950-12-31'
            } else {
                yearURLAppend ='&primary_release_date.gte=' + dropdowns.value.year.activeItem.substring(0, dropdowns.value.year.activeItem.search('-')) + '-01-31';
                yearURLAppend +='&primary_release_date.lte=' + dropdowns.value.year.activeItem.substring(dropdowns.value.year.activeItem.search('-') + 1) + '-12-31';
            }
            url += yearURLAppend;
        }

        // Language
        if(dropdowns.value.language.activeItem != null){
            const language = languages.value.find((element) => element.english_name ===  dropdowns.value.language.activeItem);
            if (language) {
                const languageURLAppend = language.iso_639_1;
                url+='&with_original_language=' + languageURLAppend;
            }
        }

        // Sorting
        if(dropdowns.value.sort.activeItem != null){
            const sortBy = sortOptions.find((element) => element.name ===  dropdowns.value.sort.activeItem);
            if (sortBy) {
                const sortURLAppend = sortBy.value;
                url+='&sort_by=' + sortURLAppend;
            }
        }

        const options = {
            method: 'GET', 
            headers: {
                accept: 'application/json', 
                Authorization: 'Bearer ' + apiKey
            }
        };

        const response = await fetch(url, options);
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your configuration.');
            } else if (response.status === 422) {
                throw new Error('Invalid search parameters. Please adjust your filters and try again.');
            } else if (response.status === 429) {
                throw new Error('Too many requests. Please wait a moment and try again.');
            } else if (response.status === 404) {
                throw new Error('Movies endpoint not found.');
            } else {
                throw new Error(`Failed to fetch movies. Status: ${response.status}`);
            }
        }
        
        const json = await response.json();
        movies.value = json.results || [];
        totalPages.value = json.total_pages || 0;
        moviesLoaded.value = true;
    } catch (err) {
        errorMessage.value = err.message || 'Failed to load movies. Please check your connection and try again.';
        console.error('Error fetching movies:', err);
        movies.value = [];
        totalPages.value = 0;
    } finally {
        isLoadingMovies.value = false;
    }
}

// Function to handle dropdown selection
function handleDropdownSelect(key, item) {
    dropdowns.value[key].activeItem = item;
    // The watchers will handle the rest (updating URL and fetching movies)
}

// Function to retry failed requests
function retryFailedRequest(type) {
    if (type === 'genres') {
        getMovieGenres();
    } else if (type === 'languages') {
        getLanguages();
    } else if (type === 'movies') {
        getMovies();
    }
}

// Function to reset all filters
function resetFilters() {
    dropdowns.value.genre.activeItem = null;
    dropdowns.value.rating.activeItem = null;
    dropdowns.value.year.activeItem = null;
    dropdowns.value.language.activeItem = null;
    dropdowns.value.sort.activeItem = null;
    currentPage.value = 1;
    
    // Clear URL parameters
    router.push({ query: {} });
    
    // Reset movies display
    movies.value = [];
    moviesLoaded.value = false;
    errorMessage.value = null;
}

</script>

<template>
  
    <section
    class="d-flex flex-column min-vh-100"
    >

        <!--content-->
        <div>
            <!-- Error alerts for initial data loading -->
            <div v-if="genresError || languagesError" class="container mt-4">
                <div v-if="genresError" class="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Error loading genres:</strong> {{ genresError }}
                    <button type="button" class="btn btn-sm btn-outline-danger ms-3" @click="retryFailedRequest('genres')">
                        Retry
                    </button>
                    <button type="button" class="btn-close" @click="genresError = null" aria-label="Close"></button>
                </div>
                <div v-if="languagesError" class="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Error loading languages:</strong> {{ languagesError }}
                    <button type="button" class="btn btn-sm btn-outline-danger ms-3" @click="retryFailedRequest('languages')">
                        Retry
                    </button>
                    <button type="button" class="btn-close" @click="languagesError = null" aria-label="Close"></button>
                </div>
            </div>

            <form>

                <!--dropdowns-->
                <div class="d-flex justify-content-center align-items-center my-5 flex-wrap gap-2">

                    <div v-for="(values, key) in dropdowns" :key="key" class="dropdown">
                        <button 
                        class="btn btn-primary dropdown-toggle" 
                        type="button" 
                        :id="`dropdownMenu${key.charAt(0).toUpperCase() + key.slice(1)}Btn`" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                        :disabled="(key === 'genre' && isLoadingGenres) || (key === 'language' && isLoadingLanguages)"
                        >
                        {{ values.activeItem === null ? key.charAt(0).toUpperCase() + key.slice(1) : values.activeItem }}
                        </button>
                        <ul 
                        class="dropdown-menu" 
                        :aria-labelledby="`dropdownMenu${key.charAt(0).toUpperCase() + key.slice(1)}Btn`"
                        >
                           
                            <li 
                            v-for="(item, index) in values.values" 
                            :key="item" 
                            class="dropdown-item"
                            :class="index === 0 && values.options.underlineFirstItem ? 'border-info border-bottom' : ''"
                            @click="handleDropdownSelect(key, values.values[index])"
  
                            >
                                {{ item }}

                            
                            </li>
                        </ul>

                
                    </div>

                    <!-- Reset Filters Button -->
                    <button 
                        type="button" 
                        class="btn btn-outline-secondary"
                        @click="resetFilters"
                        :disabled="isLoadingMovies || isLoadingGenres || isLoadingLanguages"
                        v-show="dropdowns.genre.activeItem || dropdowns.rating.activeItem || dropdowns.year.activeItem || dropdowns.language.activeItem || dropdowns.sort.activeItem"
                    >
                        <span class="me-1">Reset Filters</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                        </svg>
                    </button>

                </div>

            </form>

            <!-- Error message for movies -->
            <div v-if="errorMessage" class="container">
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Error:</strong> {{ errorMessage }}
                    <button type="button" class="btn btn-sm btn-outline-danger ms-3" @click="retryFailedRequest('movies')">
                        Retry
                    </button>
                    <button type="button" class="btn-close" @click="errorMessage = null" aria-label="Close"></button>
                </div>
            </div>

            <!-- Loading spinner -->
            <div v-if="isLoadingMovies" class="d-flex justify-content-center my-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading movies...</span>
                </div>
            </div>

            <!--results-->
            <div
            v-show="movies.length > 0 && !isLoadingMovies"
            >
                <MovieGrid
                :movies="movies"
                :genres="genres"
                />
                
                <!--pagination-->
                <div class="d-flex justify-content-center my-5">
                    <Paginator
                    :total-pages = totalPages
                    v-model="currentPage" 
                    />
                </div>
            </div>
            <div
            class="justify-content-center mt-5"
            :class="movies.length === 0 && moviesLoaded && !isLoadingMovies && !errorMessage ? 'd-flex' : 'd-none'"
            >
                <p>No movies found, please refine your search parameters...</p>
            </div>
            <div
            class="justify-content-center mt-5"
            :class="!moviesLoaded && !isLoadingMovies && !errorMessage ? 'd-flex' : 'd-none'"
            >
                <p>Select your filters above to discover movies!</p>
            </div>
        </div>
        <!--content end-->



    </section>

</template>


<style scoped>

    .dropdown-menu{
        max-height: 300px;
        overflow-y: scroll;
    }

    .dropdown-item{
        cursor: pointer;
    }

</style>