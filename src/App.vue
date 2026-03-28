<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const isLoginPage = computed(() => route.path === '/login')

const handleLogout = () => {
  localStorage.removeItem('token')
  router.replace('/login')
}
</script>

<template>
  <router-view v-if="isLoginPage" />
  <div
    v-else
    class="bg-gray-50 dark:bg-black dark:text-white min-h-screen font-sans"
  >
    <header
      class="h-14 bg-white dark:bg-black border-b flex items-center justify-between px-4"
    >
      <span>社区团购后台</span>
      <button class="px-3 py-1 text-sm border rounded" @click="handleLogout">
        退出登录
      </button>
    </header>
    <div class="flex">
      <aside
        class="w-56 bg-white dark:bg-black border-r min-h-[calc(100vh-56px)] p-3 space-y-2"
      >
        <router-link
          to="/dashboard"
          class="block py-2 px-2 rounded hover:bg-gray-100 dark:hover:bg-orange-600"
          >仪表盘</router-link
        >
        <router-link
          to="/order"
          class="block py-2 px-2 rounded hover:bg-gray-100 dark:hover:bg-orange-600"
          >订单管理</router-link
        >
      </aside>
      <main class="flex-1 p-4">
        <router-view />
      </main>
    </div>
  </div>
</template>
