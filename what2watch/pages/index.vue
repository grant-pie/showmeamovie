<script setup>
import { ref, onMounted, watch } from 'vue'


let genres = ref([]);
let languages = ref([]);
let dropdowns = ref({
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
let moviesLoaded = ref(false);
let movies = ref([]);
let totalPages = ref(0);
let currentPage = ref(1);

const apiKey = useRuntimeConfig().public.apiKey


onMounted(() => {

    //get genres
    getMovieGenres();

    //populate rating
    for(let i=0; i<=9; i++){
        if(i < 9){
            dropdowns.value.rating.values.push(i+1+'+');
        } else {
            dropdowns.value.rating.values.push('10');
        }
    }

    //calculate years
    calcYears();

    //get langauges
    getLanguages();

});

watch(genres, (genres) => {
    genres.forEach((genre)=>{
        dropdowns.value.genre.values.push(genre.name);
    });
});

watch(languages, (language) => {
    dropdowns.value.language.values.push('English');
    language.forEach((language)=>{
        if(language.english_name != 'English'){
            dropdowns.value.language.values.push(language.english_name);
        }
    });

});

watch(currentPage, (currentPage) => {
    getMovies();
});

async function getMovieGenres() {
    const url = 'https://api.themoviedb.org/3/genre/movie/list?language=en';
    const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer ' + apiKey
    }
    };

    fetch(url, options)
    .then(res => res.json())
    .then(json => genres.value = json.genres)
    .catch(err => console.error(err));
}

async function getLanguages() {
    const url = 'https://api.themoviedb.org/3/configuration/languages';
    const options = {method: 'GET', headers: {accept: 'application/json', Authorization: 'Bearer ' + apiKey}};

    fetch(url, options)
    .then(res => res.json())
    .then(json => languages.value=json)
    .catch(err => console.error(err));
}

function calcYears(){
    //get year ranges
    const currentYear = parseInt(new Date().getFullYear());

    //push first year range
    dropdowns.value.year.values.push('All');

    dropdowns.value.year.values.push('<1950' );

    for(let i = 1950; i <= currentYear; i = i + 10) {

        dropdowns.value.year.values.push( i.toString() + '-' + (i + 9).toString() );
    }


    dropdowns.value.year.values.push( 'Latest' );
}

async function getMovies(){
    //calc url
    let url = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false?';

    //page
    url+= '&page=' + currentPage.value;

    //genre
    if(dropdowns.value.genre.activeItem != null){
        const genre = genres.value.find((element) => element.name ===  dropdowns.value.genre.activeItem);
        const genreURLAppend = genre.id;
        url+='&with_genres=' + genreURLAppend;
    }

    //rating
    if(dropdowns.value.rating.activeItem != null){
        const ratingURLAppend = dropdowns.value.rating.activeItem.includes('+') ? dropdowns.value.rating.activeItem.replace('+', '') : dropdowns.value.rating.activeItem
        url+='&vote_average.gte=' + ratingURLAppend
    }

    //year
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

    //langauge
    if(dropdowns.value.language.activeItem != null){
        const language = languages.value.find((element) => element.english_name ===  dropdowns.value.language.activeItem);
        const languageURLAppend = language.iso_639_1;
        url+='&with_original_language=' + languageURLAppend;
    }

    //sorting
    if(dropdowns.value.sort.activeItem != null){
        const sortBy = sortOptions.find((element) => element.name ===  dropdowns.value.sort.activeItem);
        const genreURLAppend = sortBy.value;
        url+='&sort_by=' + genreURLAppend;

    }

    const options = {method: 'GET', headers: {accept: 'application/json', Authorization: 'Bearer ' + apiKey}};

    fetch(url, options)
    .then(res => res.json())
    .then((json) => { movies.value = json.results; totalPages.value = json.total_pages; moviesLoaded.value = true; console.log(moviesLoaded.value)})
    .catch(err => console.error(err));
}

</script>

<template>
  
    <section
    class="d-flex flex-column min-vh-100"
    >

        <!--content-->
        <div>
            <form>

                <!--dropdowns-->
                <div class="d-flex justify-content-center my-5">

                    <div v-for="(values, key) in dropdowns" :key="key" class="dropdown me-2">
                        <button 
                        class="btn btn-primary dropdown-toggle" 
                        type="button" 
                        :id="`dropdownMenu${key.charAt(0).toUpperCase() + key.slice(1)}Btn`" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
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
                            @click="values.activeItem = values.values[index]; getMovies()"
  
                            >
                                {{ item }}

                            
                            </li>
                        </ul>

                
                    </div>

                </div>
                
                <!--order by dropdown-->


            </form>

            <!--results-->
            <div
            v-show="movies.length > 0"
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
            :class="movies.length === 0 && moviesLoaded ? 'd-flex' : 'd-none'"
            >
                <p>No movies found, please refine your search paramaters...</p>
            </div>
            <div
            
            class="justify-content-center mt-5"
            :class="!moviesLoaded ? 'd-flex' : 'd-none'"
            >
                <p>Set search parameters and click discover!</p>
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