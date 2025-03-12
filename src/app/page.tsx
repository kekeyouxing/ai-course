import {AppSidebar} from "@/components/layout/app-sidebar"

import {SidebarInset, SidebarProvider,} from "@/components/ui/sidebar"
import {Outlet} from "react-router-dom";
import {HeaderBreadcrumb} from "@/components/layout/header-breadcrumb";

export default function Page() {
    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <div className="flex flex-col h-screen min-h-0">
                    <HeaderBreadcrumb/>
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 min-h-0">
                        <Outlet/>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
