<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const isLoginPage = computed(() => route.path === '/login')

const adminName = computed(() => {
  const raw = localStorage.getItem('adminUserInfo')
  if (!raw) return '管理员'
  try {
    const user = JSON.parse(raw)
    return user.nickname || `用户${user.id ?? ''}` || '管理员'
  } catch (error) {
    return '管理员'
  }
})

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '温馨提示', {
    type: 'warning',
    confirmButtonText: '确定退出',
    cancelButtonText: '取消',
    lockScroll: false
  })
    .then(() => {
      console.log('执行退出登录')

      localStorage.removeItem('token')
      localStorage.removeItem('adminUserInfo')
      router.replace('/login')
      ElMessage.success('退出登录成功')
    })
    .catch(() => {
      ElMessage.info('已取消退出')
    })
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
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-500">你好，{{ adminName }}</span>
        <button
          class="px-3 py-1 text-sm border border-red-200 rounded cursor-pointer hover:border-red-100 hover:bg-red-400"
          @click="handleLogout"
        >
          退出登录
        </button>
      </div>
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
        <router-link
          to="/product"
          class="block py-2 px-2 rounded hover:bg-gray-100 dark:hover:bg-orange-600"
          >商品管理</router-link
        >
        <router-link
          to="/user"
          class="block py-2 px-2 rounded hover:bg-gray-100 dark:hover:bg-orange-600"
          >用户管理</router-link
        >
        <router-link
          to="/ai-review"
          class="block py-2 px-2 rounded hover:bg-gray-100 dark:hover:bg-orange-600"
          >AI审核</router-link
        >
      </aside>
      <main class="flex-1 p-4">
        <router-view />
      </main>
    </div>
  </div>
</template>
