// src/components/AuthRoute.tsx
import {JSX, useEffect, useState} from 'react'
import {useAuth} from '@/hooks/use-auth'
import {queryClient} from "@/lib/react-query.ts";
import {QueryClientProvider} from "@tanstack/react-query";
import { useUserInfo } from "@/hooks/use-user-info";
import { useNavigate, useLocation } from "react-router-dom";

export default function AuthRoute({children}: { children: JSX.Element }) {
    const {token, isTokenExpired} = useAuth()
    const { userInfo, fetchUserInfo } = useUserInfo();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        // 当有token但没有用户信息时，尝试获取用户信息
        const checkAuthAndFetchInfo = async () => {
            setIsCheckingAuth(true);
            if (token) {
                // 检查token是否过期
                if (isTokenExpired()) {
                    redirectToLogin();
                } else if (!userInfo) {
                    // 有token但没有用户信息，尝试获取
                    try {
                        await fetchUserInfo();
                    } catch (error) {
                        console.error("获取用户信息失败:", error);
                        redirectToLogin();
                    }
                }
            } else {
                redirectToLogin();
            }
            setIsCheckingAuth(false);
        };

        checkAuthAndFetchInfo();
    }, [token, isTokenExpired, userInfo, fetchUserInfo]);

    // 监听 401 未授权事件
    useEffect(() => {
        const handleUnauthorized = () => {
            redirectToLogin();
        };
        
        window.addEventListener('auth:unauthorized', handleUnauthorized);
        
        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };
    }, []);

    // 重定向到登录页面，携带当前URL作为重定向目标
    const redirectToLogin = () => {
        const returnPath = encodeURIComponent(location.pathname + location.search);
        navigate(`/login?returnTo=${returnPath}`);
    };
    
    // 如果正在检查权限，显示加载状态
    if (isCheckingAuth) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>;
    }

    // 只有通过验证才渲染子组件
    return token && !isTokenExpired() ? (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    ) : null;
}