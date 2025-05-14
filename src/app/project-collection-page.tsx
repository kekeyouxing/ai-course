import { Suspense, useEffect, useRef, useState, useCallback } from "react"
import { getProjects, deleteProject, renameProject, createProject } from "@/api/project"
import { ProjectCreationModal } from "@/app/project-creation-modal.tsx";
import { Briefcase, MoreVertical, Trash, Edit, Share2, Check, X, Import, Loader2, Clock, FileCheck, AlertTriangle, ExternalLink, Download, Play } from "lucide-react";
import { Project, Scene } from "@/types/scene";
import { toast } from "sonner";
import { getUserProjectProgressList, ProjectProgress, ProjectProgressStatus, getProgressStatusText, getProgressStatusClass } from "@/api/project-progress";

// 在顶部导入区新增
import { useNavigate } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScenePreview } from "@/components/workspace/scene-preview";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProjectCollectionPage() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]); // 添加类型注解
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true); // 添加加载状态
    const [isCreatingEmptyProject, setIsCreatingEmptyProject] = useState(false);
    
    // 项目进度相关状态
    const [activeTab, setActiveTab] = useState<string>("projects");
    const [progressList, setProgressList] = useState<ProjectProgress[]>([]);
    const [progressLoading, setProgressLoading] = useState(true);
    const [progressPagination, setProgressPagination] = useState({ total: 0, page: 1, pageSize: 10 });
    
    // 在组件内部添加状态和ref
    // 修改状态初始化
    // 添加容器宽度映射，存储每个项目的容器宽度
    const [containerWidths, setContainerWidths] = useState<{[key: string]: number}>({});
    // 跟踪已设置的观察者，避免重复设置
    const observersRef = useRef<{[key: string]: ResizeObserver}>({});
    // 新增状态
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [newProjectName, setNewProjectName] = useState("");
    
    // 格式化日期时间
    const formatDateTime = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return `${date.toLocaleDateString('zh-CN')} ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    };
    
    // 获取项目列表
    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await getProjects();
            setProjects(data);
        } catch (error) {
            console.error("获取项目失败:", error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };
    
    // 获取项目进度列表
    const fetchProgressList = async (page: number = 1) => {
        try {
            setProgressLoading(true);
            const response = await getUserProjectProgressList(page, progressPagination.pageSize);
            setProgressList(response.progress);
            setProgressPagination(response.pagination);
        } catch (error) {
            console.error("获取项目进度失败:", error);
            setProgressList([]);
        } finally {
            setProgressLoading(false);
        }
    };
    
    // 修改useEffect
    useEffect(() => {
        if (activeTab === "projects") {
            fetchProjects();
        } else if (activeTab === "progress") {
            fetchProgressList();
        }
    }, [activeTab]);

    // 处理容器引用的回调函数，使用useCallback避免重新创建
    const handleContainerRef = useCallback((id: string, element: HTMLDivElement | null) => {
        // 如果元素为空，清理观察者并返回
        if (!element) {
            if (observersRef.current[id]) {
                observersRef.current[id].disconnect();
                delete observersRef.current[id];
            }
            return;
        }
        
        // 如果此ID的观察者已存在，不要重复设置
        if (observersRef.current[id]) return;
        
        // 获取容器宽度
        const width = element.getBoundingClientRect().width;
        if (width > 0) {
            setContainerWidths(prev => {
                // 只有当宽度发生变化时才更新
                if (prev[id] === width) return prev;
                return { ...prev, [id]: width };
            });
        }
        
        // 创建新的ResizeObserver
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const newWidth = entry.contentRect.width;
                if (newWidth > 0) {
                    setContainerWidths(prev => {
                        // 只有当宽度发生变化时才更新
                        if (prev[id] === newWidth) return prev;
                        return { ...prev, [id]: newWidth };
                    });
                }
            }
        });
        
        // 保存观察者引用
        observersRef.current[id] = resizeObserver;
        resizeObserver.observe(element);
    }, []); // 空依赖数组确保此函数只创建一次

    // 计算预览尺寸的函数，根据aspectRatio调整宽高比
    const calculatePreviewDimensions = (scene: Scene, containerWidth: number) => {
        // 使用传入的aspectRatio或场景自身的aspectRatio，默认为16:9
        const sceneAspectRatio = scene.aspectRatio || "16:9";

        // 解析宽高比例
        const [widthRatio, heightRatio] = sceneAspectRatio.split(":").map(Number);
        const ratio = widthRatio / heightRatio;

        // 计算预览尺寸，直接使用容器宽度和根据比例计算的高度
        const previewWidth = containerWidth;
        const previewHeight = containerWidth / ratio;

        return { width: previewWidth, height: previewHeight };
    };
    
    function handleCreateProject(projectId: string): void {
        navigate(`/app/projects/${projectId}`);
    }

    // 新增点击处理函数
    const handleProjectClick = (projectId: string) => {
        // Find project from projectId
        const project = projects.find(p => p.id === projectId);
        if (!project) {
            console.error("Project not found:", projectId);
            return;
        }
        navigate(`/app/projects/${projectId}`, { state: { project } });
    };

    // 新增删除项目函数
    const handleDeleteProject = async () => {
        if (!selectedProject) return;

        try {
            // 调用删除项目的API
            await deleteProject(selectedProject.id);

            // 更新本地状态
            setProjects(projects.filter(p => p.id !== selectedProject.id));
            toast.success("项目已删除");
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error("删除项目失败:", error);
            toast.error("删除项目失败");
        }
    };

    // 新增重命名项目函数
    const handleRenameProject = async () => {
        if (!selectedProject || !newProjectName.trim()) return;

        try {
            // 调用重命名项目的API
            await renameProject(selectedProject.id, newProjectName);

            // 更新本地状态
            setProjects(projects.map(p =>
                p.id === selectedProject.id
                    ? { ...p, name: newProjectName }
                    : p
            ));
            toast.success("项目已重命名");
            setRenameDialogOpen(false);
        } catch (error) {
            console.error("重命名项目失败:", error);
            toast.error("重命名项目失败");
        }
    };

    // 新增分享项目函数
    const handleShareProject = (project: Project) => {
        const shareUrl = `${window.location.origin}/projects/${project.id}`;
        navigator.clipboard.writeText(shareUrl)
            .then(() => toast.success("项目链接已复制到剪贴板"))
            .catch(() => toast.error("复制链接失败"));
    };

    // 处理视频下载
    const handleDownloadVideo = (url: string) => {
        if (!url) {
            toast.error("视频链接不存在");
            return;
        }
        
        // 创建一个隐藏的a标签并模拟点击下载
        const a = document.createElement('a');
        a.href = url;
        a.download = 'video.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // 阻止事件冒泡
    const stopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    // 新增直接创建空白项目的函数
    const handleCreateEmptyProject = async () => {
        try {
            // 检查用户是否已登录
            const { user, token } = useAuth.getState();
            if (!user || !token) {
                // 触发登录事件，显示登录框
                const event = new CustomEvent('auth:unauthorized');
                window.dispatchEvent(event);
                return;
            }

            setIsCreatingEmptyProject(true);
            const projectId = await createProject("empty");
            toast.success("空白项目创建成功");
            // 直接导航到项目
            navigate(`/app/projects/${projectId}`);
        } catch (error) {
            console.error("创建空白项目失败:", error);
            toast.error("创建空白项目失败");
        } finally {
            setIsCreatingEmptyProject(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* 创建项目卡片，始终显示在页面顶部 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Create empty project card */}
                <div onClick={handleCreateEmptyProject}
                    className="rounded-xl p-4 flex flex-col bg-white border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300"
                >
                    <div className="mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            {isCreatingEmptyProject ? (
                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                            ) : (
                                <Briefcase className="w-5 h-5 text-blue-500" />
                            )}
                        </div>
                    </div>
                    <div className="mt-auto">
                        <h3 className="text-lg font-semibold mb-1">创建空白项目</h3>
                        <p className="text-sm text-gray-500">{isCreatingEmptyProject ? "创建中..." : "从头开始创建新项目"}</p>
                    </div>
                </div>

                {/* Import to create project card */}
                <div onClick={() => setIsModalOpen(true)}
                    className="rounded-xl p-4 flex flex-col bg-white border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300"
                >
                    <div className="mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Import className="w-5 h-5 text-green-500" />
                        </div>
                    </div>
                    <div className="mt-auto">
                        <h3 className="text-lg font-semibold mb-1">导入创建项目</h3>
                        <p className="text-sm text-gray-500">从PPT或PDF创建项目</p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="projects" value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList>
                    <TabsTrigger value="projects">我的项目</TabsTrigger>
                    <TabsTrigger value="progress">我的视频</TabsTrigger>
                </TabsList>
                
                <TabsContent value="projects">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            <div className="text-gray-500">加载项目中...</div>
                        ) : projects.length === 0 ? (
                            <div className="text-gray-500">暂无项目，点击上方卡片创建</div>
                        ) : (
                            <Suspense fallback={<div>Loading projects...</div>}>
                                {projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg hover:border-gray-300 active:shadow-lg active:border-gray-300 transition-all duration-300 cursor-pointer relative"
                                        onClick={() => handleProjectClick(project.id)}
                                    >
                                        {/* 操作菜单 */}
                                        <div
                                            className="absolute top-2 right-2 z-10 border-0 outline-none ring-0 focus:outline-none focus:ring-0"
                                            onClick={stopPropagation}
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <div className="h-8 w-8 bg-white/80 hover:bg-gray-100 hover:text-gray-700 active:bg-gray-100 active:text-gray-700 rounded-full cursor-pointer transition-colors border-0 shadow-none outline-none ring-0 ring-offset-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-700 flex items-center justify-center">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </div>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {/* 下拉菜单内容保持不变 */}
                                                    <DropdownMenuItem className="cursor-pointer" onClick={() => {
                                                        setSelectedProject(project);
                                                        setNewProjectName(project.name);
                                                        setRenameDialogOpen(true);
                                                    }}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <span>重命名</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer" onClick={() => handleShareProject(project)}>
                                                        <Share2 className="mr-2 h-4 w-4" />
                                                        <span>分享链接</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600 cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedProject(project);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        <span>删除</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* 缩略图区域 */}
                                        {project.scenes[0] ? (
                                            <div ref={(element) => {
                                                handleContainerRef(project.id, element);
                                            }} className="h-40 overflow-hidden">
                                                {containerWidths[project.id] > 0 && (
                                                    <ScenePreview
                                                        scene={project.scenes[0]}
                                                        width={calculatePreviewDimensions(project.scenes[0], containerWidths[project.id]).width}
                                                        height={calculatePreviewDimensions(project.scenes[0], containerWidths[project.id]).height}
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="h-40 bg-white flex items-center justify-center border-b">
                                                {/* 默认背景 */}
                                            </div>
                                        )}

                                        {/* 项目信息区域 */}
                                        <div className="p-4">
                                            <h3 className="font-semibold text-lg mb-2 line-clamp-1">{project.name}</h3>
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm text-gray-500">
                                                    {new Date(project.updatedAt).toLocaleDateString('zh-CN')}
                                                </div>
                                                <div className={`text-xs px-2 py-1 rounded-full ${project.status === 'published'
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
                </TabsContent>
                
                <TabsContent value="progress">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {progressLoading ? (
                            <div className="text-gray-500">加载视频中...</div>
                        ) : progressList.length === 0 ? (
                            <div className="text-gray-500">暂无生成的视频</div>
                        ) : (
                            <Suspense fallback={<div>Loading videos...</div>}>
                                {progressList.map((progress) => {
                                    return (
                                        <div 
                                            key={progress.projectId}
                                            className="rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 cursor-pointer relative"
                                            onClick={() => {
                                                // Navigate to the video detail page using projectId and pass the progress data
                                                navigate(`/app/videos/${progress.projectId}`, { 
                                                    state: { progress } 
                                                });
                                            }}
                                        >
                                            {/* 视频缩略图/状态显示区域 */}
                                            <div className="h-40 bg-gray-100 overflow-hidden relative">
                                                {/* Show thumbnail image */}
                                                {progress.thumbnailUrl ? (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                        <img 
                                                            src={progress.thumbnailUrl} 
                                                            alt={progress.projectName}
                                                            className="w-auto h-auto max-w-full max-h-full object-contain"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                        <p className="text-gray-500">暂无缩略图</p>
                                                    </div>
                                                )}
                                                
                                                {/* Status overlay */}
                                                {progress.status === 'PENDING' && (
                                                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                                        <p className="text-blue-700 font-medium bg-blue-100 px-3 py-1 rounded-full">视频生成耗时较长，请您耐心等待...</p>
                                                    </div>
                                                )}
                                                
                                                {progress.status === 'FAILED' && (
                                                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                                        <p className="text-red-700 font-medium bg-red-100 px-3 py-1 rounded-full">处理失败</p>
                                                    </div>
                                                )}
                                                
                                                {/* Status label */}
                                                <div className="absolute top-2 right-2">
                                                    <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                                                        progress.status === 'SUCCEEDED' ? 'bg-green-100 text-green-800' :
                                                        progress.status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                                                        progress.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {progress.status}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* 视频信息区域 */}
                                            <div className="p-4">
                                                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{progress.projectName}</h3>
                                                <div className="flex justify-between items-center">
                                                    <div className="text-sm text-gray-500">
                                                        {formatDateTime(progress.createdAt)}
                                                    </div>
                                                    
                                                    {progress.status === 'FAILED' && (
                                                        <div className="text-xs text-red-500 line-clamp-1 max-w-[180px]">
                                                            {progress.errorMessage || '生成失败'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </Suspense>
                        )}
                    </div>
                    
                    {/* 分页控制 */}
                    {progressList.length > 0 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-gray-500">
                                总计 {progressPagination.total} 条记录
                            </div>
                            <div className="flex space-x-2">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    disabled={progressPagination.page <= 1}
                                    onClick={() => fetchProgressList(progressPagination.page - 1)}
                                >
                                    上一页
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    disabled={progressPagination.page * progressPagination.pageSize >= progressPagination.total}
                                    onClick={() => fetchProgressList(progressPagination.page + 1)}
                                >
                                    下一页
                                </Button>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* 项目创建模态框 */}
            <ProjectCreationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateProject}
            />

            {/* 删除确认对话框 */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>确认删除项目</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>您确定要删除项目 "{selectedProject?.name}" 吗？此操作无法撤销。</p>
                    </div>
                    <DialogFooter className="flex space-x-2 justify-end">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            <X className="mr-2 h-4 w-4" />
                            取消
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteProject}>
                            <Trash className="mr-2 h-4 w-4" />
                            删除
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 重命名对话框 */}
            <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>重命名项目</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            placeholder="输入新的项目名称"
                            className="w-full"
                        />
                    </div>
                    <DialogFooter className="flex space-x-2 justify-end">
                        <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
                            <X className="mr-2 h-4 w-4" />
                            取消
                        </Button>
                        <Button onClick={handleRenameProject}>
                            <Check className="mr-2 h-4 w-4" />
                            确认
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

