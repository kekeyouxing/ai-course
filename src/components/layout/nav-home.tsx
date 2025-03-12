import {SidebarMenu, SidebarMenuButton, SidebarMenuItem,} from "@/components/ui/sidebar"

export function NavHome() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <div
                        className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                        {/*<activeTeam.logo className="size-4"/>*/}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      EchoClass
                    </span>
                        <span className="truncate text-xs">AI-Powered Lecture Architec</span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
