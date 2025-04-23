import './vendor/normalize.css';
import './vendor/fonts/lexend_exa/lexend_exa.css';
import './styles.css';
import './assets/styles/global.css';
import 'ant-design-vue/dist/reset.css';

import axios from 'axios';
import { createApp } from 'vue';

import App from './App.vue';
import web3Onboard from './components/onboard';
//routers
import router from './router';

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;

const app = createApp(App);

//router
app.use(router, web3Onboard);
app.mount('#app');