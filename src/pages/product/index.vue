<script setup lang="ts">
import { getProductListApi, type ProductItem } from '@/api/product'
import { computed, onMounted, ref } from 'vue'

const loading = ref(false)
const errorMsg = ref('')
const keyword = ref('')
const list = ref<ProductItem[]>([])

const displayList = computed(() => {
  const kw = keyword.value.trim()
  if (!kw) return list.value
  return list.value.filter((item) => item.name.includes(kw))
})

const toNumber = (val?: number | string | null) => {
  if (val === null || val === undefined || val === '') return 0
  const num = Number(val)
  return Number.isFinite(num) ? num : 0
}

const getCategoryLabel = (val: string) => {
  if (val === 'vegetable') return '蔬菜'
  if (val === 'fruit') return '水果'
  if (val === 'meat') return '肉类'
  if (val === 'seafood') return '海鲜'
  return val || '未分类'
}

const load = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await getProductListApi(keyword.value.trim() || undefined)
    if (res.code !== 200) throw new Error(res.message || '加载失败')
    list.value = res.data || []
  } catch (error: any) {
    errorMsg.value = error?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  await load()
}

onMounted(load)
</script>

<template>
  <div class="p-4">
    <h2 class="mb-3 flex items-center gap-2">
      商品管理
      <span class="text-sm text-gray-500">共 {{ displayList.length }} 条</span>
    </h2>

    <div class="mb-3 flex items-center gap-2">
      <el-input
        placeholder="搜索商品名称"
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
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="商品名称" min-width="160" />
      <el-table-column prop="category" label="分类" min-width="100">
        <template #default="{ row }">
          {{ getCategoryLabel(row.category) }}
        </template>
      </el-table-column>
      <el-table-column prop="price" label="单买价" min-width="100">
        <template #default="{ row }">￥{{ toNumber(row.price).toFixed(2) }}</template>
      </el-table-column>
      <el-table-column prop="groupPrice2" label="2人团价" min-width="100">
        <template #default="{ row }">
          ￥{{ toNumber(row.groupPrice2 || row.price).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="groupPrice3" label="3人团价" min-width="100">
        <template #default="{ row }">
          ￥{{ toNumber(row.groupPrice3 || row.price).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" min-width="80">
        <template #default="{ row }">{{ toNumber(row.stock) }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="80">
        <template #default="{ row }">
          <el-tag :type="Number(row.status) === 1 ? 'success' : 'info'">
            {{ Number(row.status) === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
