import {Home, Plus, Video} from "lucide-react"
import {
    SidebarGroup,
    SidebarGroupContent, SidebarGroupLabel,
    SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem,
    // useSidebar,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom";
export function NavHome() {
    // const {isMobile} = useSidebar()

    return (
        <SidebarGroup>
            <SidebarGroupLabel className="text-xl font-bold text-left ">EchoClass</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link to="/home">
                                <Home />
                                <span>主页</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton  asChild>
                            <Link to="/uploadvideo">
                                <Video />
                                <span>上传视频</span>
                            </Link>
                        </SidebarMenuButton>
                        <SidebarMenuAction>
                            <Plus /> <span className="sr-only">Add Project</span>
                        </SidebarMenuAction>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
