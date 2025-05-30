"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Template } from '@/types/template';
import { Scene } from '@/types/scene';
import { ScenePreview } from '@/components/workspace/scene-preview';
import { X, Play, Pause, Loader2 } from 'lucide-react';
import { CANVAS_DIMENSIONS } from '@/hooks/use-canvas-dimensions';
import { getTemplateScenes } from '@/api/templates';
import { toast } from 'sonner';

interface TemplatePreviewModalProps {
  template: Template;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (template: Template) => void;
  isCreating?: boolean;
}

export function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
  onUseTemplate,
  isCreating = false,
}: TemplatePreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loadingScenes, setLoadingScenes] = useState(false);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(null); // null表示显示视频
  const [gridItemDimensions, setGridItemDimensions] = useState({ width: 120, height: 68 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // 监听容器尺寸变化
  useEffect(() => {
    const updateContainerWidth = () => {
      if (leftPanelRef.current) {
        setContainerWidth(leftPanelRef.current.clientWidth);
      }
      
      // 计算右侧网格项尺寸
      if (rightPanelRef.current) {
        const rightPanelWidth = rightPanelRef.current.clientWidth;
        const gridWidth = (rightPanelWidth - 48 - 24) / 3; // 减去padding和gap
        const gridHeight = gridWidth * 9 / 16; // 16:9比例
        setGridItemDimensions({
          width: Math.floor(gridWidth),
          height: Math.floor(gridHeight)
        });
      }
    };

    // 初始化
    updateContainerWidth();

    // 监听窗口尺寸变化
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, [isOpen]);

  // 获取模板场景数据
  useEffect(() => {
    if (isOpen && template) {
      const fetchScenes = async () => {
        setLoadingScenes(true);
        try {
          const templateScenes = await getTemplateScenes(template.id);
          setScenes(templateScenes);
        } catch (error) {
          console.error('Failed to fetch template scenes:', error);
          toast.error('获取场景列表失败');
          setScenes([]);
        } finally {
          setLoadingScenes(false);
        }
      };

      fetchScenes();
    } else {
      setScenes([]);
      setSelectedSceneIndex(null);
    }
  }, [isOpen, template]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoTimeUpdate = () => {
    // 可以在这里添加视频进度处理逻辑
  };

  const handleUseTemplate = () => {
    onUseTemplate(template);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
    >
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">{template.title}</h2>
            <p className="text-gray-600 mt-1">{template.description}</p>
            <div className="flex gap-2 mt-2">
              {template.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Video/Scene Preview */}
          <div ref={leftPanelRef} className="w-1/2 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedSceneIndex !== null ? `场景 ${selectedSceneIndex + 1}` : '预览视频'}
              </h3>
              {selectedSceneIndex !== null && (
                <button
                  onClick={() => setSelectedSceneIndex(null)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-md border border-gray-300 transition-colors duration-200 font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  返回视频
                </button>
              )}
            </div>
            
            {/* 16:9 比例容器 */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden w-full" style={{ paddingBottom: '56.25%' }}>
              <div className="absolute inset-0">
                {selectedSceneIndex !== null && scenes[selectedSceneIndex] ? (
                  // 显示选中的场景
                  <div className="w-full h-full flex items-center justify-center">
                    <ScenePreview
                      scene={scenes[selectedSceneIndex]}
                      width={containerWidth - 48} // 减去padding
                      height={(containerWidth - 48) * 9 / 16}
                    />
                  </div>
                ) : template.video ? (
                  // 显示视频
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-contain bg-black"
                      controls
                      onTimeUpdate={handleVideoTimeUpdate}
                      onEnded={() => setIsPlaying(false)}
                      onError={(e) => {
                        console.error('Video load error:', e);
                        toast.error('视频加载失败');
                      }}
                      onLoadStart={() => console.log('Video loading started')}
                      onCanPlay={() => console.log('Video can play')}
                      poster={template.thumbnail}
                      preload="metadata"
                    >
                      <source src={template.video} type="video/mp4" />
                      您的浏览器不支持视频播放。
                    </video>
                  </>
                ) : (
                  // 显示缩略图
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
          </div>

          {/* Right Panel - Scenes Grid */}
          <div ref={rightPanelRef} className="w-1/2 p-6 border-l flex flex-col">
            <h3 className="text-lg font-semibold mb-4">
              场景 ({scenes.length})
            </h3>
            <div className="flex-1 overflow-y-auto">
              {loadingScenes ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>加载场景中...</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {scenes.map((scene, index) => (
                    <div
                      key={scene.id}
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                        ${selectedSceneIndex === index 
                          ? 'border-blue-500 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }
                      `}
                      onClick={() => setSelectedSceneIndex(index)}
                      style={{ aspectRatio: '16/9' }}
                    >
                      <div className="w-full h-full bg-gray-50">
                        <ScenePreview
                          scene={scene}
                          width={gridItemDimensions.width}
                          height={gridItemDimensions.height}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
          <button
            onClick={handleUseTemplate}
            disabled={isCreating}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isCreating ? '创建中...' : '使用模板'}
          </button>
        </div>
      </div>
    </div>
  );
}