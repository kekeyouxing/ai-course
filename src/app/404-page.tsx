export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center p-6">
            <div className="flex items-center gap-6">
                <h1 className="text-2xl font-bold">404</h1>
                <div className="h-12 w-px bg-neutral-200"/>
                <p className="text-s">抱歉，您访问的页面不存在</p>
            </div>
        </main>
    )
}

