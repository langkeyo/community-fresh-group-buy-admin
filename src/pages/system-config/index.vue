<script setup lang="ts">
import {
  getSystemConfigApi,
  saveSystemConfigApi,
  type SystemConfig
} from '@/api/system-config'
import { onMounted, ref } from 'vue'

const loading = ref(false)
const saving = ref(false)

const form = ref<SystemConfig>({
  noticeText: '',
  servicePhone: '',
  serviceWechat: '',
  serviceHours: '',
  serviceTerms: ''
})

const load = async () => {
  loading.value = true
  try {
    const res = await getSystemConfigApi()
    if (res.code !== 200 || !res.data) {
      throw new Error(res.message || '加载配置失败')
    }
    form.value = { ...res.data }
  } catch (error: any) {
    ElMessage.error(error?.message || '加载配置失败')
  } finally {
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
      serviceTerms: form.value.serviceTerms?.trim() || ''
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
