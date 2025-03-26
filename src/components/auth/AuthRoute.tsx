// src/components/AuthRoute.tsx
import {JSX, useEffect, useState} from 'react'
import {useLocation} from 'react-router-dom'
import {useAuth} from '@/hooks/use-auth'
import LoginModal from "@/app/login-modal.tsx";
import {queryClient} from "@/lib/react-query.ts";
import {QueryClientProvider} from "@tanstack/react-query";

export default function AuthRoute({children}: { children: JSX.Element }) {
    const location = useLocation()
    const {token, isTokenExpired, logout} = useAuth()
    const [showLoginModal, setShowLoginModal] = useState(false)
    
    useEffect(() => {
        // 检查是否有token以及token是否过期
        if (!token || isTokenExpired()) {
            // 如果token过期，先登出再显示登录模态框
            if (token && isTokenExpired()) {
                logout();
            }
            setShowLoginModal(true);
        } else {
            setShowLoginModal(false);
        }
    }, [token, isTokenExpired, logout, location.key]);

    // 监听 401 未授权事件
    useEffect(() => {
        const handleUnauthorized = () => {
            setShowLoginModal(true);
        };
        
        window.addEventListener('auth:unauthorized', handleUnauthorized);
        
        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };
    }, []);

    const handleLoginSuccess = () => {
        setShowLoginModal(false);
    };
    
    return (
        <QueryClientProvider client={queryClient}>
            {token && !isTokenExpired() ? children : null}
            <LoginModal
                isOpen={showLoginModal}
                onSuccess={handleLoginSuccess}
                onClose={() => {
                    setShowLoginModal(false)
                }}
            />
        </QueryClientProvider>
    );
}