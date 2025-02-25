// src/components/AuthRoute.tsx
import {JSX, useEffect} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {useAuth} from '@/hooks/use-auth'

export default function AuthRoute({children}: { children: JSX.Element }) {
    const {token} = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if (!token) {
            navigate('/login', {
                state: {from: location},
                replace: true
            })
        }
    }, [token, navigate, location])

    return token ? children : null
}
