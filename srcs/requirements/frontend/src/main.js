import '@dzangolab/vue-country-flag-icon/dist/CountryFlag.css';
import './vendor/normalize.css';
import './vendor/fonts/lexend_exa/lexend_exa.css';
import './styles.css';
import './assets/styles/global.css';
import 'ant-design-vue/dist/reset.css';

import axios from 'axios';
// import CountryFlag from '@dzangolab/vue-country-flag-icon';
import { createApp } from 'vue';

import App from './App.vue';
//routers
import router from './router';

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;

const app = createApp(App);
// app.component('CountryFlag', CountryFlag);

//router
app.use(router);
app.mount('#app');