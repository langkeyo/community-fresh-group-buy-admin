<script setup lang="ts">
import { type AdminUserItem, getUserListApi } from '@/api/user'
import { computed, onMounted, ref } from 'vue'

const loading = ref(false)
const errorMsg = ref('')
const users = ref<AdminUserItem[]>([])
const keyword = ref('')

const displayUsers = computed(() => {
  const kw = keyword.value.trim()
  if (!kw) return users.value
  return users.value.filter((u) => {
    const idText = String(u.id ?? '')
    const nickname = u.nickname ?? ''
    const phone = u.phone ?? ''
    return idText.includes(kw) || nickname.includes(kw) || phone.includes(kw)
  })
})

const load = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const res = await getUserListApi()
    if (res.code !== 200) throw new Error(res.message || '加载失败')
    users.value = res.data || []
  } catch (error: any) {
    errorMsg.value = error?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="p-4">
    <h2 class="mb-3 flex items-center gap-2">
      用户管理

      <span class="text-sm text-gray-500">共 {{ displayUsers.length }} 条</span>
    </h2>

    <div class="mb-3">
      <el-input
        v-model="keyword"
        placeholder="搜索 用户ID/昵称/手机号"
        clearable
        style="width: 260px"
      />
    </div>

    <el-alert
      v-if="errorMsg"
      type="error"
      :title="errorMsg"
      show-icon
      closable
      class="mb-3"
    />

    <el-table v-loading="loading" :data="displayUsers" border class="w-full">
      <el-table-column prop="id" label="用户ID" width="100" />
      <el-table-column prop="nickname" label="昵称" min-width="140" />
      <el-table-column prop="isLeader" label="团长" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isLeader ? 'success' : 'info'">
            {{ row.isLeader ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" min-width="140" />
      <el-table-column prop="createTime" label="注册时间" min-width="180" />
    </el-table>
  </div>
</template>
