<script setup lang="ts">
import {
  getOrderDetailApi,
  getOrderListApi,
  updateOrderStatusApi,
  type OrderItem
} from '@/api/order'
import { getPickPointListApi, type PickPointItem } from '@/api/pick-point'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const MIN_LOADING_MS = 500

const route = useRoute()
const statusFilter = ref<number | null>(null)
const pickPointFilter = ref<number | null>(null)
const timeRange = ref<[string, string] | []>([])
const pickPointOptions = ref<PickPointItem[]>([])
const list = ref<OrderItem[]>([])
const loading = ref(false)
const errorMsg = ref('')
const keyword = ref('')
const page = ref(1)
const pageSize = ref(10)
const updatingId = ref<string>('')
const detailVisible = ref(false)
const detailOrder = ref<OrderItem | null>(null)
const detailLoading = ref(false)

const pagedList = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value
  return displayList.value.slice(start, end)
})

const displayList = computed(() => {
  let data = list.value

  if (statusFilter.value !== null) {
    data = data.filter((item) => item.status === statusFilter.value)
  }

  const kw = keyword.value.trim()
  if (kw) {
    data = data.filter((item) => item.no.includes(kw) || item.name.includes(kw))
  }

  return data
})

const handlePageChange = (p: number) => {
  page.value = p
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  page.value = 1
}

watch([statusFilter, keyword, pickPointFilter, timeRange], () => {
  page.value = 1
})

const handleSearch = async () => {
  page.value = 1
  await load()
}

const handleClearFilters = () => {
  statusFilter.value = null
  pickPointFilter.value = null
  timeRange.value = []
}

const openDetail = async (row: OrderItem) => {
  detailLoading.value = true

  try {
    const res = await getOrderDetailApi(row.id)
    if (res.code !== 200 || !res.data)
      throw new Error(res.message || '加载详情失败')
    detailOrder.value = res.data
    detailVisible.value = true
  } catch (error: any) {
    ElMessage.error(error?.message || '加载详情失败')
  } finally {
    detailLoading.value = false
  }
}

const exportCsv = () => {
  const headers = [
    '订单号',
    '商品',
    '状态',
    '金额',
    '下单时间',
    '提货点',
    '提货地址'
  ]
  const rows = displayList.value.map((item) => [
    item.no,
    item.name,
    getStatusMeta(item.status).label,
    item.price,
    item.createTime,
    item.pickPointName,
    item.pickPointAddress
  ])

  const escapeCell = (v: unknown) => {
    const s = String(v ?? '')
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }

  const content = [headers, ...rows]
    .map((row) => row.map(escapeCell).join(','))
    .join('\n')

  const blob = new Blob(['\uFEFF' + content], {
    type: 'text/csv;charset=utf-8;'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `orders-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
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
  if (!next || updatingId.value) return

  const nextText = getNextStatusText(row.status)

  try {
    await ElMessageBox.confirm(
      `确认将订单 ${row.no} 状态更新为 【${nextText.replace('标记', '')}】吗？`,
      '状态确认',
      {
        type: 'warning',
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        showCancelButton: true,
        lockScroll: false
      }
    )

    updatingId.value = row.id
    const res = await updateOrderStatusApi(row.id, next)
    if (res.code !== 200) throw new Error(res.message || '更新失败')

    ElMessage.success('状态更新成功')
    await load()
  } catch (error: any) {
    // 用户主动取消不提示错误
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(error?.message || '更新失败')
  } finally {
    updatingId.value = ''
  }
}

const loadPickPoints = async () => {
  try {
    const res = await getPickPointListApi()
    if (res.code !== 200) throw new Error(res.message || '加载自提点失败')
    pickPointOptions.value = res.data || []
  } catch (error: any) {
    ElMessage.warning(error?.message || '加载自提点失败')
  }
}

const load = async (opts?: { keepPage?: boolean }) => {
  loading.value = true
  errorMsg.value = ''
  const start = performance.now()

  const prevPage = page.value

  try {
    const res = await getOrderListApi({
      status: statusFilter.value ?? undefined,
      pickPointId: pickPointFilter.value ?? undefined,
      startTime: timeRange.value[0] || undefined,
      endTime: timeRange.value[1] || undefined
    })
    if (res.code !== 200) throw new Error(res.message || '加载失败')
    list.value = res.data || []

    // 若不保留分页，默认回第一页
    if (!opts?.keepPage) {
      page.value = 1
    } else {
      // 保留分页时，防止删到空页
      const maxPage = Math.max(
        1,
        Math.ceil(displayList.value.length / pageSize.value)
      )
      if (prevPage > maxPage) page.value = maxPage
    }
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
  loadPickPoints()
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
        clearable
      >
        <el-option label="待成团" :value="1" />
        <el-option label="已成团" :value="2" />
        <el-option label="已取货" :value="3" />
        <el-option label="已取消" :value="-1" />
      </el-select>
      <el-select
        v-model="pickPointFilter"
        placeholder="按自提点筛选"
        style="width: 220px"
        clearable
      >
        <el-option
          v-for="item in pickPointOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-date-picker
        v-model="timeRange"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
      />
      <el-button @click="handleClearFilters">清空筛选</el-button>
    </div>
    <div class="mb-3 flex items-center gap-2">
      <el-input
        placeholder="搜索订单号/商品名"
        v-model="keyword"
        clearable
        style="width: 220px"
      />
      <el-button
        type="primary"
        :loading="loading"
        :disabled="loading"
        @click="handleSearch"
        >查询</el-button
      >
      <el-button @click="exportCsv">导出CVS</el-button>
    </div>

    <el-alert
      v-if="errorMsg"
      type="error"
      :title="errorMsg"
      show-icon
      closable
      class="mb-3"
    />

    <el-table v-loading="loading" :data="pagedList" border class="w-full">
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
            :loading="updatingId === row.id"
            :disabled="Boolean(updatingId) && updatingId !== row.id"
            @click="handleUpdateStatus(row)"
          >
            {{ getNextStatusText(row.status) }}
          </el-button>
          <el-button size="small" @click="openDetail(row)">详情</el-button>
          <!-- <span v-else class="text-gray-400">--</span> -->
        </template>
      </el-table-column>
    </el-table>

    <div class="mt-4 flex justify-end">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="displayList.length"
        :page-sizes="[5, 10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      ></el-pagination>
    </div>
  </div>

  <el-drawer
    title="Title"
    direction="rtl"
    show-close
    v-model="detailVisible"
    size="420px"
  >
    <div
      v-if="detailOrder"
      v-loading="detailLoading"
      class="space-y-3 text-sm text-black"
    >
      <div>订单号：{{ detailOrder.no }}</div>
      <div>商品：{{ detailOrder.name }}</div>
      <div>数量：{{ detailOrder.qty }}</div>
      <div>金额：￥{{ detailOrder.price }}</div>
      <div>状态：{{ getStatusMeta(detailOrder.status).label }}</div>
      <div>下单时间：{{ detailOrder.createTime }}</div>
      <div>提货点：{{ detailOrder.pickPointName }}</div>
      <div>地址：{{ detailOrder.pickPointAddress }}</div>
    </div>
  </el-drawer>
</template>
