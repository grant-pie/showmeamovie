<script setup>
import { ref, onMounted, watch } from 'vue'


let genres = ref([]);
let languages = ref([]);
let dropdowns = ref({
    genre: {activeItem: null,values: [], options: {}},
    rating: {activeItem: null, values: [], options: {}},
    year: {activeItem: null, values: [], options: {}},
    language: {activeItem: null, values: [], options: {underlineFirstItem: true}}
});
let movies = ref([
{
  adult: false,
  backdrop_path: "/bVm6udIB6iKsRqgMdQh6HywuEBj.jpg",
  genre_ids: [53, 28],
  id: 1233069,
  original_language: "de",
  original_title: "Exterritorial",
  overview: "When her son vanishes inside a US consulate, ex-special forces soldier Sara does everything in her power to find him — and uncovers a dark conspiracy.",
  popularity: 599.2458,
  poster_path: "/jM2uqCZNKbiyStyzXOERpMqAbdx.jpg",
  release_date: "2025-04-29",
  title: "Exterritorial",
  video: false,
  vote_average: 6.727,
  vote_count: 214
}
]);
let totalPages = ref(0);
let currentPage = ref(1);

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
    console.log(currentPage)
});

watch(movies, (movies) => {
    getMovies();
});



async function getMovieGenres() {
    const url = 'https://api.themoviedb.org/3/genre/movie/list?language=en';
    const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwMmZlYzc5ODA3YzNkNWVmOGM2OThkY2FjZTI2OGIyMyIsIm5iZiI6MTYwMDk1MTMwNy45MDYsInN1YiI6IjVmNmM5NDBiY2VlMmY2MDAzNjQxYzVlZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Uo0PjGmvNiC6LLKEqOvcjeeebuCQq93TSlrtSR-eRYI'
    }
    };

    fetch(url, options)
    .then(res => res.json())
    .then(json => genres.value = json.genres)
    .catch(err => console.error(err));
}

async function getLanguages() {
    const url = 'https://api.themoviedb.org/3/configuration/languages';
    const options = {method: 'GET', headers: {accept: 'application/json', Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwMmZlYzc5ODA3YzNkNWVmOGM2OThkY2FjZTI2OGIyMyIsIm5iZiI6MTYwMDk1MTMwNy45MDYsInN1YiI6IjVmNmM5NDBiY2VlMmY2MDAzNjQxYzVlZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Uo0PjGmvNiC6LLKEqOvcjeeebuCQq93TSlrtSR-eRYI'}};

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
        const language = languages.value.find((element) => element.name ===  dropdowns.value.language.activeItem);
        const languageURLAppend = language.iso_639_1;
        url+='&language=' + languageURLAppend;
    }

    const options = {method: 'GET', headers: {accept: 'application/json', Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwMmZlYzc5ODA3YzNkNWVmOGM2OThkY2FjZTI2OGIyMyIsIm5iZiI6MTYwMDk1MTMwNy45MDYsInN1YiI6IjVmNmM5NDBiY2VlMmY2MDAzNjQxYzVlZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Uo0PjGmvNiC6LLKEqOvcjeeebuCQq93TSlrtSR-eRYI'}};
    console.log(url);
    fetch(url, options)
    .then(res => res.json())
    .then((json) => { movies.value = json.results; totalPages.value = json.total_pages; })
    .catch(err => console.error(err));
    }

</script>

<template>
   
    <section
    class="mx-5"
    >

        <div class="card">
            <form>

                <!--dropdowns-->
                <div class="d-flex">

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
                            @click="values.activeItem = values.values[index]"
                            >
                                {{ item }}

                            
                            </li>
                        </ul>

                
                    </div>

                    <div @click="getMovies" class="btn btn-primary ">Discover</div>

                </div>
                
                <!--order by dropdown-->


            </form>

            <!--results-->
            <div>
                <MovieGrid
                :movies="movies"
                />
                
                <!--pagination-->
                <Paginator
                :total-pages = totalPages
                v-model="currentPage" 
                />
            </div>
      

        </div>
        
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