import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import PrimeVue from 'primevue/config';
import VueCarousel from 'vue-carousel';
import 'primeflex/primeflex.css';
import 'primevue/resources/themes/lara-light-blue/theme.css'; // Import the chosen theme
import 'primevue/resources/primevue.min.css'; // Core CSS
import 'primeicons/primeicons.css'; // Icons CSS


const app = createApp(App);

app.use(router);
app.use(store);
app.use(PrimeVue);
app.use(VueCarousel);

app.mount('#app');
