<script setup lang="ts">
import {
  getOrderListApi,
  updateOrderStatusApi,
  type OrderItem
} from '@/api/order'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const MIN_LOADING_MS = 500

const route = useRoute()
const statusFilter = ref<number | null>(null)
const list = ref<OrderItem[]>([])
const loading = ref(false)
const errorMsg = ref('')
const queryUserId = ref<number>(1)

const displayList = computed(() => {
  if (statusFilter.value === null) return list.value
  return list.value.filter((item) => item.status === statusFilter.value)
})

const handleSearch = async () => {
  statusFilter.value = null
  await load()
}

const getStatusMeta = (status: number) => {
  if (status === 1) return { label: '待成团', type: 'warning' as const }
  if (status === 2) return { label: '已成团', type: 'primary' as const }
  if (status === 3) return { label: '已取货', type: 'success' as const }
  if (status === -1) return { label: '已取消', type: 'info' as const }
  return { label: '未知', type: 'info' as const }
}

const getNextStatus = (status: number) => {
  if (status === 1) return 2
  if (status === 2) return 3
  return null
}

const getNextStatusText = (status: number) => {
  const next = getNextStatus(status)
  if (next === 2) return '标记已成团'
  if (next === 3) return '标记已取货'
  return ''
}

const handleUpdateStatus = async (row: OrderItem) => {
  const next = getNextStatus(row.status)
  if (!next) return

  try {
    const res = await updateOrderStatusApi(row.id, next)
    if (res.code !== 200) throw new Error(res.message || '更新失败')
    await load()
  } catch (error: any) {
    ElMessage.error(error?.message || '更新失败')
  }
}

const load = async () => {
  loading.value = true
  errorMsg.value = ''
  const start = performance.now()

  try {
    const res = await getOrderListApi(queryUserId.value)
    if (res.code !== 200) throw new Error(res.message || '加载失败')
    list.value = res.data || []
  } catch (error: any) {
    errorMsg.value = error?.message || '加载失败'
  } finally {
    const elapse = performance.now() - start
    const remain = MIN_LOADING_MS - elapse
    if (remain > 0) {
      await new Promise((resolve) => setTimeout(resolve, remain))
    }
    loading.value = false
  }
}

onMounted(() => {
  const q = Number(route.query.status)
  if ([1, 2, 3, -1].includes(q)) statusFilter.value = q
  load()
})
</script>

<template>
  <div class="p-4">
    <h2 class="mb-3 flex items-center gap-2">
      订单管理
      <span class="text-sm text-gray-500">共 {{ displayList.length }} 条</span>
    </h2>

    <div class="mb-3 flex items-center gap-2">
      <el-select
        v-model="statusFilter"
        placeholder="按状态筛选"
        style="width: 180px"
      >
        <el-option label="待成团" :value="1" />
        <el-option label="已成团" :value="2" />
        <el-option label="已取货" :value="3" />
        <el-option label="已取消" :value="-1" />
      </el-select>
      <el-button @click="statusFilter = null">清除筛选</el-button>
    </div>
    <div class="mb-3 flex items-center gap-2">
      <el-input-number v-model="queryUserId" :min="1" />
      <el-button
        type="primary"
        :loading="loading"
        :disabled="loading"
        @click="handleSearch"
        >查询</el-button
      >
    </div>

    <el-alert
      v-if="errorMsg"
      type="error"
      :title="errorMsg"
      show-icon
      closable
      class="mb-3"
    />

    <el-table v-loading="loading" :data="displayList" border class="w-full">
      <el-table-column prop="no" label="订单号" min-width="180" />
      <el-table-column prop="name" label="商品" min-width="160" />
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusMeta(row.status).type">
            {{ getStatusMeta(row.status).label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="金额" min-width="100">
        <template #default="{ row }">￥{{ row.price }}</template>
      </el-table-column>
      <el-table-column prop="createTime" label="下单时间" min-width="180" />
      <el-table-column label="操作" width="140" align="center">
        <template #default="{ row }">
          <el-button
            v-if="getNextStatus(row.status)"
            type="primary"
            size="small"
            @click="handleUpdateStatus(row)"
          >
            {{ getNextStatusText(row.status) }}
          </el-button>
          <span v-else class="text-gray-400">--</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
