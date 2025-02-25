import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarProvider
} from "@/components/ui/sidebar"
import type {Slide} from "@/data/slides"

interface AppSidebarProps {
    slides: Slide[]
    selectedSlideId: string
    onSelectSlide: (id: string) => void
}

export function AppSidebar({slides, selectedSlideId, onSelectSlide}: AppSidebarProps) {
    return (
        <SidebarProvider>
            <Sidebar layout={"relative"}
                     className="w-70 flex-shrink-0 border-x flex flex-col h-screen min-h-0">
                <SidebarHeader className="h-14 border-b border-t px-4 flex items-center">
                    <h2 className="font-semibold">Slides</h2>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup className="h-min">
                        <SidebarGroupContent>
                            <div className="grid gap-2 p-2">
                                {slides.map((slide) => (
                                    <button
                                        key={slide.id}
                                        className={`w-full rounded-lg overflow-hidden border-2 transition-colors ${
                                            slide.id === selectedSlideId ? "border-primary" : "border-transparent hover:border-gray-300"
                                        }`}
                                        onClick={() => onSelectSlide(slide.id)}
                                    >
                                        <img
                                            src={slide.image || "/placeholder.svg"}
                                            alt={`Slide ${slide.id}`}
                                            width={150}
                                            height={100}
                                            className="w-full h-auto"
                                        />
                                    </button>
                                ))}
                            </div>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    )
}

