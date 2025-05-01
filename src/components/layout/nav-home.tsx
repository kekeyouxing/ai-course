import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from "@/components/ui/sidebar"
import { Link } from "react-router-dom"

export function NavHome() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Link to="/">
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <div className="grid flex-1 text-left leading-tight">
                            <span className="truncate font-bold text-lg">
                                VideoAI
                            </span>
                        </div>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
