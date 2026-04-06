<script setup lang="ts">
import {
  createProductApi,
  getProductListApi,
  type ProductItem,
  type ProductPayload,
  updateProductApi,
  updateProductStatusApi,
  updateProductStockApi
} from '@/api/product'
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

const loading = ref(false)
const submitting = ref(false)
const errorMsg = ref('')
const keyword = ref('')
const statusFilter = ref<number | undefined>(undefined)
const list = ref<ProductItem[]>([])
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)

const form = reactive<ProductPayload>({
  name: '',
  category: 'vegetable',
  price: 0,
  groupPrice2: null,
  groupPrice3: null,
  stock: 0,
  images: '',
  status: 1
})

const categoryOptions = [
  { label: '蔬菜', value: 'vegetable' },
  { label: '水果', value: 'fruit' },
  { label: '肉类', value: 'meat' },
  { label: '海鲜', value: 'seafood' }
]

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
  const target = categoryOptions.find((x) => x.value === val)
  return target?.label || val || '未分类'
}

const resetForm = () => {
  form.name = ''
  form.category = 'vegetable'
  form.price = 0
  form.groupPrice2 = null
  form.groupPrice3 = null
  form.stock = 0
  form.images = ''
  form.status = 1
}

const fillForm = (row: ProductItem) => {
  form.name = row.name || ''
  form.category = row.category || 'vegetable'
  form.price = toNumber(row.price)
  form.groupPrice2 = row.groupPrice2 == null ? null : toNumber(row.groupPrice2)
  form.groupPrice3 = row.groupPrice3 == null ? null : toNumber(row.groupPrice3)
  form.stock = toNumber(row.stock)
  form.images = row.images || ''
  form.status = Number(row.status) === 1 ? 1 : 0
}

const load = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await getProductListApi(undefined, statusFilter.value)
    if (res.code !== 200) throw new Error(res.message || '加载失败')
    list.value = res.data || []
  } catch (error: any) {
    errorMsg.value = error?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await getProductListApi(keyword.value.trim() || undefined, statusFilter.value)
    if (res.code !== 200) throw new Error(res.message || '加载失败')
    list.value = res.data || []
  } catch (error: any) {
    errorMsg.value = error?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

const openEdit = (row: ProductItem) => {
  editingId.value = row.id
  fillForm(row)
  dialogVisible.value = true
}

const submit = async () => {
  if (!form.name.trim()) {
    ElMessage.warning('请输入商品名称')
    return
  }
  if (form.stock < 0) {
    ElMessage.warning('库存不能小于0')
    return
  }
  submitting.value = true
  try {
    const payload: ProductPayload = {
      ...form,
      price: Number(form.price),
      groupPrice2: form.groupPrice2 == null ? null : Number(form.groupPrice2),
      groupPrice3: form.groupPrice3 == null ? null : Number(form.groupPrice3),
      stock: Number(form.stock),
      status: Number(form.status) === 1 ? 1 : 0
    }
    const res = editingId.value
      ? await updateProductApi(editingId.value, payload)
      : await createProductApi(payload)
    if (res.code !== 200) throw new Error(res.message || '保存失败')
    ElMessage.success(editingId.value ? '商品更新成功' : '商品创建成功')
    dialogVisible.value = false
    await load()
  } catch (error: any) {
    ElMessage.error(error?.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

const toggleStatus = async (row: ProductItem) => {
  const nextStatus = Number(row.status) === 1 ? 0 : 1
  try {
    const res = await updateProductStatusApi(row.id, nextStatus)
    if (res.code !== 200) throw new Error(res.message || '状态更新失败')
    row.status = nextStatus
    ElMessage.success(nextStatus === 1 ? '商品已上架' : '商品已下架')
  } catch (error: any) {
    ElMessage.error(error?.message || '状态更新失败')
  }
}

const adjustStock = async (row: ProductItem) => {
  const value = window.prompt('请输入最新库存', String(toNumber(row.stock)))
  if (value === null) return
  const stock = Number(value)
  if (!Number.isFinite(stock) || stock < 0) {
    ElMessage.warning('库存必须是大于等于0的数字')
    return
  }
  try {
    const res = await updateProductStockApi(row.id, stock)
    if (res.code !== 200) throw new Error(res.message || '库存更新失败')
    row.stock = stock
    ElMessage.success('库存更新成功')
  } catch (error: any) {
    ElMessage.error(error?.message || '库存更新失败')
  }
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
      <el-select
        v-model="statusFilter"
        placeholder="状态筛选"
        clearable
        style="width: 140px"
      >
        <el-option :value="1" label="上架" />
        <el-option :value="0" label="下架" />
      </el-select>
      <el-button type="primary" :loading="loading" @click="handleSearch">查询</el-button>
      <el-button @click="load">重置</el-button>
      <el-button type="success" @click="openCreate">新增商品</el-button>
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
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" @click="adjustStock(row)">改库存</el-button>
          <el-button
            size="small"
            :type="Number(row.status) === 1 ? 'warning' : 'success'"
            @click="toggleStatus(row)"
          >
            {{ Number(row.status) === 1 ? '下架' : '上架' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑商品' : '新增商品'"
      width="560px"
      destroy-on-close
    >
      <div class="grid grid-cols-2 gap-3">
        <el-input v-model="form.name" placeholder="商品名称" />
        <el-select v-model="form.category" placeholder="分类">
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-input-number v-model="form.price" :precision="2" :min="0" class="w-full" />
        <el-input-number v-model="form.stock" :min="0" class="w-full" />
        <el-input-number
          v-model="form.groupPrice2"
          :precision="2"
          :min="0"
          class="w-full"
          placeholder="2人团价"
        />
        <el-input-number
          v-model="form.groupPrice3"
          :precision="2"
          :min="0"
          class="w-full"
          placeholder="3人团价"
        />
        <el-select v-model="form.status" placeholder="状态">
          <el-option :value="1" label="上架" />
          <el-option :value="0" label="下架" />
        </el-select>
        <el-input v-model="form.images" placeholder="图片地址（可选）" />
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
