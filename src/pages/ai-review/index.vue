<script setup lang="ts">
import {
  type AiReviewItem,
  approveAiReviewApi,
  getAiReviewListApi,
  rejectAiReviewApi
} from '@/api/ai'
import { computed, onMounted, ref } from 'vue'

const loading = ref(false)
const actionLoadingId = ref<number | null>(null)
const errorMsg = ref('')
const list = ref<AiReviewItem[]>([])
const detailVisible = ref(false)
const detailRow = ref<AiReviewItem | null>(null)
const statusFilter = ref<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')

const parsedRecipe = computed(() => {
  if (!detailRow.value?.recipeJson) return null

  try {
    return JSON.parse(detailRow.value.recipeJson)
  } catch (error) {
    return null
  }
})

const openDetail = (row: AiReviewItem) => {
  detailRow.value = row
  detailVisible.value = true
}

const load = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const res = await getAiReviewListApi(statusFilter.value)
    if (res.code !== 200) throw new Error(res.message || '加载失败')
    list.value = res.data || []
  } catch (error: any) {
    errorMsg.value = error?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const handleApprove = async (row: AiReviewItem) => {
  actionLoadingId.value = row.id

  try {
    const res = await approveAiReviewApi(row.id)
    if (res.code !== 200) throw new Error(res.message || '操作失败')
    ElMessage.success('审核通过')
    await load()
  } catch (error: any) {
    ElMessage.error(error?.message || '操作失败')
  } finally {
    actionLoadingId.value = null
  }
}

const handleReject = async (row: AiReviewItem) => {
  actionLoadingId.value = row.id

  try {
    const res = await rejectAiReviewApi(
      row.id,
      'admin',
      '内容不稳定，建议重生成'
    )
    if (res.code !== 200) throw new Error(res.message || '操作失败')
    ElMessage.success('已驳回')
    await load()
  } catch (error: any) {
    ElMessage.error(error?.message || '操作失败')
  } finally {
    actionLoadingId.value = null
  }
}

onMounted(load)
</script>

<template>
  <div class="p-4">
    <h2 class="mb-3 text-xl font-semibold">AI审核</h2>
    <div class="mb-3 flex items-center gap-2">
      <el-select v-model="statusFilter" style="width: 180px" @change="load">
        <el-option label="待审核" value="PENDING" />
        <el-option label="已通过" value="APPROVED" />
        <el-option label="已驳回" value="REJECTED" />
      </el-select>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-alert
      v-if="errorMsg"
      type="error"
      :title="errorMsg"
      show-icon
      class="mb-3"
    />

    <el-table v-loading="loading" :data="list" border class="w-full">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="queryText" label="用户问题" min-width="220" />
      <el-table-column prop="source" label="来源" width="100" />
      <el-table-column prop="status" label="状态" width="120" />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" min-width="180" align="center">
        <template #default="{ row }">
          <el-button
            type="success"
            size="small"
            :loading="actionLoadingId === row.id"
            @click="handleApprove(row)"
            >通过</el-button
          >
          <el-button size="small" @click="openDetail(row)">详情</el-button>
          <el-button
            type="danger"
            size="small"
            :loading="actionLoadingId === row.id"
            @click="handleReject(row)"
            >驳回</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-drawer v-model="detailVisible" title="AI推荐详情" size="520px">
    <div v-if="parsedRecipe" class="space-y-3 text-sm text-gray-700">
      <div><b>问题：</b>{{ detailRow?.queryText }}</div>
      <div><b>标题：</b>{{ parsedRecipe.title }}</div>
      <div><b>描述：</b>{{ parsedRecipe.desc }}</div>
      <div><b>标签：</b>{{ (parsedRecipe.tags || []).join(' / ') }}</div>
      <div>
        <b>步骤：</b>
        <div
          v-for="step in parsedRecipe.steps || []"
          :key="step.step"
          class="mt-1 text-gray-700"
        >
          {{ step.step }}. {{ step.content }}
        </div>
      </div>
    </div>
    <el-empty v-else description="recipeJson 解析失败或为空" />
  </el-drawer>
</template>
