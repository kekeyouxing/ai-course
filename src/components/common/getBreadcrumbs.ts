// utils/getBreadcrumbs.ts
import {RouteObject} from "react-router";

// 递归查找匹配路径段的路由
const findRouteByPathSegments = (
    routes: RouteObject[],
    targetSegments: string[]
): RouteObject | undefined => {
    // 深度优先搜索所有路由（包括嵌套路由）
    const searchRoutes = (routeList: RouteObject[]): RouteObject | undefined => {
        for (const route of routeList) {
            // 获取当前路由的 pathSegments（需在路由配置中显式声明）
            const routeSegments = route.handle?.pathSegments || [];

            // 检查是否匹配目标路径段
            if (
                routeSegments.length === targetSegments.length &&
                routeSegments.every((seg: string, i: number) => seg === targetSegments[i] || seg.startsWith(":"))
            ) {
                return route;
            }

            // 递归搜索子路由
            if (route.children) {
                const found = searchRoutes(route.children);
                if (found) return found;
            }
        }
        return undefined;
    };

    return searchRoutes(routes);
};

// 生成面包屑数据
export const getBreadcrumbs = (currentPath: string, routes: RouteObject[]) => {
    const segments = currentPath.split("/").filter(Boolean);
    const breadcrumbs = [];

    for (let i = 0; i < segments.length; i++) {
        const targetSegments = segments.slice(0, i + 1);
        const route = findRouteByPathSegments(routes, targetSegments);

        if (route?.handle?.breadcrumb) {
            breadcrumbs.push({
                title: typeof route.handle.breadcrumb === "function"
                    ? route.handle.breadcrumb({}) // 传入实际参数如果有需要
                    : route.handle.breadcrumb,
                path: `/${targetSegments.join("/")}`
            });
        }
    }

    return breadcrumbs;
};