// src/components/AuthRoute.tsx
import {JSX, useEffect, useState} from 'react'
import {useAuth} from '@/hooks/use-auth'
import LoginModal from "@/app/login-modal.tsx";
import {queryClient} from "@/lib/react-query.ts";
import {QueryClientProvider} from "@tanstack/react-query";
import { useUserInfo } from "@/hooks/use-user-info";

export default function AuthRoute({children}: { children: JSX.Element }) {
    const {token, isTokenExpired} = useAuth()
    const { userInfo, fetchUserInfo } = useUserInfo();
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    
    useEffect(() => {
        // 当有token但没有用户信息时，尝试获取用户信息
        const checkAuthAndFetchInfo = async () => {
            setIsCheckingAuth(true);
            if (token) {
                // 检查token是否过期
                if (isTokenExpired()) {
                    setShowLoginModal(true);
                } else if (!userInfo) {
                    // 有token但没有用户信息，尝试获取
                    try {
                        await fetchUserInfo();
                    } catch (error) {
                        console.error("获取用户信息失败:", error);
                        setShowLoginModal(true);
                    }
                }
            } else {
                setShowLoginModal(true);
            }
            setIsCheckingAuth(false);
        };

        checkAuthAndFetchInfo();
    }, [token, isTokenExpired, userInfo, fetchUserInfo]);

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
    
    // 如果正在检查权限，显示加载状态
    if (isCheckingAuth) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>;
    }

    return (
        <QueryClientProvider client={queryClient}>
            {token && !isTokenExpired() ? children : null}
            <LoginModal
                isOpen={showLoginModal}
                onSuccess={handleLoginSuccess}
                onClose={() => {
                    setShowLoginModal(false);
                    // 未登录时重定向到首页
                    if (!token) {
                        window.location.href = "/";
                    }
                }}
            />
        </QueryClientProvider>
    );
}