import Page from "@/app/page";
import VideoLabPage from "@/app/video-lab-page";
import {RouteObject} from "react-router";
import {PricePage} from "@/app/price-page";
import NotFound from "@/app/404-page.tsx";
import HomePage from "@/app/home-page.tsx";
import ProjectCollectionPage from "@/app/project-collection-page.tsx";
import VideoEditor from "@/app/video-edioter.tsx";
import VoiceCloningUI from "@/components/voice-cloning-ui.tsx";
import {VoiceCloningProvider} from '@/hooks/VoiceCloningContext';

export const routes: RouteObject[] = [
    {
        path: "/",
        element: <Page/>,
        children: [
            {
                path: "home",
                element: <HomePage/>,
                // element: <AuthRoute key={Date.now()}><HomePage/></AuthRoute>,
                handle: {
                    breadcrumb: "主页", // 面包屑标题
                    pathSegments: ["home"] // 标记路径层级
                }
            },
            {
                path: "videolab",
                element: <VideoLabPage/>,
                handle: {
                    breadcrumb: "我的数字人",
                    pathSegments: ["videolab"] // 明确层级关系
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
            }
        ]
    },
    {
        path: "price",
        element: <PricePage/>,
    },
    {
        path: "projects/:id", // 独立路径
        element: <VideoEditor/>, // 独立页面
    },
    {
        path: "clone", // 独立路径
        element: <VoiceCloningProvider><VoiceCloningUI/></VoiceCloningProvider>, // 独立页面
    },
    {
        path: "*",
        element: <NotFound/>
    }
];
