import {SidebarTrigger} from "@/components/ui/sidebar.tsx";
import {Separator} from "@radix-ui/react-separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb.tsx";
// import {useBreadcrumb} from "@/app/dashboard/breadcrumb-context.tsx";
import {useLocation} from "react-router-dom";
import React from "react";
import {getBreadcrumbs} from "@/components/getBreadcrumbs.ts";
import {routes} from "@/router.tsx";


export function HeaderBreadcrumb() {
    const location = useLocation();
    const breadcrumbs = getBreadcrumbs(location.pathname, routes);
    // // const {breadcrumbs} = useBreadcrumb()
    // const matches = useMatches() as Array<{
    //     pathname: string;
    //     params: Record<string, unknown>;
    //     handle?: { breadcrumb?: string | ((params: Record<string, unknown>) => string) }
    // }>;
    // // 从路由配置中提取面包屑数据
    // const breadcrumbs = matches
    //     .filter(match => Boolean(match.handle?.breadcrumb))
    //     .map(match => {
    //         const title = typeof match.handle?.breadcrumb === 'function'
    //             ? match.handle.breadcrumb(match.params)
    //             : match.handle?.breadcrumb;
    //         return {
    //             title: title,
    //             path: match.pathname
    //         };
    //     });
    return (
        <header
            className="p-4 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1"/>
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((item, index) => (
                            // 使用 Fragment 包裹每项，避免引入额外 DOM 节点
                            <React.Fragment key={item.path}>
                                <BreadcrumbItem>
                                    {index < breadcrumbs.length - 1 ? (
                                        <BreadcrumbLink href={item.path}>{item.title}</BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbLink>{item.title}</BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {/* 非最后一项时显示分隔符，且分隔符作为独立 <li> */}
                                {index < breadcrumbs.length - 1 && (
                                    <BreadcrumbSeparator/>
                                )}
                            </React.Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>

            </div>
        </header>
    )
}