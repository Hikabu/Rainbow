import { createRouter, createWebHistory } from 'vue-router';

import { getToken, isAuthenticated } from '@/components/tokenUtils';
import Game from '@/features/Game/Game.vue';
import LoginPage from '@/pages/LoginPage/LoginPage.vue';
import NotFound from '@/pages/NotFound.vue';
import RegisterPage from '@/pages/RegisterPage/RegisterPage.vue';

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

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    try {
      //cookies
      const token = await getToken();
      if (!token || !isAuthenticated()) {
        console.error("Access token not found, redirecting to login...");
        return next({ name: 'Login' });
      }
      return next();
    } catch (error) {
      console.error('Error during authentication check:', error);
      return next({ name: 'Login' });
    }
  }
  return next();
});

export default router;