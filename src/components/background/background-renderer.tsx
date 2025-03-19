import React, { useRef, useEffect } from 'react';
import { ColorBackground, ImageBackground, VideoBackground, Background } from '@/types/scene';

interface BackgroundRendererProps {
  background: Background;
  onClick?: (e: React.MouseEvent) => void;
  editorRef?: React.RefObject<HTMLDivElement | null>;
  children?: React.ReactNode;
  style?: React.CSSProperties; // 添加 style 属性
}

/**
 * BackgroundRenderer component handles rendering different types of backgrounds (color, image, video)
 * It encapsulates all the background-related rendering logic and event handling
 */
export const BackgroundRenderer: React.FC<BackgroundRendererProps> = ({ 
  background, 
  onClick, 
  editorRef,
  children,
  style // 接收 style 属性
}) => {
  // 获取背景样式
  const getBackgroundStyle = () => {
    if (background.type === "color") {
      return {
        backgroundColor: (background as ColorBackground).color,
        backgroundImage: "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: 1
      };
    } else if (background.type === "image") {
      return {
        backgroundColor: "transparent",
        backgroundImage: `url(${(background as ImageBackground).src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: 1
      };
    } else {
      return {
        backgroundColor: "transparent",
        backgroundImage: "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: 1
      };
    }
  };

  // 渲染视频背景
  const renderVideoBackground = () => {
    if (background.type !== "video") return null;
    
    const videoBackground = background as VideoBackground;
    
    return (
      <video
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 1 }}
        src={videoBackground.src}
        autoPlay
        loop={videoBackground.displayMode === "loop"}
        muted={videoBackground.volume === 0}
        onEnded={(e) => {
          if (videoBackground.displayMode === "freeze") {
            // 暂停在最后一帧
            e.currentTarget.currentTime = e.currentTarget.duration;
            e.currentTarget.pause();
          } else if (videoBackground.displayMode === "hide") {
            // 隐藏视频
            e.currentTarget.style.display = "none";
          }
          // loop模式会自动循环播放
        }}
        ref={(el) => {
          if (el) {
            // 设置音量
            el.volume = videoBackground.volume || 0;

            // 使用自定义属性存储上次的显示模式，避免重复播放
            const lastDisplayMode = el.getAttribute('data-display-mode');
            const currentDisplayMode = videoBackground.displayMode || 'loop';

            // 只有在显示模式变化或首次加载时才重置视频状态
            if (lastDisplayMode !== currentDisplayMode || !el.getAttribute('data-initialized')) {
              // 重置显示状态
              el.style.display = "block";

              if (videoBackground.displayMode === "freeze") {
                // 对于freeze模式，总是从头开始播放一次
                el.currentTime = 0;
                el.play();
              } else if (videoBackground.displayMode === "loop") {
                el.currentTime = 0;
                el.play();
              } else if (videoBackground.displayMode === "hide") {
                el.currentTime = 0;
                el.play();
              }

              // 标记为已初始化
              el.setAttribute('data-initialized', 'true');
              // 存储当前显示模式
              el.setAttribute('data-display-mode', currentDisplayMode);
            }
          }
        }}
      />
    );
  };

  return (
    <div
      ref={editorRef}
      className="shadow-md relative"
      style={{
        ...getBackgroundStyle(),
        ...(style || {})
      }}
      // data-width="1920"
      // data-height="1080"
      onClick={onClick}
    >
      {renderVideoBackground()}
      {children}
    </div>
  );
};