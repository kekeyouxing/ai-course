import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"

const SAMPLE_SCRIPT = `In the era of digital transformation, Artificial Intelligence, or AI, emerges as a pivotal tool in boosting productivity. It's not just a technological leap; it's a revolution in how we work, analyze, and innovate.

AI's power lies in its ability to swiftly process and analyze large data sets, offering businesses crucial insights and trends. This leads to informed, efficient decision-making, saving time and enhancing strategic planning. In sectors like healthcare, finance, and retail, AI-driven analytics are transforming operations and improving customer experiences.

Moreover, AI facilitates automation of routine tasks, allowing professionals to focus on more complex, creative aspects of their work. This shift not only increases efficiency but also opens new avenues for innovation and problem-solving.

The impact of AI extends beyond mere automation. It's reshaping entire industries, from personalized healthcare solutions to smart manufacturing processes. As we advance, the integration of AI continues to unlock new possibilities and redefine the boundaries of what's possible in the digital age.`

export function ScriptReader() {
    return (
        <div className="h-full flex flex-col p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-medium text-gray-800">Script</h2>
                <Select defaultValue="english">
                    <SelectTrigger className="w-[180px] border-gray-300">
                        <div className="flex items-center gap-2">
                            <span className="text-xs">🇬🇧</span>
                            <SelectValue placeholder="Select language"/>
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="english">
                            <div className="flex items-center gap-2">
                                <span className="text-xs">🇬🇧</span>
                                English
                            </div>
                        </SelectItem>
                        {/* Add more language options as needed */}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex-grow bg-gray-50 rounded-lg p-6 overflow-y-auto">
                <div className="prose prose-gray">
                    {SAMPLE_SCRIPT.split("\n\n").map((paragraph, index) => (
                        <p key={index} className="mb-4 text-gray-600 leading-relaxed">
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    )
}

