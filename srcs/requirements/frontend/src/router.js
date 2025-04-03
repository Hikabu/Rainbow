import axios from 'axios';
import { createRouter, createWebHistory } from 'vue-router';

import Game from '@/features/Game/Game.vue';
import LoginPage from '@/pages/LoginPage/LoginPage.vue';
import NotFound from '@/pages/NotFound.vue';
import RegisterPage from '@/pages/RegisterPage/RegisterPage.vue';

import MainPage from './pages/MainPage/MainPage.vue';
import Profile from './pages/smallPages/Profile.vue';
import Settings from './pages/smallPages/Settings.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: LoginPage,
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterPage,
      meta: { requiresAuth: false }
    },
    {
      path: '/mainpage',
      name: 'MainPage',
      component: MainPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
      meta: { requiresAuth: true }
    },
    {
      path: '/game',
      name: 'Game',
      component: Game,
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound
    }
  ]
});


//to know where ti send the requests -establish Axios Instance
const api = axios.create({
  baseURL: '/api/',
  withCredentials: true
})


//flag to prevent multiple token refresh requsts
let isRefreshing = false;
//list to hold the request tokens
const refreshRetryQueue = [];
let refreshTimeOut = null;
let time = import.meta.env.VITE_TIME_OUT;
//Axios interceptors
api.interceptors.response.use(
  (response) => response, // without modification request
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401) {
      if (!isRefreshing && !originalRequest._retry) {
        isRefreshing = true;

        try {
          //refresh
          const newAccessToken = await api.post('token/refresh/');
          if (newAccessToken) {
            originalRequest._retry = true;

            // retry all requests in the queue with new token
            refreshRetryQueue.forEach(({ config, resolve, reject }) => {

                api.request(config)
                .then((response) => resolve(response))
                .catch((err) => reject(err));
            });

            //clear the queue
            refreshRetryQueue.length = 0;

            //retry the original request
            return api(originalRequest);
          }
        } catch (err) {
            console.error("a problem", err);
            router.push('/')
            return Promise.reject(err)
            
        }finally {
          isRefreshing = false;
        }
      }
    console.error("you are not authorised");
    router.push('/')
    //add the original request to queue 
    return new Promise((resolve, reject) => {
      refreshRetryQueue.push({ config: originalRequest, resolve, reject});
    });
  }
  return Promise.reject(error);
});

//haahahahaahahah proactive
function startRefrInterval() {
  refreshTimeOut = setInterval(async () => {
    try {
      await api.post('token/refresh/');
    } catch (error) {
      clearInterval(refreshTimeOut);
      console.log("this is it", error);
      router.push('/')
    }
  }, time);
}
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    try {
      //cookies
      const token = await api.get('auth-status/');
      if (!refreshTimeOut && token.status === 200){
        startRefrInterval();
      }
      next();
      if (token.status != 200) {
        clearInterval(refreshTimeOut)
        console.error("Access token not found, redirecting to login...");
        return next({ name: 'Login' });
      }
    } catch (error) {
      clearInterval(refreshTimeOut)
      console.error('Error during authentication check:', error);
      return next({ name: 'Login' });
    } 
  } else {
    clearInterval(refreshTimeOut);
    refreshTimeOut = null;
    next()
  }
});

export default router;