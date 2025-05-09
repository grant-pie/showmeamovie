import * as bootstrap from '../node_modules/bootstrap'

export default defineNuxtPlugin(() => {
    return {
        provide: {
            bootstrap: bootstrap
        }
    }
})