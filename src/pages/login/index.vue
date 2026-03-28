<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogin = () => {
  localStorage.setItem('token', 'admin-demo-token')
  router.replace('/dashboard')
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black dark:text-white"
  >
    <div class="w-[320px] bg-white p-6 rounded shadow">
      <h2 class="text-lg font-semibold mb-4">后台登录</h2>
      <button
        class="w-full h-10 bg-blue-600 text-white rounded"
        @click="handleLogin"
      >
        模拟登录
      </button>
    </div>
  </div>
</template>
