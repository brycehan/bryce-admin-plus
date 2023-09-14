import { defineStore } from 'pinia'
import { login, currentUser, logout } from '@/api/auth'
import storage from '@/utils/storage'
import type { Auth } from '@/api/auth'
export const authStore = defineStore('authStore', {
  state: () => ({
    // 用户信息
    user: {
      id: '',
      username: '',
      avatar: ''
    },
    // 权限集合
    authoritySet: [],
    // 访问token
    token: storage.getToken()
  }),
  actions: {
    removeToken() {
      this.token = null
      storage.removeToken()
    },
    /** 账号登录 */
    async login(loginDto: Auth.LoginDto) {
      const { code, data, message } = await login(loginDto)
      if (code == 200) {
        this.token = (data as Auth.LoginVo).token as string
        storage.setToken(this.token)
      } else {
        return Promise.reject(message)
      }
    },
    /** 获取登录用户信息 */
    async currentUser() {
      const { data } = await currentUser()
      this.user = data
    },
    /** 获取权限 */
    async getAuthoritySet() {

    },
    /** 用户退出 */
    async logout() {
      await logout()
      storage.removeToken()
    }
  }
})
