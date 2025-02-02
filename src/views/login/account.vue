<template>
  <el-form ref="loginFormRef" :model="loginDto" :rules="loginRules" @keyup.enter="loginByAccount">
    <h1>Bryce Admin</h1>
    <h2>欢迎使用本系统</h2>
    <el-form-item prop="username">
      <el-input v-model="loginDto.username" :prefix-icon="User" placeholder="请输入账号"/>
    </el-form-item>
    <el-form-item prop="password">
      <el-input
        v-model="loginDto.password"
        type="password"
        :prefix-icon="Lock"
        placeholder="请输入密码"
        show-password
      />
    </el-form-item>
    <el-form-item v-if="captchaEnabled" prop="code" class="login-captcha">
      <el-input v-model="loginDto.code" placeholder="请输入验证码" :prefix-icon="Key" />
      <img :src="captchaBase64" alt="验证码" @click="handleCaptcha">
    </el-form-item>
    <el-form-item>
      <el-button class="w-100" type="primary" size="default" @click="loginByAccount()"
        >登录</el-button
      >
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import {User, Lock, Key} from '@element-plus/icons-vue'
import {onMounted, reactive, ref} from 'vue'
import { router } from '@/router'
import {useAuthStore} from "@/stores/auth";
import { generate, enabled} from "@/api/system/captcha";

const authStore = useAuthStore()

let loginFormRef = ref()
let loading = ref(false)

let loginDto = reactive({
  username: 'admin',
  password: '123456',
  key: '',
  code: ''
})
const captchaBase64 = ref()

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
    await handleCaptcha()
  }
}

/** 获取验证码 */
const handleCaptcha = async () => {
  const { data } = await generate()
  loginDto.key = data.key
  captchaBase64.value = data.image

}

/** 登录 */
const loginByAccount = async () => {
  loginFormRef.value.validate((valid: boolean) => {
    if(!valid) {
      return false
    }

    loading.value = true
    // 用户登录
    authStore
        .loginByAccount(loginDto)
        .then(() => {
          router.push({ path: '/' })
        })
        .catch((e: any) => {
          if(captchaEnabled.value) {
            handleCaptcha()
          }
          console.error(e)
        })
  })
}
const loginRules = {
  username: [
    { required: true, message: '必填项不能为空', trigger: 'blur' }
  ],
  password: [{ required: true, min: 6, max: 50, message: '密码长度在6到50之间', trigger: 'blur' }],
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

.login-captcha {
  :deep(.el-input) {
    width: 55%;
  }

  :deep(.el-form-item__content) {
    display: flex;
    justify-content: space-between !important;
  }

  img {
    width: 40%;
    height: 30px;
    cursor: pointer;
  }
}
</style>
