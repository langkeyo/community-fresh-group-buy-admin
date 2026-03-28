<script setup lang="ts">
import { getOrderListApi, type OrderItem } from '@/api/order'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const MIN_LOADING_MS = 500

const router = useRouter()
const loading = ref(false)
const errorMsg = ref('')
const list = ref<OrderItem[]>([])
const lastUpdatedAt = ref('')

const totalCount = computed(() => list.value.length)
const pendingCount = computed(
  () => list.value.filter((i) => i.status === 1).length
)
const groupedCount = computed(
  () => list.value.filter((i) => i.status === 2).length
)
const pickedCount = computed(
  () => list.value.filter((i) => i.status === 3).length
)
const latestOrders = computed(() => list.value.slice(0, 5))

const getStatusMeta = (status: number) => {
  if (status === 1) return { label: '待成团', type: 'warning' as const }
  if (status === 2) return { label: '已成团', type: 'primary' as const }
  if (status === 3) return { label: '已取货', type: 'success' as const }
  if (status === -1) return { label: '已取消', type: 'info' as const }
  return { label: '未知', type: 'info' as const }
}

const goOrder = (status?: number) => {
  if (status) {
    router.push({ path: '/order', query: { status: String(status) } })
  } else {
    router.push('/order')
  }
}

const load = async () => {
  loading.value = true
  errorMsg.value = ''
  const start = performance.now()

  try {
    performance.now()
    const res = await getOrderListApi(1) // 先固定 userId=1，后续再做筛选
    if (res.code !== 200) throw new Error(res.message || '加载失败')
    list.value = res.data || []
    lastUpdatedAt.value = new Date().toLocaleDateString()
  } catch (error: any) {
    errorMsg.value = error?.message || '加载失败'
  } finally {
    const elapsed = performance.now() - start
    const remain = MIN_LOADING_MS - elapsed
    if (remain > 0) {
      await new Promise((resolve) => setTimeout(resolve, remain))
    }
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="p-4">
    <h2 class="mb-4 text-xl font-semibold">仪表盘</h2>
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xs text-gray-400">最近刷新：{{ lastUpdatedAt }}</span>
      <el-button
        size="small"
        :loading="loading"
        :disabled="loading"
        @click="load"
        >刷新</el-button
      >
    </div>

    <el-alert
      v-if="errorMsg"
      type="error"
      :title="errorMsg"
      show-icon
      closable
      class="mb-4"
    />

    <div class="grid grid-cols-4 gap-4 mb-6">
      <el-card
        class="cursor-pointer border-slate-200 hover:text-white! hover:border-none! hover:bg-linear-to-r hover:from-slate-500 hover:to-slate-400 hover:-translate-y-1 transition-all duration-300"
        @click="goOrder()"
        ><div>订单总数：{{ totalCount }}</div></el-card
      >
      <el-card
        class="cursor-pointer border-orange-200 hover:text-white! hover:border-none! hover:bg-linear-to-r hover:from-orange-500 hover:to-amber-400 hover:-translate-y-1 transition-all duration-300"
        @click="goOrder(1)"
        ><div>待成团：{{ pendingCount }}</div></el-card
      >
      <el-card
        class="cursor-pointer border-blue-200 hover:text-white! hover:border-none! hover:bg-linear-to-r hover:from-blue-500 hover:to-cyan-400 hover:-translate-y-1 transition-all duration-300"
        @click="goOrder(2)"
        ><div>已成团：{{ groupedCount }}</div></el-card
      >
      <el-card
        class="cursor-pointer border-emerald-200 hover:text-white! hover:border-none! hover:bg-linear-to-r hover:from-emerald-500 hover:to-green-400 hover:-translate-y-1 transition-all duration-300"
        @click="goOrder(3)"
        ><div>已取货：{{ pickedCount }}</div></el-card
      >
    </div>

    <el-card>
      <template #header>最近订单（前5条）</template>
      <el-table v-loading="loading" :data="latestOrders" border>
        <el-table-column prop="no" label="订单号" min-width="180" />
        <el-table-column prop="name" label="商品" min-width="140" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusMeta(row.status).type">
              {{ getStatusMeta(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="金额" min-width="90">
          <template #default="{ row }"> ￥{{ row.price }} </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
