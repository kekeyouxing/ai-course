"use client"

import {useState} from "react"
import {ChevronDown} from "lucide-react"

export default function LanguageSwitcher() {
    const [language, setLanguage] = useState<"en" | "zh">("zh")

    const content = {
        en: {
            title: "阅读文稿",
            paragraph1:
                "In the era of digital transformation, artificial intelligence has become a key tool for improving productivity. This is not just a technological leap, but also a technological breakthrough. It's a revolution in how we work, analyze, and innovate.",
            paragraph2:
                "The power of AI lies in its ability to quickly process and analyze large datasets, providing businesses with important insights and trends. This helps make intelligent, efficient decisions, saving time and strengthening strategic planning. In healthcare, finance, and retail, AI-driven analytics are transforming operations and improving customer experiences.",
            paragraph3:
                "AI also excels in automating routine tasks. From data entry to administrative responsibilities, it can accurately handle repetitive work, allowing employees to focus on creative and strategic tasks. This transformation not only increases productivity but also enhances job satisfaction.",
        },
        zh: {
            title: "阅读文稿",
            paragraph1:
                "在数字化转型时代，人工智能成为提高生产力的关键工具。这不仅是技术上的飞跃，也是技术上的飞跃。 这是我们工作、分析和创新方式的一场革命。",
            paragraph2:
                "人工智能的力量在于其快速处理和分析大型数据集的能力，为企业提供重要的见解和趋势。 这有助于做出明智、高效的决策，节省时间并加强战略规划。 在医疗保健、金融和零售等领域，人工智能驱动的分析正在改变运营并改善客户体验。",
            paragraph3:
                "人工智能在日常任务自动化方面也表现出色。 从数据输入到管理职责，它可以精确处理重复性工作，使员工能够专注于创造性和战略性任务。 这种转变不仅提高了生产力，还提高了工作满意度。",
        },
    }

    return (
        <div className="w-160 h-90">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">{content[language].title}</h1>

                <div className="relative inline-block">
                    <button
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50"
                        onClick={() => setLanguage(language === "zh" ? "en" : "zh")}
                    >
                        {language === "zh" ? (
                            <>
                                <img src="https://flagcdn.com/w20/cn.png" alt="Chinese flag" className="w-5 h-auto"/>
                                <span className="text-lg">Chinese</span>
                            </>
                        ) : (
                            <>
                                <img src="https://flagcdn.com/w20/us.png" alt="US flag" className="w-5 h-auto"/>
                                <span className="text-lg">English</span>
                            </>
                        )}
                        <ChevronDown className="w-4 h-4"/>
                    </button>
                </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg overflow-y-auto  border border-gray-200 h-full">
                <p className="text-lg mb-6">{content[language].paragraph1}</p>
                <p className="text-lg mb-6">{content[language].paragraph2}</p>
                <p className="text-lg">{content[language].paragraph3}</p>
            </div>
        </div>
    )
}

