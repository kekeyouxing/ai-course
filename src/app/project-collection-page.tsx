import {Suspense, useEffect, useState} from "react"
import {getProjects} from "@/api/project"
import {ProjectCreationModal} from "@/app/project-creation-modal.tsx";
import { Briefcase } from "lucide-react";
import { Project } from "@/types/scene";

// 在顶部导入区新增
import { useNavigate } from "react-router-dom";

export default function ProjectCollectionPage() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]); // 添加类型注解
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true); // 添加加载状态

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getProjects(); 
                setProjects(data);
            } catch (error) {
                console.error("获取项目失败:", error);
                setProjects([]); // 出错时设置为空数组
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    function handleCreateProject(projectId: string): void {
        navigate(`/projects/${projectId}`);
    }

    // 新增点击处理函数
    const handleProjectClick = (projectId: string) => {
        navigate(`/projects/${projectId}`);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div onClick={() => setIsModalOpen(true)}
                className="rounded-xl w-80 p-6 flex flex-col bg-gradient-to-br from-purple-500 via-purple-400 to-amber-700 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:brightness-110 active:scale-95"
            >
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {loading ? (
                    <div className="text-gray-500">加载项目中...</div>
                ) : projects.length === 0 ? (
                    <div className="text-gray-500">暂无项目，点击上方卡片创建</div>
                ) : (
                    <Suspense fallback={<div>Loading projects...</div>}>
                        {projects.map((project) => (
                            <div 
                                key={project.id}
                                className="rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer" // 添加 cursor-pointer
                                onClick={() => handleProjectClick(project.id)} // 新增点击事件
                            >
                                {/* 缩略图区域 */}
                                {project.thumbnail ? (
                                    <div className="h-40 overflow-hidden">
                                        <img 
                                            src={project.thumbnail} 
                                            alt={project.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-40 bg-white flex items-center justify-center border-b">
                                        <div className="text-center p-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                                                <Briefcase className="w-6 h-6 text-gray-500" />
                                            </div>
                                            <p className="text-gray-400 text-sm">无预览图</p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* 项目信息区域 */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">{project.name}</h3>
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-500">
                                            {new Date(project.updatedAt).toLocaleDateString('zh-CN')}
                                        </div>
                                        <div className={`text-xs px-2 py-1 rounded-full ${
                                            project.status === 'published' 
                                                ? 'bg-green-50 text-green-600' 
                                                : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {project.status === 'published' ? '已发布' : '草稿'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Suspense>
                )}
            </div>
            <ProjectCreationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateProject}
            />
        </div>
    )
}

