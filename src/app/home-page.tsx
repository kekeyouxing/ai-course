import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Card} from "@/components/ui/card"
import {Globe, Headphones, MoreVertical, Plus} from "lucide-react"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
// import Image from "next/image"

export default function HomePage() {
    return (
        <div className="mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Studio</h1>
                <p className="text-muted-foreground">Our advanced speech editor, ideal for long-form content.</p>
            </div>

            {/* Creation Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer bg-gray-50">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                            <Plus className="w-6 h-6 text-white"/>
                        </div>
                        <span className="font-medium">Start from scratch</span>
                    </div>
                </Card>

                <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                            <Headphones className="w-6 h-6 text-white"/>
                        </div>
                        <span className="font-medium">Create an audiobook</span>
                    </div>
                </Card>

                <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                            <Globe className="w-6 h-6 text-white"/>
                        </div>
                        <span className="font-medium">Create an article</span>
                    </div>
                </Card>

                <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">GenFM</span>
                        </div>
                        <span className="font-medium">Create a podcast</span>
                    </div>
                </Card>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
                <Input type="search" placeholder="Search your projects..." className="max-w-full"/>
            </div>

            {/* Projects List */}
            <div className="space-y-4">
                {[
                    {title: "Untitled Project", time: "30秒钟前"},
                    {title: "Untitled Project", time: "昨天"},
                    {title: "Untitled Project", time: "5天前"},
                    {title: "hello", time: "2周前"},
                ].map((project, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                                <img
                                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E6%88%AA%E5%B1%8F2025-02-23%2011.21.24-sEfooVo24ga774Fij3mgSLCCDJ3m0Q.png"
                                    alt=""
                                    width={16}
                                    height={16}
                                    className="opacity-50"
                                />
                            </div>
                            <div>
                                <div className="font-medium">{project.title}</div>
                                <div className="text-sm text-muted-foreground">{project.time}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">Not converted yet</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="w-4 h-4"/>
                                        <span className="sr-only">More options</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

