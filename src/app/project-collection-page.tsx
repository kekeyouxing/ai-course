import {Suspense, useEffect, useState} from "react"
import {getProjects, deleteProject, renameProject} from "@/api/project"
import {ProjectCreationModal} from "@/app/project-creation-modal.tsx";
import { Briefcase, MoreVertical, Trash, Edit, Share2, Check, X } from "lucide-react";
import { Project } from "@/types/scene";
import { toast } from "sonner";

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

export default function ProjectCollectionPage() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]); // 添加类型注解
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true); // 添加加载状态
    
    // 新增状态
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [newProjectName, setNewProjectName] = useState("");

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
        console.log("创建项目:", projectId);
        navigate(`/projects/${projectId}`);
    }

    // 新增点击处理函数
    const handleProjectClick = (projectId: string) => {
        // Find project from projectId
        const project = projects.find(p => p.id === projectId);
        if (!project) {
            console.error("Project not found:", projectId);
            return;
        }
        navigate(`/projects/${projectId}`, {state: {project}});
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
                    ? {...p, name: newProjectName} 
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
    
    // 阻止事件冒泡
    const stopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation();
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
                                className="rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 active:shadow-lg active:border-gray-300 transition-all duration-300 cursor-pointer relative" 
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

