// src/api/axios.ts
import axios from 'axios'
import {useAuth} from '@/hooks/use-auth'

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE
})

// 请求拦截器
instance.interceptors.request.use(config => {
    const {token} = useAuth.getState()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// 响应拦截器（处理401错误）
instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Token过期处理
            useAuth.getState().logout()
            // 可以通过发布一个事件或设置全局状态来触发登录模态框
            const event = new CustomEvent('auth:unauthorized');
            window.dispatchEvent(event);
        }
        return Promise.reject(error)
    }
)

export default instance
