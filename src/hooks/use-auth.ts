import {create} from 'zustand'
import axios from 'axios'
import {jwtDecode} from 'jwt-decode'

type AuthState = {
    token: string | null
    user: { id: string } | null
    login: (token: string) => void
    logout: () => void
}

export const useAuth = create<AuthState>((set) => ({
    token: localStorage.getItem('token'),
    user: localStorage.getItem('token')
        ? jwtDecode(localStorage.getItem('token')!)
        : null,

    login: (token) => {
        localStorage.setItem('token', token)
        axios.defaults.headers.common.Authorization = `Bearer ${token}`
        set({token, user: jwtDecode(token)})
    },

    logout: () => {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common.Authorization
        set({token: null, user: null})
    }
}))
