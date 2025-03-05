import {Briefcase, Mic} from "lucide-react"

export default function FeatureCards() {
    return (
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Voice Clone Card */}
            <div
                onClick={() => window.location.href = '/videolab/videoupload'}
                className=" rounded-xl p-6 h-full flex flex-col bg-gradient-to-br from-orange-400 via-orange-300 to-amber-200 cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                        <Mic className="w-6 h-6 text-white"/>
                    </div>
                    <div className="flex items-center">
                        <div className="text-white/90 text-sm flex items-center">
                        </div>
                    </div>
                </div>
                <div className="mt-auto">
                    <h3 className="text-2xl font-bold text-white mb-2">克隆分身</h3>
                    <p className="text-white/90">录制一段30秒的视频，并用你的声音为所有角色和旁白配音</p>
                </div>
            </div>

            <div
                className="rounded-xl p-6 h-full flex flex-col bg-gradient-to-br from-purple-500 via-purple-400 to-amber-700">
                <div className="mb-6">
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-white"/>
                    </div>
                </div>
                <div className="mt-auto">
                    <h3 className="text-2xl font-bold text-white mb-2">创建项目</h3>
                    <p className="text-white/90">你可以新建空白项目，或导入PPT创建项目</p>
                </div>
            </div>
        </div>
    )
}

