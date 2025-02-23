import Page from "@/app/page";
import HomePage from "@/app/home-page";
import VideoLabPage from "@/app/video-lab-page";
import VideoUploadPage from "@/app/video-upload-page.tsx";
import {RouteObject} from "react-router";
import {Login} from "@/app/login.tsx";
import {PricePage} from "@/app/price-page";
import NotFound from "@/app/404-page.tsx";
import ProjectDetailPage from "@/app/project-detail-page.tsx";

export const routes: RouteObject[] = [
    {
        path: "/",
        element: <Page/>,
        children: [
            {
                path: "home",
                element: <HomePage/>,
                handle: {
                    breadcrumb: "主页", // 面包屑标题
                    pathSegments: ["videolab"] // 标记路径层级
                }
            },
            {
                path: "videolab",
                element: <VideoLabPage/>,
                handle: {
                    breadcrumb: "角色库"
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
        element: <Login logo={{
            url: "https://www.shadcnblocks.com",
            src: "https://www.shadcnblocks.com/images/block/block-1.svg",
            alt: "logo"
        }}/>
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
