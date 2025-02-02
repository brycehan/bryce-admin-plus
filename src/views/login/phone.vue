<template>
  <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" @keyup.enter="loginByPhone">
    <h1>Bryce Admin</h1>
    <h2>欢迎使用本系统</h2>
    <el-form-item prop="phone">
      <el-input v-model="loginForm.phone" prefix-icon="Iphone" placeholder="请输入手机号" />
    </el-form-item>
    <el-form-item prop="code" class="login-code">
      <el-input v-model="loginForm.code" prefix-icon="Key" placeholder="请输入验证码" />
      <el-button v-if="!sms.disabled" @click="sendCode">发送验证码</el-button>
      <el-button v-else disabled>{{ sms.count }} 秒后重新发送</el-button>
    </el-form-item>
    <el-form-item>
      <el-button class="w-100" type="primary" size="default" @click="loginByPhone()">登录</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import {useAuthStore} from "@/stores/auth";
import {onMounted, reactive, ref} from 'vue'
import { router } from '@/router'
import { enabled} from "@/api/system/captcha";
import { sendLoginCode} from "@/api/system/sms";
import {phoneRegExp} from "@/utils/tool";
import {ElMessage} from "element-plus";

const authStore = useAuthStore()

let loginFormRef = ref()
let loading = ref(false)

const loginForm = reactive({
  phone: '15853155402',
  code: '',
})

/** 短信计时器 */
const sms = reactive({
  disabled: false,
  total: 60,
  count: 0
})

/** 发送验证码 */
const sendCode = () => {
  if(!phoneRegExp.test(loginForm.phone)) {
    ElMessage.error('请输入正确的手机号')
    return
  }

  sendLoginCode(loginForm.phone).then(() => {
    handleCounter()
  })
}
/** 计时处理器 */
const handleCounter = () => {
  sms.count = sms.total
  sms.disabled = true
  const timer = setInterval(() => {
    if(sms.count > 1 && sms.count <= sms.total) {
      sms.count--
    } else {
      sms.disabled = false
      clearInterval(timer)
    }
  }, 1000)
}

// 是否显示验证码
const captchaEnabled = ref(false)

onMounted(() => {
  handleCaptchaEnabled()
})

/** 获取验证码开关 */
const handleCaptchaEnabled = async () => {
  const { data } = await enabled()
  captchaEnabled.value = data
  if(captchaEnabled.value) {
    // await handleCaptcha()
  }
}

/** 登录 */
const loginByPhone = async () => {
  loginFormRef.value.validate((valid: boolean) => {
    if(!valid) {
      return false
    }

    loading.value = true
    // 用户登录
    authStore
        .loginByPhone(loginForm)
        .then(() => {
          router.push({ path: '/' })
        })
        .catch((e: any) => {
          console.error(e)
        })
  })
}
const loginRules = {
  phone: [
    { required: true, message: '必填项不能为空', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '必填项不能为空', trigger: 'blur' }
  ],
}
</script>

<style scoped lang="scss">
h1 {
  color: white;
  font-size: 40px;
}

h2 {
  color: white;
  font-size: 20px;
  margin: 20px 0;
}

.login-code {

  :deep(.el-input) {
    width: 240px;
  }

  :deep(.el-button) {
    width: 150px;
  }

  :deep(.el-form-item__content) {
    display: flex;
    justify-content: space-between !important;
  }
}
</style>
