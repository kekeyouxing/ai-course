import Page from "@/app/dashboard/page";
import HomePage from "@/app/dashboard/home-page";
import VideoLabPage from "@/app/dashboard/video-lab-page";
import VideoUploadPage from "@/app/dashboard/video-upload-page.tsx";
import {RouteObject} from "react-router";
import {Login} from "@/app/dashboard/login.tsx";

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
    }
];
