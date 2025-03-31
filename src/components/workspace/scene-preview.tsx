"use client"

import { Scene, ColorBackground, ImageBackground, VideoBackground } from '@/types/scene';

interface ScenePreviewProps {
  scene: Scene;
  width: number;
  height: number;
}

/**
 * ScenePreview组件 - 用于在时间轴中渲染场景的简化预览
 */
export function ScenePreview({ scene, width, height }: ScenePreviewProps) {
  // 渲染背景
  const renderBackground = () => {
    if (!scene.background) return null;
    
    const background = scene.background;
    
    if (background.type === "color") {
      return (
        <div 
          className="absolute inset-0" 
          style={{ backgroundColor: (background as ColorBackground).color }}
        />
      );
    } else if (background.type === "image") {
      return (
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${(background as ImageBackground).src})` }}
        />
      );
    } else if (background.type === "video") {
      // 对于视频背景，使用缩略图
      const videoBackground = background as VideoBackground;
      if (videoBackground.thumbnail) {
        return (
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${videoBackground.thumbnail})` }}
          />
        );
      }
      return (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <span className="text-xs text-gray-500">视频</span>
        </div>
      );
    }
    
    return null;
  };
  
  // 渲染文本元素
  const renderTexts = () => {
    if (!scene.texts || scene.texts.length === 0) return null;
    
    return scene.texts.map((text, index) => {
      // 计算缩放比例
      const scaleX = width / 1920; // 假设原始宽度为1920
      const scaleY = height / 1080; // 假设原始高度为1080
      
      return (
        <div 
          key={index}
          className="absolute overflow-hidden text-ellipsis whitespace-nowrap"
          style={{
            left: `${text.x * scaleX}px`,
            top: `${text.y * scaleY}px`,
            width: `${text.width * scaleX}px`,
            height: `${text.height * scaleY}px`,
            fontSize: `${text.fontSize * Math.min(scaleX, scaleY)}px`,
            fontFamily: text.fontFamily || 'sans-serif',
            color: text.fontColor || '#000000',
            backgroundColor: text.backgroundColor || 'transparent',
            fontWeight: text.bold ? 'bold' : 'normal',
            fontStyle: text.italic ? 'italic' : 'normal',
            textAlign: text.alignment || 'left',
            transform: `rotate(${text.rotation}deg)`,
            zIndex: text.zIndex || 1
          }}
        >
          {text.content}
        </div>
      );
    });
  };
  
  // 渲染媒体元素
  const renderMedia = () => {
    if (!scene.media || scene.media.length === 0) return null;
    
    return scene.media.map((mediaItem, index) => {
      // 计算缩放比例
      const scaleX = width / 1920; // 假设原始宽度为1920
      const scaleY = height / 1080; // 假设原始高度为1080
      
      const element = mediaItem.element;
      
      if (mediaItem.type === "image") {
        return (
          <div 
            key={index}
            className="absolute overflow-hidden"
            style={{
              left: `${element.x * scaleX}px`,
              top: `${element.y * scaleY}px`,
              width: `${element.width * scaleX}px`,
              height: `${element.height * scaleY}px`,
              transform: `rotate(${element.rotation}deg)`,
              zIndex: element.zIndex || 1
            }}
          >
            <img 
              src={element.src} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
        );
      } else if (mediaItem.type === "video") {
        // 对于视频元素，使用缩略图
        return (
          <div 
            key={index}
            className="absolute overflow-hidden"
            style={{
              left: `${element.x * scaleX}px`,
              top: `${element.y * scaleY}px`,
              width: `${element.width * scaleX}px`,
              height: `${element.height * scaleY}px`,
              transform: `rotate(${element.rotation}deg)`,
              zIndex: element.zIndex || 1
            }}
          >
            {/* {element.thumbnail ? (
              <img 
                src={element.thumbnail} 
                alt="" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <span className="text-xs text-gray-500">视频</span>
              </div>
            )} */}
          </div>
        );
      }
      
      return null;
    });
  };
  
  // 渲染头像元素
  const renderAvatar = () => {
    if (!scene.avatar) return null;
    
    const avatar = scene.avatar;
    // 计算缩放比例
    const scaleX = width / 1920; // 假设原始宽度为1920
    const scaleY = height / 1080; // 假设原始高度为1080
    
    return (
      <div 
        className="absolute overflow-hidden"
        style={{
          left: `${avatar.x * scaleX}px`,
          top: `${avatar.y * scaleY}px`,
          width: `${avatar.width * scaleX}px`,
          height: `${avatar.height * scaleY}px`,
          transform: `rotate(${avatar.rotation}deg)`,
          zIndex: avatar.zIndex || 1
        }}
      >
        <img 
          src={avatar.src} 
          alt="Avatar" 
          className="w-full h-full object-cover"
        />
      </div>
    );
  };
  
  return (
    <div 
      className="relative overflow-hidden"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {renderBackground()}
      {renderTexts()}
      {renderMedia()}
      {renderAvatar()}
    </div>
  );
}