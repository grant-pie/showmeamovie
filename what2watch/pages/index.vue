<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

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

// Debounce timer for filter changes
const filterDebounceTimer = ref(null);

// Flag to track if initial restoration from URL has been completed
const hasRestoredFromURL = ref(false);

// Flag to suppress filter watchers during restoration
const isRestoringFromURL = ref(false);

// Ref for announcing changes to screen readers
const screenReaderAnnouncement = ref('');

// Back to top button
const showBackToTop = ref(false);

// Refs for keyboard navigation and focus management
const focusedDropdownKey = ref(null);
const focusedItemIndex = ref(-1);

const apiKey = useRuntimeConfig().public.apiKey

// Function to generate SEO-friendly meta title based on active filters
function generateMetaTitle() {
    const filters = [];
    
    if (dropdowns.value.genre.activeItem) {
        filters.push(dropdowns.value.genre.activeItem);
    }
    if (dropdowns.value.rating.activeItem) {
        filters.push(`${dropdowns.value.rating.activeItem} rated`);
    }
    if (dropdowns.value.year.activeItem && dropdowns.value.year.activeItem !== 'All') {
        filters.push(dropdowns.value.year.activeItem);
    }
    if (dropdowns.value.language.activeItem && dropdowns.value.language.activeItem !== 'English') {
        filters.push(dropdowns.value.language.activeItem);
    }
    
    if (filters.length === 0) {
        return 'Discover Movies - Browse and Filter Movies';
    }
    
    const filterText = filters.join(' ');
    return `${filterText} Movies - Page ${currentPage.value}`;
}

// Function to generate SEO-friendly meta description based on active filters
function generateMetaDescription() {
    const filters = [];
    let description = 'Browse and discover ';
    
    if (dropdowns.value.genre.activeItem) {
        filters.push(dropdowns.value.genre.activeItem.toLowerCase());
    }
    if (dropdowns.value.rating.activeItem) {
        filters.push(`${dropdowns.value.rating.activeItem} rated`);
    }
    if (dropdowns.value.year.activeItem && dropdowns.value.year.activeItem !== 'All') {
        filters.push(`from ${dropdowns.value.year.activeItem}`);
    }
    if (dropdowns.value.language.activeItem && dropdowns.value.language.activeItem !== 'English') {
        filters.push(`in ${dropdowns.value.language.activeItem}`);
    }
    
    if (filters.length === 0) {
        description += 'thousands of movies. Filter by genre, rating, year, language, and more. Find your next favorite film.';
    } else {
        description += filters.join(' ') + ' movies. ';
        if (moviesLoaded.value && movies.value.length > 0) {
            description += `Showing page ${currentPage.value} of ${totalPages.value} results.`;
        } else {
            description += 'Use our advanced filters to find the perfect movie.';
        }
    }
    
    return description;
}

// Function to update meta tags
function updateMetaTags() {
    const title = generateMetaTitle();
    const description = generateMetaDescription();
    
    useHead({
        title: title,
        meta: [
            { name: 'description', content: description },
            { name: 'robots', content: 'index, follow' },
            // Canonical URL based on current filters
            { 
                tagName: 'link',
                rel: 'canonical',
                href: `${window.location.origin}${window.location.pathname}${window.location.search}`
            }
        ]
    });
}


// Watch for changes that should update meta tags
watch([
    () => dropdowns.value.genre.activeItem,
    () => dropdowns.value.rating.activeItem,
    () => dropdowns.value.year.activeItem,
    () => dropdowns.value.language.activeItem,
    () => dropdowns.value.sort.activeItem,
    currentPage,
    moviesLoaded
], () => {
    updateMetaTags();
});

// Watch totalPages to ensure currentPage doesn't exceed it
watch(totalPages, (newTotal) => {

    if (newTotal > 0 && currentPage.value > newTotal) {
        currentPage.value = newTotal;
    }
});


// Debounced function to handle filter changes
// This prevents multiple rapid API calls when filters change
function debouncedFilterChange(resetPage = true) {
    // Clear existing timer
    if (filterDebounceTimer.value) {
        clearTimeout(filterDebounceTimer.value);
    }
    
    // Set new timer
    filterDebounceTimer.value = setTimeout(() => {
        if (resetPage) {
            currentPage.value = 1;
        }
        updateURL();
        getMovies();
    }, 300); // 300ms delay
}

watch(genres, (genres) => {
    genres.forEach((genre)=>{
        dropdowns.value.genre.values.push(genre.name);
    });
    
    // After genres are loaded, check if we can restore from URL
    attemptRestoreFromURL();
});

watch(languages, (language) => {
    dropdowns.value.language.values.push('English');
    language.forEach((language)=>{
        if(language.english_name != 'English'){
            dropdowns.value.language.values.push(language.english_name);
        }
    });
    
    // After languages are loaded, check if we can restore from URL
    attemptRestoreFromURL();
});

watch(currentPage, (newPage, oldPage) => {
    // Don't trigger during URL restoration
    if (isRestoringFromURL.value) return;
    
    // Bounds checking for pagination
    if (newPage < 1) {

        currentPage.value = 1;
        return;
    }
    
    // If we have totalPages loaded and newPage exceeds it, cap at totalPages
    if (totalPages.value > 0 && newPage > totalPages.value) {
        console.log('exceed')
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
    console.log(`Page changed from ${oldPage} to ${newPage}`)
});

// Watch for changes in dropdown selections - use debouncing to prevent redundant calls
watch(() => dropdowns.value.genre.activeItem, () => {
    // Don't trigger during URL restoration
    if (isRestoringFromURL.value) return;
    debouncedFilterChange(true);
});

watch(() => dropdowns.value.rating.activeItem, () => {
    // Don't trigger during URL restoration
    if (isRestoringFromURL.value) return;
    debouncedFilterChange(true);
});

watch(() => dropdowns.value.year.activeItem, () => {
    // Don't trigger during URL restoration
    if (isRestoringFromURL.value) return;
    debouncedFilterChange(true);
});

watch(() => dropdowns.value.language.activeItem, () => {
    // Don't trigger during URL restoration
    if (isRestoringFromURL.value) return;
    debouncedFilterChange(true);
});

watch(() => dropdowns.value.sort.activeItem, () => {
    // Don't trigger during URL restoration
    if (isRestoringFromURL.value) return;
    debouncedFilterChange(true);
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

// Function to attempt restoration from URL only when both genres and languages are loaded
function attemptRestoreFromURL() {
    // Only proceed if both are loaded and we haven't restored yet
    if (genres.value.length > 0 && languages.value.length > 0 && !hasRestoredFromURL.value) {
        hasRestoredFromURL.value = true;
        restoreFromURL();
    }
}

// Function to restore state from URL
function restoreFromURL() {
    // Only restore if data is loaded
    if (genres.value.length === 0 || languages.value.length === 0) {
        return;
    }
    
    // Set flag to suppress filter watchers during restoration
    isRestoringFromURL.value = true;
    
    const query = route.query;
    
    // Check if there are no query parameters at all
    const hasNoQueries = Object.keys(query).length === 0;
    
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
  
    // Track if we're restoring filters (to trigger only one API call)
    let filtersRestored = false;
    
    // Restore genre
    if (query.genre && dropdowns.value.genre.values.includes(query.genre)) {
        dropdowns.value.genre.activeItem = query.genre;
        filtersRestored = true;
    }
    
    // Restore rating
    if (query.rating && dropdowns.value.rating.values.includes(query.rating)) {
        dropdowns.value.rating.activeItem = query.rating;
        filtersRestored = true;
    }
    
    // Restore year
    if (query.year && dropdowns.value.year.values.includes(query.year)) {
        dropdowns.value.year.activeItem = query.year;
        filtersRestored = true;
    }
    
    // Restore language
    if (query.language && dropdowns.value.language.values.includes(query.language)) {
        dropdowns.value.language.activeItem = query.language;
        filtersRestored = true;
    }
    
    // Restore sort
    if (query.sort && dropdowns.value.sort.values.includes(query.sort)) {
        dropdowns.value.sort.activeItem = query.sort;
        filtersRestored = true;
    }
    
    // If no query parameters exist, set defaults
    if (hasNoQueries) {
        dropdowns.value.language.activeItem = 'English';
        dropdowns.value.sort.activeItem = 'Popularity Descending';
        filtersRestored = true;
    }
    
    // Fetch movies with restored filters - only once after all filters are set
    if (filtersRestored || query.page) {
        // Clear any pending debounced calls
        if (filterDebounceTimer.value) {
            clearTimeout(filterDebounceTimer.value);
        }
        // Call immediately without debounce for initial load
        // Don't call updateURL() here since we're restoring FROM the URL
        getMovies();
    }
    
    // Use nextTick to clear the flag AFTER all watchers have processed
    // This prevents watchers from firing after we've finished restoration
    nextTick(() => {
        isRestoringFromURL.value = false;
    });
    
    // Update meta tags after restoration
    updateMetaTags();
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
    console.log('Fetching movies with current filters...');
    isLoadingMovies.value = true;
    errorMessage.value = null;
    
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
        totalPages.value = json.total_pages > 500 ? 500 : json.total_pages; // TMDB API max limit is 500 pages
        moviesLoaded.value = true;
        
        // Announce results to screen readers
        const resultsCount = movies.value.length;
        const totalResults = json.total_results || 0;
        if (resultsCount > 0) {
            screenReaderAnnouncement.value = `Found ${totalResults} movies. Showing page ${currentPage.value} of ${totalPages.value}. ${resultsCount} movies displayed on this page.`;
        } else {
            screenReaderAnnouncement.value = 'No movies found. Please refine your search parameters.';
        }
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
    
    // Close dropdown and return focus to toggle button
    nextTick(() => {
        const toggleButton = document.getElementById(`dropdownMenu${key.charAt(0).toUpperCase() + key.slice(1)}Btn`);
        if (toggleButton) {
            // Close the dropdown
            const dropdown = window.bootstrap?.Dropdown?.getInstance(toggleButton);
            if (dropdown) {
                dropdown.hide();
            }
            // Return focus to toggle button
            toggleButton.focus();
        }
    });
    
    // The watchers will handle the rest (updating URL and fetching movies)
}

// Keyboard navigation for dropdown menus
function handleDropdownKeydown(event, key, values) {
    const items = values.values;
    
    switch(event.key) {
        case 'ArrowDown':
            event.preventDefault();
            focusedItemIndex.value = (focusedItemIndex.value + 1) % items.length;
            focusDropdownItem(key, focusedItemIndex.value);
            break;
            
        case 'ArrowUp':
            event.preventDefault();
            focusedItemIndex.value = focusedItemIndex.value <= 0 ? items.length - 1 : focusedItemIndex.value - 1;
            focusDropdownItem(key, focusedItemIndex.value);
            break;
            
        case 'Home':
            event.preventDefault();
            focusedItemIndex.value = 0;
            focusDropdownItem(key, 0);
            break;
            
        case 'End':
            event.preventDefault();
            focusedItemIndex.value = items.length - 1;
            focusDropdownItem(key, items.length - 1);
            break;
            
        case 'Escape':
            event.preventDefault();
            closeDropdownAndFocus(key);
            break;
            
        case 'Tab':
            // Let Bootstrap handle Tab - it will close the dropdown
            closeDropdownAndFocus(key);
            break;
    }
}

// Focus a specific dropdown item
function focusDropdownItem(key, index) {
    nextTick(() => {
        const dropdownMenu = document.querySelector(`#dropdownMenu${key.charAt(0).toUpperCase() + key.slice(1)}Btn + .dropdown-menu`);
        if (dropdownMenu) {
            const buttons = dropdownMenu.querySelectorAll('button[role="menuitem"]');
            if (buttons[index]) {
                buttons[index].focus();
            }
        }
    });
}

// Close dropdown and return focus to toggle button
function closeDropdownAndFocus(key) {
    const toggleButton = document.getElementById(`dropdownMenu${key.charAt(0).toUpperCase() + key.slice(1)}Btn`);
    if (toggleButton) {
        const dropdown = window.bootstrap?.Dropdown?.getInstance(toggleButton);
        if (dropdown) {
            dropdown.hide();
        }
        toggleButton.focus();
    }
}

// Handle dropdown open event to reset focus index
function handleDropdownShow(key) {
    focusedDropdownKey.value = key;
    focusedItemIndex.value = -1;
    
    // Find the currently selected item and set focus index to it
    const currentSelection = dropdowns.value[key].activeItem;
    if (currentSelection) {
        const index = dropdowns.value[key].values.indexOf(currentSelection);
        if (index !== -1) {
            focusedItemIndex.value = index;
            nextTick(() => {
                focusDropdownItem(key, index);
            });
        }
    }
}

// Handle item click with keyboard support
function handleItemSelect(event, key, item) {
    handleDropdownSelect(key, item);
}

// Handle reset filters with focus management
function handleResetWithFocus() {
    resetFilters();
    
    // Focus the first filter dropdown after reset
    nextTick(() => {
        const firstDropdown = document.querySelector('.dropdown button[type="button"]');
        if (firstDropdown) {
            firstDropdown.focus();
        }
    });
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
    
    // Announce to screen readers
    screenReaderAnnouncement.value = 'All filters have been reset. Please select new filters to discover movies.';
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

// Add scroll listener in onMounted
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
    
    // Set initial meta tags
    updateMetaTags();
    
    // Add scroll listener for back to top button
    if (typeof window !== 'undefined') {
        window.addEventListener('scroll', handleScroll);
    }
});

// Clean up event listeners on unmount
onUnmounted(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
    }
});

</script>

<template>
  
    <main
    class="d-flex flex-column min-vh-100"
    role="main"
    aria-label="Movie discovery application"
    >

        <!-- Skip Navigation Link -->
        <a href="#movie-results" class="skip-link">Skip to movie results</a>

        <!-- Screen reader announcements -->
        <div 
            aria-live="polite" 
            aria-atomic="true" 
            class="visually-hidden"
        >
            {{ screenReaderAnnouncement }}
        </div>

        <!--content-->
        <div>
            <!-- Error alerts for initial data loading -->
            <div v-if="genresError || languagesError" class="container mt-4">
                <div v-if="genresError" class="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Error loading genres:</strong> {{ genresError }}
                    <button 
                        type="button" 
                        class="btn btn-sm btn-outline-danger ms-3" 
                        @click="retryFailedRequest('genres')"
                        aria-label="Retry loading genres"
                    >
                        Retry
                    </button>
                    <button type="button" class="btn-close" @click="genresError = null" aria-label="Close error message"></button>
                </div>
                <div v-if="languagesError" class="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Error loading languages:</strong> {{ languagesError }}
                    <button 
                        type="button" 
                        class="btn btn-sm btn-outline-danger ms-3" 
                        @click="retryFailedRequest('languages')"
                        aria-label="Retry loading languages"
                    >
                        Retry
                    </button>
                    <button type="button" class="btn-close" @click="languagesError = null" aria-label="Close error message"></button>
                </div>
            </div>

            <form aria-label="Movie filters">

                <!--dropdowns-->
                <div 
                    class="d-flex justify-content-center align-items-center my-5 flex-wrap gap-2"
                    role="group"
                    aria-label="Filter options"
                >

                    <div v-for="(values, key) in dropdowns" :key="key" class="dropdown">
                        <button 
                        class="btn btn-primary dropdown-toggle" 
                        type="button" 
                        :id="`dropdownMenu${key.charAt(0).toUpperCase() + key.slice(1)}Btn`" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                        :aria-label="`Filter by ${key}. Current selection: ${values.activeItem || 'None'}`"
                        :aria-describedby="(key === 'genre' && isLoadingGenres) || (key === 'language' && isLoadingLanguages) ? `${key}-loading-msg` : undefined"
                        :disabled="(key === 'genre' && isLoadingGenres) || (key === 'language' && isLoadingLanguages)"
                        @shown.bs.dropdown="handleDropdownShow(key)"
                        >
                        {{ values.activeItem === null ? key.charAt(0).toUpperCase() + key.slice(1) : values.activeItem }}
                        </button>
                        <span 
                            :id="`${key}-loading-msg`" 
                            class="visually-hidden"
                            v-if="(key === 'genre' && isLoadingGenres) || (key === 'language' && isLoadingLanguages)"
                        >
                            Loading {{ key }} options, please wait
                        </span>
                        <ul 
                        class="dropdown-menu" 
                        role="menu"
                        :aria-labelledby="`dropdownMenu${key.charAt(0).toUpperCase() + key.slice(1)}Btn`"
                        @keydown="handleDropdownKeydown($event, key, values)"
                        >
                           
                            <li 
                            v-for="(item, index) in values.values" 
                            :key="item" 
                            role="none"
                            >
                                <button
                                    type="button"
                                    class="dropdown-item"
                                    role="menuitem"
                                    :class="index === 0 && values.options.underlineFirstItem ? 'border-info border-bottom' : ''"
                                    :aria-current="values.activeItem === item ? 'true' : 'false'"
                                    @click="handleItemSelect($event, key, item)"
                                    @keydown.enter.prevent="handleItemSelect($event, key, item)"
                                    @keydown.space.prevent="handleItemSelect($event, key, item)"
                                >
                                    {{ item }}
                                    <span v-if="values.activeItem === item" class="visually-hidden"> (currently selected)</span>
                                </button>
                            </li>
                        </ul>

                
                    </div>

                    <!-- Reset Filters Button -->
                    <button 
                        type="button" 
                        class="btn btn-outline-secondary"
                        @click="handleResetWithFocus"
                        :disabled="isLoadingMovies || isLoadingGenres || isLoadingLanguages"
                        v-show="dropdowns.genre.activeItem || dropdowns.rating.activeItem || dropdowns.year.activeItem || dropdowns.language.activeItem || dropdowns.sort.activeItem"
                        aria-label="Reset all filters and clear search"
                    >
                        <span class="me-1">Reset Filters</span>
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            fill="currentColor" 
                            class="bi bi-x-circle" 
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                            focusable="false"
                        >
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
                    <button 
                        type="button" 
                        class="btn btn-sm btn-outline-danger ms-3" 
                        @click="retryFailedRequest('movies')"
                        aria-label="Retry loading movies"
                    >
                        Retry
                    </button>
                    <button type="button" class="btn-close" @click="errorMessage = null" aria-label="Close error message"></button>
                </div>
            </div>

            <!-- Loading spinner -->
            <div 
                v-if="isLoadingMovies" 
                class="d-flex justify-content-center my-5"
                role="status"
                aria-live="polite"
            >
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading movies, please wait...</span>
                </div>
            </div>

            <!--results-->
            <section
                id="movie-results"
                v-show="movies.length > 0 && !isLoadingMovies"
                role="region"
                aria-label="Movie search results"
                tabindex="-1"
            >
                <MovieGrid
                :movies="movies"
                :genres="genres"
                />
                
                <!--pagination-->
                <nav 
                    class="d-flex justify-content-center my-5"
                    aria-label="Movie results pagination"
                >
                    <Paginator
                    :total-pages = totalPages
                    v-model="currentPage" 
                    />
                </nav>
            </section>
            
            <div
                class="justify-content-center mt-5"
                :class="movies.length === 0 && moviesLoaded && !isLoadingMovies && !errorMessage ? 'd-flex' : 'd-none'"
                role="status"
                aria-live="polite"
            >
                <p>No movies found, please refine your search parameters.</p>
            </div>
            
            <div
                class="justify-content-center mt-5"
                :class="!moviesLoaded && !isLoadingMovies && !errorMessage ? 'd-flex' : 'd-none'"
                role="status"
            >
                <p>Select your filters above to discover movies!</p>
            </div>
        </div>
        <!--content end-->

        <!-- Back to Top Button -->
        <transition name="fade">
            <button 
                v-show="showBackToTop"
                @click="scrollToTop"
                class="back-to-top-btn"
                aria-label="Back to top"
                title="Back to top"
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    fill="currentColor" 
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                >
                    <path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"/>
                </svg>
            </button>
        </transition>

    </main>

</template>


<style scoped>

    .dropdown-menu{
        max-height: 300px;
        overflow-y: scroll;
    }

    .dropdown-item{
        cursor: pointer;
    }

    /* Skip Navigation Link */
    .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: #000;
        color: #fff;
        padding: 8px 16px;
        text-decoration: none;
        z-index: 100;
        border-radius: 0 0 4px 0;
        font-weight: 600;
    }

    .skip-link:focus {
        top: 0;
        outline: 3px solid #0d6efd;
        outline-offset: 2px;
    }

    /* Enhanced Focus Indicators */
    .btn:focus-visible,
    .dropdown-toggle:focus-visible {
        outline: 3px solid #0d6efd;
        outline-offset: 2px;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    .dropdown-item:focus,
    .dropdown-item:focus-visible {
        background-color: #0d6efd;
        color: #fff;
        outline: 2px solid #0a58ca;
        outline-offset: -2px;
    }

    .dropdown-item[aria-current="true"] {
        background-color: #e7f1ff;
        font-weight: 600;
        position: relative;
    }

    .dropdown-item[aria-current="true"]::before {
        content: "✓";
        position: absolute;
        left: 8px;
        font-weight: bold;
        color: #0d6efd;
    }

    .dropdown-item[aria-current="true"] {
        padding-left: 28px;
    }

    /* High contrast focus for accessibility */
    @media (prefers-contrast: high) {
        .btn:focus-visible,
        .dropdown-toggle:focus-visible {
            outline: 4px solid currentColor;
        }
        
        .dropdown-item:focus,
        .dropdown-item:focus-visible {
            outline: 3px solid #000;
        }
    }

    /* Smooth focus transitions */
    .btn,
    .dropdown-item {
        transition: outline 0.15s ease, box-shadow 0.15s ease;
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

</style>