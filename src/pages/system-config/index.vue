<script setup lang="ts">
import {
  getSystemConfigApi,
  saveSystemConfigApi,
  type RecommendMenuItem,
  type SystemConfig
} from '@/api/system-config'
import { MIN_LOADING_MS } from '@/utils/constants'
import { onMounted, ref } from 'vue'

const loading = ref(false)
const saving = ref(false)

const form = ref<SystemConfig>({
  noticeText: '',
  servicePhone: '',
  serviceWechat: '',
  serviceHours: '',
  serviceTerms: '',
  recommendMenus: []
})

const addMenuItem = () => {
  const nextSort =
    form.value.recommendMenus.reduce((max, item) => Math.max(max, item.sort || 0), 0) + 1
  form.value.recommendMenus.push({
    name: '新菜单',
    value: 'custom',
    icon: 'fire-filled',
    iconColor: '#F08800',
    bg: 'bg-orange-100',
    color: 'text-orange-600',
    enabled: true,
    sort: nextSort
  })
}

const removeMenuItem = (index: number) => {
  form.value.recommendMenus.splice(index, 1)
}

const load = async () => {
  loading.value = true
  const start = performance.now()

  try {
    const res = await getSystemConfigApi()
    if (res.code !== 200 || !res.data) {
      throw new Error(res.message || '加载配置失败')
    }
    form.value = { ...res.data }
  } catch (error: any) {
    ElMessage.error(error?.message || '加载配置失败')
  } finally {
    const elapsed = performance.now() - start
    const remain = MIN_LOADING_MS - elapsed
    if (remain > 0) {
      await new Promise((resolve) => setTimeout(resolve, remain))
    }
    loading.value = false
  }
}

const save = async () => {
  saving.value = true
  try {
    const payload: SystemConfig = {
      noticeText: form.value.noticeText?.trim() || '',
      servicePhone: form.value.servicePhone?.trim() || '',
      serviceWechat: form.value.serviceWechat?.trim() || '',
      serviceHours: form.value.serviceHours?.trim() || '',
      serviceTerms: form.value.serviceTerms?.trim() || '',
      recommendMenus: (form.value.recommendMenus || []).map(
        (item: RecommendMenuItem) => ({
          name: item.name?.trim() || '',
          value: item.value?.trim() || '',
          icon: item.icon?.trim() || 'fire-filled',
          iconColor: item.iconColor?.trim() || '#F08800',
          bg: item.bg?.trim() || 'bg-orange-100',
          color: item.color?.trim() || 'text-orange-600',
          enabled: item.enabled !== false,
          sort: Number(item.sort || 0)
        })
      )
    }
    const res = await saveSystemConfigApi(payload)
    if (res.code !== 200) {
      throw new Error(res.message || '保存失败')
    }
    ElMessage.success('保存成功')
    await load()
  } catch (error: any) {
    ElMessage.error(error?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="p-4">
    <h2 class="mb-4 text-xl font-semibold">通知与客服配置</h2>

    <el-card shadow="never" v-loading="loading">
      <el-form label-position="top">
        <el-form-item label="首页公告文案">
          <el-input
            v-model="form.noticeText"
            type="textarea"
            :rows="2"
            maxlength="120"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="客服电话">
          <el-input v-model="form.servicePhone" maxlength="20" />
        </el-form-item>
        <el-form-item label="客服微信">
          <el-input v-model="form.serviceWechat" maxlength="40" />
        </el-form-item>
        <el-form-item label="服务时间">
          <el-input v-model="form.serviceHours" maxlength="40" />
        </el-form-item>
        <el-form-item label="服务条款说明">
          <el-input
            v-model="form.serviceTerms"
            type="textarea"
            :rows="3"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="首页推荐菜单（分类）">
          <div class="w-full space-y-2">
            <el-button type="primary" plain @click="addMenuItem"
              >新增菜单项</el-button
            >
            <el-table :data="form.recommendMenus" border>
              <el-table-column label="显示" width="80" align="center">
                <template #default="{ row }">
                  <el-switch v-model="row.enabled" />
                </template>
              </el-table-column>
              <el-table-column label="排序" width="100">
                <template #default="{ row }">
                  <el-input-number v-model="row.sort" :min="0" :max="999" />
                </template>
              </el-table-column>
              <el-table-column label="标题" min-width="120">
                <template #default="{ row }">
                  <el-input v-model="row.name" placeholder="如：蔬菜" />
                </template>
              </el-table-column>
              <el-table-column label="值" min-width="120">
                <template #default="{ row }">
                  <el-input v-model="row.value" placeholder="如：vegetable" />
                </template>
              </el-table-column>
              <el-table-column label="图标" min-width="120">
                <template #default="{ row }">
                  <el-input v-model="row.icon" placeholder="uni-icons type" />
                </template>
              </el-table-column>
              <el-table-column label="图标色" min-width="120">
                <template #default="{ row }">
                  <el-input v-model="row.iconColor" placeholder="#16a34a" />
                </template>
              </el-table-column>
              <el-table-column label="背景样式" min-width="140">
                <template #default="{ row }">
                  <el-input v-model="row.bg" placeholder="bg-green-100" />
                </template>
              </el-table-column>
              <el-table-column label="文字样式" min-width="140">
                <template #default="{ row }">
                  <el-input v-model="row.color" placeholder="text-green-600" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="90" align="center">
                <template #default="{ $index }">
                  <el-button type="danger" link @click="removeMenuItem($index)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
            <div class="text-xs text-gray-500">
              说明：value 用于前台分类过滤，icon 使用 uni-icons type。
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="save"
            >保存配置</el-button
          >
          <el-button @click="load">重新加载</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
