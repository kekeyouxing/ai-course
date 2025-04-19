import {Briefcase, CreditCard, Home, Users, Zap} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import {NavHome} from "@/components/layout/nav-home";
import {useBreadcrumb} from "@/app/breadcrumb-context.tsx";
import {useNavigate} from "react-router-dom";
import {NavUser} from "@/components/layout/nav-user";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import SubscriptionModal from "@/components/subscription/subscription-modal";
import VideoPackModal from "@/components/videopack/videopack-modal";
// import { UserResourceInfo } from "@/components/layout/user-resource-info";

// Menu items.
const items = [
    {
        title: "主页",
        url: "/home",
        icon: Home,
    },
    {
        title: "虚拟形象",
        url: "/videolab",
        icon: Users,
    },
    {
        title: "项目详情",
        url: "/projects",
        icon: Briefcase,
    },
]

export function AppSidebar() {
    const navigate = useNavigate()
    const {setBreadcrumbs} = useBreadcrumb()
    const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
    const [videoPackModalOpen, setVideoPackModalOpen] = useState(false);

    const handleNavigation = (path: string, title: string) => {
        // 更新面包屑
        setBreadcrumbs([
            {title, path}
        ])
        // 导航到目标页面
        navigate(path)
    }

    return (
        <>
            <Sidebar>
                <SidebarHeader>
                    <NavHome/>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>应用</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            onClick={(e) => {
                                                e.preventDefault() // 阻止默认行为
                                                handleNavigation(item.url, item.title)
                                            }}
                                        >
                                            {/* 使用 div 替代 a 标签 */}
                                            <div className="flex items-center gap-2 p-2 hover:bg-accent">
                                                <item.icon className="h-4 w-4"/>
                                                <span className="text-sm">{item.title}</span>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}

                                {/* 用户资源信息 */}
                                {/* <SidebarMenuItem>
                                    <div className="px-2 pt-4 pb-2">
                                        <UserResourceInfo 
                                            setSubscriptionModalOpen={setSubscriptionModalOpen}
                                            setVideoPackModalOpen={setVideoPackModalOpen}
                                        />
                                    </div>
                                </SidebarMenuItem> */}

                                {/* 订阅项 - 固定的侧边栏项，带有按钮，不导航 */}
                                <SidebarMenuItem>
                                    <div className="flex items-center justify-between p-2 hover:bg-accent">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" />
                                            <span className="text-sm">会员订阅</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 px-2 text-xs bg-blue-50 text-blue-500 border-blue-100 flex items-center gap-1"
                                            onClick={() => setSubscriptionModalOpen(true)}
                                        >
                                            订阅
                                            <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center">
                                                <Zap className="h-2.5 w-2.5 text-white" />
                                            </div>
                                        </Button>
                                    </div>
                                </SidebarMenuItem>

                                {/* 视频包充值项 */}
                                <SidebarMenuItem>
                                    <div className="flex items-center justify-between p-2 hover:bg-accent">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4" />
                                            <span className="text-sm">套餐充值</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 px-2 text-xs bg-yellow-50 text-yellow-500 border-yellow-100 flex items-center gap-1"
                                            onClick={() => setVideoPackModalOpen(true)}
                                        >
                                            充值
                                            <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 flex items-center justify-center">
                                                <Zap className="h-2.5 w-2.5 text-white" />
                                            </div>
                                        </Button>
                                    </div>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <NavUser/>
                </SidebarFooter>
                <SidebarRail/>
            </Sidebar>
            
            {/* 修改SubscriptionModal，由外部控制打开状态 */}
            <SubscriptionModal 
                open={subscriptionModalOpen}
                onOpenChange={setSubscriptionModalOpen}
            />
            
            {/* 视频包模态框 */}
            <VideoPackModal 
                open={videoPackModalOpen}
                onOpenChange={setVideoPackModalOpen}
            />
        </>
    )
}
