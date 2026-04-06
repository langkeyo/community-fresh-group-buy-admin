import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: () => import('@/pages/login/index.vue') },
    {
      path: '/dashboard',
      component: () => import('@/pages/dashboard/index.vue')
    },
    { path: '/order', component: () => import('@/pages/order/index.vue') },
    { path: '/product', component: () => import('@/pages/product/index.vue') },
    { path: '/user', component: () => import('@/pages/user/index.vue') },
    {
      path: '/ai-review',
      component: () => import('@/pages/ai-review/index.vue')
    },
    {
      path: '/system-config',
      component: () => import('@/pages/system-config/index.vue')
    }
  ]
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) return '/login'
  if (to.path === '/login' && token) return '/dashboard'
})

export default router
