import {AppSidebar} from "@/components/app-sidebar"

import {SidebarInset, SidebarProvider,} from "@/components/ui/sidebar"
import {Outlet} from "react-router-dom";
import {HeaderBreadcrumb} from "@/components/header-breadcrumb.tsx";

export default function Page() {
    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <div className="flex flex-col h-screen">
                    <HeaderBreadcrumb/>
                    <div className="flex flex-1 overflow-auto flex-col gap-4 p-4 pt-0">
                        <Outlet/>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
