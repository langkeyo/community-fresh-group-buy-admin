<script setup lang="ts">
import { type AdminUserItem, getUserListApi, updateLeaderApi } from '@/api/user'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'

const loading = ref(false)
const errorMsg = ref('')
const users = ref<AdminUserItem[]>([])
const keyword = ref('')
const updatingUserId = ref<number | null>(null)

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

const toggleLeader = async (row: AdminUserItem, value: boolean) => {
  if (!row.id || updatingUserId.value) return
  const prev = Boolean(row.isLeader)
  row.isLeader = value
  updatingUserId.value = row.id
  try {
    const res = await updateLeaderApi(row.id, value)
    if (res.code !== 200) throw new Error(res.message || '更新失败')
    ElMessage.success(value ? '已设为团长' : '已取消团长')
  } catch (error: any) {
    row.isLeader = prev
    ElMessage.error(error?.message || '更新失败')
  } finally {
    updatingUserId.value = null
  }
}
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
      <el-table-column prop="isLeader" label="团长" width="180">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <el-tag :type="row.isLeader ? 'success' : 'info'">
              {{ row.isLeader ? '是' : '否' }}
            </el-tag>
            <el-switch
              :model-value="Boolean(row.isLeader)"
              :loading="updatingUserId === row.id"
              @change="(val:boolean) => toggleLeader(row, val)"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" min-width="140" />
      <el-table-column prop="createTime" label="注册时间" min-width="180" />
    </el-table>
  </div>
</template>
