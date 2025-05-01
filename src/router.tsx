import Page from "@/app/page";
import VideoLabPage from "@/app/video-lab-page";
import {RouteObject} from "react-router";
import NotFound from "@/app/404-page.tsx";
import HomePage from "@/app/home-page.tsx";
import ProjectCollectionPage from "@/app/project-collection-page.tsx";
import VideoEditor from "@/app/video-edioter";
import VoiceCloningUI from "@/components/clone/voice-cloning-ui";
import {VoiceCloningProvider} from '@/hooks/VoiceCloningContext';
import AuthRoute from "@/components/auth/AuthRoute";
import OrdersPage from "@/app/orders-page";
import ResourceLogsPage from "@/app/resource-logs-page";
import LandingPage from "@/app/landing-page";
import LoginPage from "@/app/login-page";
import AppPricePage from "@/app/app-price-page";
import AboutPage from "@/app/about-page";
import ContactPage from "@/app/contact-page";
import TermsPage from "@/app/terms-page";

export const routes: RouteObject[] = [
    {
        path: "/",
        element: <LandingPage />,
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "appprice",
        element: <AppPricePage />,
    },
    {
        path: "/about",
        element: <AboutPage />,
    },
    {
        path: "/contact",
        element: <ContactPage />,
    },
    {
        path: "/terms",
        element: <TermsPage />,
    },
    {
        path: "/app",
        element: <Page/>,
        children: [
            {
                path: "home",
                element: <AuthRoute key={Date.now()}><HomePage/></AuthRoute>,
                handle: {
                    breadcrumb: "主页", // 面包屑标题
                    pathSegments: ["home"] // 标记路径层级
                }
            },
            {
                path: "videolab",
                element: <AuthRoute key={Date.now()}><VideoLabPage/></AuthRoute>,
                handle: {
                    breadcrumb: "我的数字人",
                    pathSegments: ["videolab"] // 明确层级关系
                }
            },
            {
                path: "projects",
                element: <AuthRoute key={Date.now()}><ProjectCollectionPage/></AuthRoute>,
                handle: {
                    breadcrumb: "项目",
                    pathSegments: ["projects"] // 明确层级关系
                }
            },
            {
                path: "orders",
                element: <AuthRoute key={Date.now()}><OrdersPage/></AuthRoute>,
                handle: {
                    breadcrumb: "订单记录",
                    pathSegments: ["orders"] // 明确层级关系
                }
            },
            {
                path: "resource-logs",
                element: <AuthRoute key={Date.now()}><ResourceLogsPage/></AuthRoute>,
                handle: {
                    breadcrumb: "使用记录",
                    pathSegments: ["resource-logs"] // 明确层级关系
                }
            },
        ]
    },
    {
        path: "/app/projects/:id", // 独立路径
        element: <AuthRoute key={Date.now()}><VideoEditor/></AuthRoute>, // 独立页面
    },
    {
        path: "clone", // 独立路径
        element: <AuthRoute key={Date.now()}><VoiceCloningProvider><VoiceCloningUI/></VoiceCloningProvider></AuthRoute>, // 独立页面
    },
    {
        path: "*",
        element: <NotFound/>
    },

];
