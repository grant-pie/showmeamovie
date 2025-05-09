<template>

    <div class="circleContainer" :style="{width: circleSize + 'px', height: circleSize + 'px'}">

        <p class="circleText font-weight-bold font-size--lg" :style="textStyle">{{ score }}</p>

        <div id="circleRight" :style="[circleStyle, circleHalfStyle, rightCircleStyle]"></div>

        <div id="circleLeft" :style="[circleStyle, circleHalfStyle, leftCircleStyle]"></div>

        <div id="circleCenter" :style="[circleStyle, centerCircleStyle]"></div>

    </div>

</template>

<script>

export default {
    props: {
        score:  0
    },
    data: function() {
        return {
            circleSize: 45,
            textStyle: {
                textAlign: 'center',
                zIndex: 3,
                position: 'absolute',
                lineHeight: '45px',
                height: '45px',
                width: '45px'
            },
            circleStyle: {
                borderBottomLeftRadius: '55px',
                borderTopLeftRadius: '55px',
                border: '3px solid',
                borderColor: '#801336',
                position: 'absolute',
            },
            circleHalfStyle: {
                zIndex: 2,
                borderRight: 0,
                transformOrigin: 'center right',
                width: 45 / 2 + 'px',
                height: '45px',
                rotate: '0deg'
            },
            centerCircleStyle: {
                borderBottomRightRadius: '55px',
                borderTopRightRadius: '55px',
                zIndex: 0,
                height: '45px',
                width: '45px',
            },
            leftCircleStyle: {},
            rightCircleStyle: {},
        }
    },
    computed: {
        scoreDegrees: function() {
            return (this.score - 0) * (360 - 0) / (10 - 0) + 0;
        }
    },
    watch: {
        score: function() {
            if(this.score >= 5) {
                this.leftCircleStyle.borderColor = '#21d07a';
                this.leftCircleStyle.rotate = this.scoreDegrees + 'deg';

                this.rightCircleStyle.borderColor = '#21d07a';
                this.rightCircleStyle.rotate = '180deg';

            } else {
                this.leftCircleStyle.borderColor = '#801336';
                this.rightCircleStyle.borderColor = '#21d07a';
                this.rightCircleStyle.rotate = this.scoreDegrees  + 'deg';
            }
        }
    },
}

</script>