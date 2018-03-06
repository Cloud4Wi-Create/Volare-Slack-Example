import Vue from 'vue';
import App from './components/app.vue';
import store from './store/store.js';
import VueResource from 'vue-resource';

Vue.use(VueResource);

new Vue({
    el: '#app',
    store,
    http: {
      root: '/',
    },
    render: h => h(App)
});
