"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { Template } from '@/types/template';
import { getTemplates, createProjectFromTemplate } from '@/api/templates';
import { ScenePreview } from '@/components/workspace/scene-preview';
import { TemplatePreviewModal } from '@/components/templates/template-preview-modal';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [containerWidths, setContainerWidths] = useState<Record<string, number>>({});
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const loadingRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // 获取模板数据
    const fetchTemplates = useCallback(async (page: number, isLoadMore: boolean = false) => {
        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            
            const response = await getTemplates(page, 12);
            
            if (isLoadMore) {
                setTemplates(prev => [...prev, ...response.templates]);
            } else {
                setTemplates(response.templates);
            }
            
            setHasMore(response.pagination.hasMore);
            setCurrentPage(page);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    // 初始加载
    useEffect(() => {
        fetchTemplates(1);
    }, [fetchTemplates]);

    // 无限滚动监听
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
                    fetchTemplates(currentPage + 1, true);
                }
            },
            { threshold: 0.1 }
        );

        const currentLoadingRef = loadingRef.current;
        if (currentLoadingRef) {
            observer.observe(currentLoadingRef);
        }

        return () => {
            if (currentLoadingRef) {
                observer.unobserve(currentLoadingRef);
            }
        };
    }, [fetchTemplates, hasMore, loadingMore, loading, currentPage]);

    // 处理容器引用，用于计算预览尺寸
    const handleContainerRef = useCallback((templateId: string, element: HTMLDivElement | null) => {
        if (element) {
            const width = element.offsetWidth;
            // 只有当宽度发生变化时才更新状态，避免无限循环
            setContainerWidths(prev => {
                if (prev[templateId] !== width) {
                    return {
                        ...prev,
                        [templateId]: width
                    };
                }
                return prev;
            });
        }
    }, []);

    // 计算预览尺寸
    const calculatePreviewDimensions = (template: Template, containerWidth: number) => {
        if (containerWidth === 0) return { width: 0, height: 0 };
        
        // 让场景填满整个容器
        const width = containerWidth;
        const height = containerWidth * 9 / 16; // 保持16:9比例
        
        return { width: Math.floor(width), height: Math.floor(height) };
    };

    // 处理模板卡片点击
    const handleTemplateClick = (template: Template) => {
        setSelectedTemplate(template);
        setIsModalOpen(true);
    };

    // 处理使用模板
    const handleUseTemplate = async (template: Template) => {
        setIsCreatingProject(true);
        try {
            const result = await createProjectFromTemplate(template.id, `${template.title} Project`);
            
            
            // 导航到项目编辑器
            navigate(`/app/projects/${result.projectId}`);
        } catch (error) {
            console.error('Failed to create project from template:', error);
            toast.error('创建项目失败，请稍后重试');
        } finally {
            setIsCreatingProject(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-muted-foreground font-bold mb-2">模板</h1>
                    <p className="text-4xl font-extrabold">加载模板中...</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md animate-pulse">
                            <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                            <div className="p-4">
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-muted-foreground font-bold mb-2">模板</h1>
                <p className="text-4xl font-extrabold">
                    从选择一个模板开始
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                        onClick={() => handleTemplateClick(template)}
                        style={{ aspectRatio: '16/9' }}
                    >
                        {/*预览区域 */}
                        <div ref={(element) => {
                            handleContainerRef(template.id, element);
                        }} className="w-full h-full bg-gray-100">
                            {containerWidths[template.id] > 0 && template.previewScene ? (
                                <ScenePreview
                                    scene={template.previewScene}
                                    width={calculatePreviewDimensions(template, containerWidths[template.id]).width}
                                    height={calculatePreviewDimensions(template, containerWidths[template.id]).height}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <img
                                        src={template.thumbnail}
                                        alt={template.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* 加载更多指示器 */}
            {hasMore && (
                <div ref={loadingRef} className="flex justify-center py-8">
                    {loadingMore && (
                        <div className="flex items-center gap-2 text-gray-500">
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                            <span>加载更多模板...</span>
                        </div>
                    )}
                </div>
            )}

            {/* 模板预览对话框 */}
            {selectedTemplate && (
                <TemplatePreviewModal
                    template={selectedTemplate}
                    isOpen={isModalOpen}
                    onClose={() => {
                        if (!isCreatingProject) {
                            setIsModalOpen(false);
                            setSelectedTemplate(null);
                        }
                    }}
                    onUseTemplate={handleUseTemplate}
                    isCreating={isCreatingProject}
                />
            )}
        </div>
    );
}

