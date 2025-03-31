import { Home } from "lucide-react";

export default function NotFound() {
    const goHome = () => {
        window.location.href = '/';
    };

    return (
        <main className="flex min-h-screen items-center justify-center p-6">
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-6">
                    <h1 className="text-2xl font-bold">404</h1>
                    <div className="h-12 w-px bg-neutral-200"/>
                    <p className="text-s">抱歉，您访问的页面不存在</p>
                </div>
                <button
                    onClick={goHome}
                    className="px-4 py-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-2 border border-neutral-200 rounded-md hover:bg-neutral-50"
                >
                    <Home size={16} className="text-neutral-500" />
                    返回首页
                </button>
            </div>
        </main>
    )
}

