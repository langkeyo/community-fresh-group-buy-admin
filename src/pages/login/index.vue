<script setup lang="ts">
import { devLoginApi } from '@/api/user'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogin = async () => {
  try {
    // 后台先固定测试 code，后续再接真实微信/账号密码
    const res = await devLoginApi('admin-test-code')

    if (res.code !== 200 || !res.data?.token) {
      throw new Error(res.message || '登录失败')
    }

    localStorage.setItem('token', res.data.token)
    if (res.data.userInfo) {
      localStorage.setItem('adminUserInfo', JSON.stringify(res.data.userInfo))
    }

    ElMessage.success('登录成功')
    router.replace('/dashboard')
  } catch (error: any) {
    ElMessage.error(error?.message || '登录失败')
  }
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
