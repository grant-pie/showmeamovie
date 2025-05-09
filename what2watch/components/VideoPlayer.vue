<template>

    <div v-show="seen" class="flex-column bg-dark rounded" v-bind:style="styleObject">

        <div class="d-flex px-2 font-weight-bold justify-content-between">

            <p class="font-secondary mb-0 ">Play Trailer</p>

            <p class="mb-0 cursor-pointer" @click="$emit('update:seen', false)">X</p>

        </div>

        <iframe v-bind:src=url frameBorder="0"></iframe>

    </div>

</template>

<script>

export default {
    props: {
        seen: {
            type: Boolean,
            default: false
        },
        videoSite: {
            type: String,
            default: ''
        },
        videoKey: {
            type: String,
            default: ''
        },
    },
    data: function() {
        return {
            styleObject: {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
                display: this.seen ? 'flex' : 'none'
            }
        }
    },
    computed: {
        url: function(){
            if(this.videoSite === 'YouTube') {
                return 'https://www.youtube.com/embed/' + this.videoKey;
            } else {
                console.error('Video Player: Video site not supported');
            }
        }
    },
}

</script>