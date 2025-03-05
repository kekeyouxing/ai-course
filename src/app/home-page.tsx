import FeatureCards from "@/components/feature-cards.tsx";
// import Image from "next/image"

export default function HomePage() {
    return (
        <div className="mx-60 px-4 py-12">
            <div className="mb-8">
                <h1 className="text-muted-foreground font-bold mb-2">My Workspace</h1>
                <p className="text-4xl font-extrabold font">
                    Good{" "}
                    {new Date().getHours() < 12 ? "Morning" :
                        new Date().getHours() < 18 ? "Afternoon" : "Evening"}
                </p>
            </div>
            <div>
                <FeatureCards/>
            </div>
            {/*<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">*/}
            {/*    <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer"*/}
            {/*          onClick={() => window.location.href = '/videolab/videoupload'}>*/}
            {/*        <div className="flex flex-col items-center justify-center gap-4">*/}
            {/*            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">*/}
            {/*                <Inbox className="w-6 h-6 text-white"/>*/}
            {/*            </div>*/}
            {/*            <span className="font-medium text-muted-foreground">创建新分身</span>*/}
            {/*        </div>*/}
            {/*    </Card>*/}
            {/*    <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer"*/}
            {/*          onClick={() => window.location.href = '/projects'}>*/}
            {/*        <div className="flex flex-col items-center justify-center gap-4">*/}
            {/*            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">*/}
            {/*                <Briefcase className="w-6 h-6 text-white"/>*/}
            {/*            </div>*/}
            {/*            <span className="font-medium text-muted-foreground">创建新项目</span>*/}
            {/*        </div>*/}
            {/*    </Card>*/}

            {/*<Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">*/}
            {/*    <div className="flex flex-col items-center justify-center gap-4">*/}
            {/*        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">*/}
            {/*            <Briefcase className="w-6 h-6 text-white"/>*/}
            {/*        </div>*/}
            {/*        <span className="font-medium text-muted-foreground">AI创建ppt</span>*/}
            {/*    </div>*/}
            {/*</Card>*/}

            {/*<Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">*/}
            {/*    <div className="flex flex-col items-center justify-center gap-4">*/}
            {/*        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">*/}
            {/*            <span className="text-white font-semibold text-sm">GenFM</span>*/}
            {/*        </div>*/}
            {/*        <span className="font-medium text-muted-foreground">费用明细</span>*/}
            {/*    </div>*/}
            {/*</Card>*/}
            {/*</div>*/}
        </div>
    )
}

