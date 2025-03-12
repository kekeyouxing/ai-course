import {create} from 'zustand'
import axios from 'axios'
import {jwtDecode} from 'jwt-decode'

interface JwtPayload {
    userID: string;
    avatar?: string;
    name?: string;
    exp?: number; // 过期时间戳
}

type AuthState = {
    token: string | null
    user: JwtPayload | null
    login: (token: string) => void
    logout: () => void
    isTokenExpired: () => boolean
}

// 安全解析 token
const safelyDecodeToken = (token: string | null): JwtPayload | null => {
    if (!token) return null;
    try {
        return jwtDecode<JwtPayload>(token);
    } catch (error) {
        console.error('解析 token 失败:', error);
        return null;
    }
}

export const useAuth = create<AuthState>((set, get) => ({
    token: localStorage.getItem('token'),
    user: safelyDecodeToken(localStorage.getItem('token')),

    login: (token) => {
        localStorage.setItem('token', token)
        axios.defaults.headers.common.Authorization = `Bearer ${token}`
        set({token, user: safelyDecodeToken(token)})
    },

    logout: () => {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common.Authorization
        set({token: null, user: null})
    },
    
    // 检查 token 是否过期
    isTokenExpired: () => {
        const { user } = get();
        if (!user || !user.exp) return true;
        
        // 将过期时间转换为毫秒并与当前时间比较
        // 提前 60 秒检测过期，避免边界情况
        return (user.exp * 1000) < (Date.now() + 60000);
    }
}))