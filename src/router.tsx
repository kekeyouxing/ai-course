import Page from "@/app/page";
import VideoLabPage from "@/app/video-lab-page";
import VideoUploadPage from "@/app/video-upload-page.tsx";
import {RouteObject} from "react-router";
import LoginPage from "@/app/login-page";
import {PricePage} from "@/app/price-page";
import NotFound from "@/app/404-page.tsx";
import ProjectDetailPage from "@/app/project-detail-page.tsx";
import HomePage from "@/app/home-page.tsx";
import AuthRoute from "@/components/AuthRoute.tsx";

export const routes: RouteObject[] = [
    {
        path: "/",
        element: <Page/>,
        children: [
            {
                path: "home",
                // element:<HomePage/>,
                element: <AuthRoute><HomePage/></AuthRoute>,
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
                // todo ProjectDetailPage
                path: "project",
                element: <ProjectDetailPage/>,
                handle: {
                    breadcrumb: "项目详情",
                    pathSegments: ["project"] // 明确层级关系
                }
            }
        ]
    },
    {
        path: "login",
        element: <LoginPage/>
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
