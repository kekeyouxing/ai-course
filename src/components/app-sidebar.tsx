import {Briefcase, Home, Users} from "lucide-react"

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
import {NavHome} from "@/components/nav-home.tsx";
import {useBreadcrumb} from "@/app/breadcrumb-context.tsx";
import {useNavigate} from "react-router-dom";
import {NavUser} from "@/components/nav-user.tsx";

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
}
// Menu items.
const items = [
    {
        title: "主页",
        url: "/home",
        icon: Home,
    },
    {
        title: "我的数字人",
        url: "/videolab",
        icon: Users,
    },
    {
        title: "项目详情",
        url: "/projects",
        icon: Briefcase,
    },
    // {
    //     title: "价格",
    //     url: "/appprice",
    //     icon: ShoppingCart,
    // },
]

export function AppSidebar() {
    const navigate = useNavigate()
    const {setBreadcrumbs} = useBreadcrumb()

    const handleNavigation = (path: string, title: string) => {
        // 更新面包屑
        setBreadcrumbs([
            // {title: "首页", path: "/"},
            {title, path}
        ])
        // 导航到目标页面
        navigate(path)
    }

    return (
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
                                            <item.icon/>
                                            <span>{item.title}</span>
                                        </div>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user}/>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
