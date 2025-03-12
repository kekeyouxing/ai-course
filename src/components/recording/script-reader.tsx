import {useState} from 'react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const SCRIPTS: { [key: string]: string } = {
    english: `In the era of digital transformation, Artificial Intelligence, or AI, emerges as a pivotal tool in boosting productivity. It's not just a technological leap; it's a revolution in how we work, analyze, and innovate.

AI's power lies in its ability to swiftly process and analyze large data sets, offering businesses crucial insights and trends. This leads to informed, efficient decision-making, saving time and enhancing strategic planning. In sectors like healthcare, finance, and retail, AI-driven analytics are transforming operations and improving customer experiences.

Moreover, AI facilitates automation of routine tasks, allowing professionals to focus on more complex, creative aspects of their work. This shift not only increases efficiency but also opens new avenues for innovation and problem-solving.

The impact of AI extends beyond mere automation. It's reshaping entire industries, from personalized healthcare solutions to smart manufacturing processes. As we advance, the integration of AI continues to unlock new possibilities and redefine the boundaries of what's possible in the digital age.`,
    chinese: `在数字化转型的时代，人工智能（AI）成为提高生产力的关键工具。这不仅是技术上的飞跃，更是我们工作、分析和创新方式的革命。

AI的力量在于其能够快速处理和分析大量数据，为企业提供关键的见解和趋势。这导致了信息化、高效的决策，节省时间并增强战略规划。在医疗、金融和零售等行业，AI驱动的分析正在改变运营并改善客户体验。

此外，AI促进了日常任务的自动化，使专业人员能够专注于更复杂、更具创造性的工作。这种转变不仅提高了效率，还开辟了创新和解决问题的新途径。

AI的影响不仅限于自动化。它正在重塑整个行业，从个性化医疗解决方案到智能制造过程。随着我们的进步，AI的整合继续解锁新的可能性，并重新定义数字时代的可能性边界。`
};

export function ScriptReader() {
    const [language, setLanguage] = useState('chinese');

    return (
        <div className="h-full flex flex-col p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-medium text-gray-800">Script</h2>
                <Select defaultValue="chinese" onValueChange={setLanguage}>
                    <SelectTrigger className="w-[180px] border-gray-300">
                        <div className="flex items-center gap-2">
                            <SelectValue placeholder="Select language"/>
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="chinese">
                            <div className="flex items-center gap-2">
                                <span className="text-xs">🇨🇳</span>
                                中文
                            </div>
                        </SelectItem>
                        <SelectItem value="english">
                            <div className="flex items-center gap-2">
                                <span className="text-xs">🇬🇧</span>
                                English
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex-grow bg-gray-50 rounded-lg p-6 overflow-y-auto">
                <div className="prose prose-gray">
                    {SCRIPTS[language].split("\n\n").map((paragraph, index) => (
                        <p key={index} className="mb-4 text-gray-600 leading-relaxed">
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
}