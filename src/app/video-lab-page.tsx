"use client"

// 导入部分修改
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Search,
    Mic,
    Play,
    Pause,
    MoreVertical,
    Edit2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// 导入新的API函数和类型
import { getVoices } from "@/api/character"
import {
    SystemVoice,
    ClonedVoice
} from "@/types/character";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate } from "react-router-dom"
// 移除重复的类型定义，因为已经从character.ts导入

// 初始化空数组
const initialDefaultVoices: SystemVoice[] = [];
const initialCustomVoices: ClonedVoice[] = [];

export default function VideoLabPage() {
    const [activeTab, setActiveTab] = useState("custom");
    const [searchTerm, setSearchTerm] = useState("");
    // 状态管理
    const [defaultVoices, setDefaultVoices] = useState<SystemVoice[]>(initialDefaultVoices);
    const [customVoices, setCustomVoices] = useState<ClonedVoice[]>(initialCustomVoices);
    const [filteredDefaultVoices, setFilteredDefaultVoices] = useState<SystemVoice[]>(initialDefaultVoices);
    const [filteredCustomVoices, setFilteredCustomVoices] = useState<ClonedVoice[]>(initialCustomVoices);
    const [loading, setLoading] = useState(true);
    // 处理系统声音播放
    const handlePlaySystemAudio = (voice: SystemVoice) => {
        if (playingVoiceId === voice.voice_id) {
            // 如果当前正在播放，则暂停
            if (audioRef.current) {
                audioRef.current.pause();
                setPlayingVoiceId(null);
            }
        } else {
            // 如果当前没有播放，则播放新的音频
            if (audioRef.current) {
                audioRef.current.pause();
            }

            // 创建新的音频元素
            const audio = new Audio(voice.audio_url);
            audioRef.current = audio;

            // 播放结束时重置状态
            audio.onended = () => {
                setPlayingVoiceId(null);
            };

            // 开始播放
            audio.play().catch(error => {
                console.error('音频播放失败:', error);
                setPlayingVoiceId(null);
            });

            setPlayingVoiceId(voice.voice_id);
        }
    };
    // 修改获取声音数据的函数
    const fetchVoices = async () => {
        const result = await getVoices();
        if (result.success) {
            setDefaultVoices(result.systemVoices);
            setCustomVoices(result.clonedVoices);
            setFilteredDefaultVoices(result.systemVoices);
            setFilteredCustomVoices(result.clonedVoices);
        } else {
            console.error('获取声音数据失败:', result.message);
            // 可以添加错误提示
        }
    };

    // 组件加载时获取数据
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchVoices()]);
            setLoading(false);
        };

        fetchData();
    }, []);

    // 处理搜索和筛选
    useEffect(() => {
        if (searchTerm) {
            setFilteredDefaultVoices(
                defaultVoices.filter(voice =>
                    voice.voice_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (voice.gender && voice.gender.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (voice.description && voice.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (voice.language && voice.language.toLowerCase().includes(searchTerm.toLowerCase()))
                )
            );
            setFilteredCustomVoices(
                customVoices.filter(voice =>
                    voice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (voice.gender && voice.gender.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (voice.language && voice.language.toLowerCase().includes(searchTerm.toLowerCase()))
                )
            );
        } else {
            setFilteredDefaultVoices(defaultVoices);
            setFilteredCustomVoices(customVoices);
        }
    }, [searchTerm, defaultVoices, customVoices]);

    // 格式化日期
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    };

    // 加载状态组件
    const LoadingState = () => (
        <div className="text-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">正在加载声音数据...</p>
        </div>
    );

    // 添加音频播放相关状态
    const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // 处理音频播放
    const handlePlayAudio = (voice: ClonedVoice) => {
        if (playingVoiceId === voice.voice_id) {
            // 如果当前正在播放，则暂停
            if (audioRef.current) {
                audioRef.current.pause();
                setPlayingVoiceId(null);
            }
        } else {
            // 如果当前没有播放，则播放新的音频
            if (audioRef.current) {
                audioRef.current.pause();
            }

            // 创建新的音频元素
            const audio = new Audio(voice.audio_url);
            audioRef.current = audio;

            // 播放结束时重置状态
            audio.onended = () => {
                setPlayingVoiceId(null);
            };

            // 开始播放
            audio.play().catch(error => {
                console.error('音频播放失败:', error);
                setPlayingVoiceId(null);
            });

            setPlayingVoiceId(voice.voice_id);
        }
    };

    // 添加编辑处理函数
    const handleEditClick = (e: React.MouseEvent, voice: ClonedVoice) => {
        e.stopPropagation(); // 阻止事件冒泡
        // 使用 navigate 进行导航，并传递状态
        navigate(`/clone`, {
            state: { voice }
        });
    }

    // 添加这行代码
    const navigate = useNavigate();

    return (
        <div className="container mx-auto py-6 max-w-6xl">
            {/* 顶部克隆声音卡片 */}
            <div
                onClick={() => window.location.href = '/clone'}
                className="rounded-xl p-6 w-80 flex flex-col bg-gradient-to-br from-orange-400 via-orange-300 to-amber-200 cursor-pointer hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                        <Mic className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center">
                        <div className="text-white/90 text-sm flex items-center">
                        </div>
                    </div>
                </div>
                <div className="mt-auto">
                    <h3 className="text-2xl font-bold text-white mb-2">创建虚拟形象</h3>
                    <p className="text-white/90">录制一段30秒的视频，并用你的声音为所有角色和旁白配音</p>
                </div>
            </div>

            {/* 主要内容区域 */}
            <Tabs defaultValue="custom" className="space-y-6 pt-8" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="custom">自定义形象</TabsTrigger>
                    <TabsTrigger value="default">系统形象</TabsTrigger>
                </TabsList>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="搜索声音..."
                        className="pl-10 w-[220px] rounded-full bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* 费用提示信息 */}

                {loading ? <LoadingState /> : (
                    <>
                        {/* 自定义声音 */}
                        <TabsContent value="custom" className="mt-4">
                            {filteredCustomVoices.length > 0 ? (
                                <div className="grid grid-cols-3 gap-6">
                                    {filteredCustomVoices.map((voice) => (
                                        <div
                                            key={voice.voice_id}
                                            className="bg-white border rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer group relative"
                                            onClick={(e) => handleEditClick(e, voice)}
                                        >
                                            <div className="absolute top-3 right-3 z-20">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <div className="h-8 w-8 bg-white/80 hover:bg-gray-100 hover:text-gray-700 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-700 rounded-full cursor-pointer transition-colors flex items-center justify-center">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </div>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={(e) => {
                                                                handleEditClick(e, voice)
                                                            }}
                                                        >
                                                            <Edit2 className="mr-2 h-4 w-4" />
                                                            <span>编辑</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="flex items-center gap-4 mb-3">
                                                <Avatar className="h-14 w-14 ring-2 ring-offset-2 ring-blue-100 flex-shrink-0">
                                                    <AvatarImage
                                                        src={voice.avatar_url}
                                                        alt={voice.name}
                                                        className="object-cover"
                                                    />
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
                                                        {voice.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-semibold text-lg text-gray-800">{voice.name}</h3>
                                                    <p className="text-sm text-gray-500">创建于: {formatDate(voice.created_time)}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <span className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                                                    {voice.gender}
                                                </span>
                                                <span className="text-xs font-medium bg-purple-50 text-purple-600 px-3 py-1 rounded-full">
                                                    {voice.language}
                                                </span>
                                            </div>
                                            <div className="mt-4 flex justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // 防止事件冒泡
                                                        handlePlayAudio(voice);
                                                    }}
                                                >
                                                    {playingVoiceId === voice.voice_id ? (
                                                        <>
                                                            <Pause className="h-4 w-4 mr-1" /> 暂停
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="h-4 w-4 mr-1" /> 试听
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <Mic className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-600 mb-2">您还没有创建虚拟形象</h3>
                                    <p className="text-gray-500 max-w-md mx-auto mb-6">创建您自己的虚拟形象，让您的声音为视频增添个性</p>
                                    <Button onClick={() => window.location.href = '/clone'} className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                                        立即创建
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        {/* 默认声音 - 添加试听按钮 */}
                        <TabsContent value="default">
                            {/* 声音列表 */}
                            <div className="grid grid-cols-3 gap-6">
                                {filteredDefaultVoices.map((voice) => (
                                    <div
                                        key={voice.voice_id}
                                        className="bg-white border rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer group relative"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                                {voice.voice_name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-800">{voice.voice_name}</h3>
                                                {voice.description && (
                                                    <p className="text-sm text-gray-500 line-clamp-1">{voice.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {voice.gender && (
                                                <span className={`text-xs font-medium ${voice.gender.includes("男") ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"
                                                    } px-3 py-1 rounded-full`}>
                                                    {voice.gender}
                                                </span>
                                            )}
                                            {voice.language && (
                                                <span className={`text-xs font-medium ${voice.language.includes("中文") ? "bg-green-50 text-green-600" :
                                                    voice.language.includes("英文") ? "bg-purple-50 text-purple-600" :
                                                        voice.language.includes("日文") ? "bg-red-50 text-red-600" :
                                                            "bg-gray-50 text-gray-600"
                                                    } px-3 py-1 rounded-full`}>
                                                    {voice.language}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-4 flex justify-between items-center">
                                            <div className="text-sm text-gray-500">系统声音</div>
                                            {voice.audio_url && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // 防止事件冒泡
                                                        handlePlaySystemAudio(voice);
                                                    }}
                                                >
                                                    {playingVoiceId === voice.voice_id ? (
                                                        <>
                                                            <Pause className="h-4 w-4 mr-1" /> 暂停
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="h-4 w-4 mr-1" /> 试听
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    )
}
