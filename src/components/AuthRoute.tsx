// src/components/AuthRoute.tsx
import {JSX, useEffect, useState} from 'react'
import {useLocation} from 'react-router-dom'
import {useAuth} from '@/hooks/use-auth'
import LoginModal from "@/app/login-modal.tsx";
import {queryClient} from "@/lib/react-query.ts";
import {QueryClientProvider} from "@tanstack/react-query";

export default function AuthRoute({children}: { children: JSX.Element }) {
    const location = useLocation()
    const {token} = useAuth()
    const [showLoginModal, setShowLoginModal] = useState(false)
    useEffect(() => {
        setShowLoginModal(!token); // 自动同步登录状态与模态框状态
    }, [token, location.key]);

    const handleLoginSuccess = () => {
        setShowLoginModal(false);
    };
    return (
        <QueryClientProvider client={queryClient}>
            {token ? children : null}
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
