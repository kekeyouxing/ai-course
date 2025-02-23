"use client"

import {useCallback, useState} from "react"
import {AppSidebar} from "@/components/sidebar"
import {TextEditor} from "@/components/text-editor"
import {InfoDisplay} from "@/components/info-display"
import {OperationFunctions} from "@/components/operation-functions"
import {InputSend} from "@/components/input-send"
import {type Slide, slides} from "@/data/slides"

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
        <div className="flex h-full">
            <AppSidebar slides={slidesData} selectedSlideId={selectedSlideId} onSelectSlide={handleSelectSlide}/>
            <div className="flex-1 flex flex-col">
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

