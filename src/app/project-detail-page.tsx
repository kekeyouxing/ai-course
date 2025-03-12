import {AppSidebar} from "@/components/layout/app-sidebar";
import {useCallback, useState} from "react"
import {type Slide, slides} from "@/data/slides"
import {InfoDisplay} from "@/components/common/info-display.tsx";
import {OperationFunctions} from "@/components/common/operation-functions.tsx";
import {TextEditor} from "@/components/editor/text-editor.tsx";
import {InputSend} from "@/components/common/input-send.tsx";

export default function ProjectDetailPage() {
    const [selectedSlideId, setSelectedSlideId] = useState(slides[0].id)
    const [slidesData, setSlidesData] = useState<Slide[]>(slides)

    const handleSelectSlide = useCallback((id: string) => {
        setSelectedSlideId(id)
    }, [])

    const handleContentChange = useCallback(
        (newContent: string) => {
            setSlidesData((prevSlides) =>
                prevSlides.map((slide) => (slide.id === selectedSlideId ? {...slide, content: newContent} : slide)),
            )
        },
        [selectedSlideId],
    )

    const handleSendMessage = useCallback((message: string) => {
        console.log("Sent message:", message)
        // Implement your send message logic here
    }, [])

    const selectedSlide = slidesData.find((slide) => slide.id === selectedSlideId) || slidesData[0]

    return (
        <div className="flex h-screen min-h-0">
            <AppSidebar/>
            <div className="flex-1 flex flex-col min-h-0">
                <InfoDisplay image={selectedSlide.image} name={`Slide ${selectedSlide.id}`}/>
                <OperationFunctions/>
                <div className="flex-grow">
                    <TextEditor content={selectedSlide.content} onContentChange={handleContentChange}/>
                </div>
                <InputSend onSend={handleSendMessage}/>
            </div>
        </div>
    )
}

