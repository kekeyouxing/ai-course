import Page from "@/app/page";
import VideoLabPage from "@/app/video-lab-page";
import VideoUploadPage from "@/app/video-upload-page.tsx";
import {RouteObject} from "react-router";
import {PricePage} from "@/app/price-page";
import NotFound from "@/app/404-page.tsx";
import HomePage from "@/app/home-page.tsx";
import AuthRoute from "@/components/AuthRoute.tsx";
import ProjectCollectionPage from "@/app/ProjectCollectionPage.tsx";
import ProjectDetailPage from "@/app/project-detail-page.tsx";

export const routes: RouteObject[] = [
    {
        path: "/",
        element: <Page/>,
        children: [
            {
                path: "home",
                // element:<HomePage/>,
                element: <AuthRoute key={Date.now()}><HomePage/></AuthRoute>,
                handle: {
                    breadcrumb: "主页", // 面包屑标题
                    pathSegments: ["home"] // 标记路径层级
                }
            },
            {
                path: "videolab",
                element: <VideoLabPage/>,
                handle: {
                    breadcrumb: "角色库",
                    pathSegments: ["videolab"] // 明确层级关系
                }
            },
            {
                path: "videolab/videoupload", // 独立路径
                element: <VideoUploadPage/>, // 独立页面
                handle: {
                    breadcrumb: "自定义角色",
                    pathSegments: ["videolab", "videoupload"] // 明确层级关系
                }
            },
            {
                path: "appprice",
                element: <PricePage/>,
                handle: {
                    breadcrumb: "价格",
                    pathSegments: ["appprice"] // 明确层级关系
                }
            },
            {
                path: "projects",
                element: <ProjectCollectionPage/>,
                handle: {
                    breadcrumb: "项目",
                    pathSegments: ["projects"] // 明确层级关系
                }
            },
            {
                path: "projects/:id", // 独立路径
                element: <ProjectDetailPage/>, // 独立页面
                handle: {
                    breadcrumb: "项目详情",
                    pathSegments: ["projects", ":id"] // 明确层级关系
                }
            },
        ]
    },
    {
        path: "price",
        element: <PricePage/>,
    },
    {
        path: "*",
        element: <NotFound/>
    }
];
