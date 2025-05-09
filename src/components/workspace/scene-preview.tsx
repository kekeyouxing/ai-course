"use client"

import React from 'react';
import { Scene, ColorBackground, ImageBackground, VideoBackground } from '@/types/scene';
import { CANVAS_DIMENSIONS } from '@/hooks/use-canvas-dimensions';

interface ScenePreviewProps {
  scene: Scene;
  width: number;
  height: number;
}

/**
 * ScenePreview组件 - 用于在时间轴中渲染场景的简化预览
 */
export function ScenePreview({ scene, width, height }: ScenePreviewProps) {
  // 基于场景的宽高比计算缩放比例
  const aspectRatio = scene.aspectRatio || "16:9"; // 如果未指定，默认使用16:9
  const { width: baseWidth, height: baseHeight } = CANVAS_DIMENSIONS[aspectRatio];
  
  // 计算缩放比例
  const scaleX = width / baseWidth;
  const scaleY = height / baseHeight;
  
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

  // 渲染不同形状的SVG
  const renderShapeSVG = (
    type: string, 
    fill: string, 
    stroke: string, 
    strokeWidth: number, 
    borderRadius?: number,
    scaleX: number = 1,
    scaleY: number = 1
  ) => {
    // 在时间轴预览中，原始的strokeWidth需要进行缩放
    // 但不需要设置最小值，要保持与resizable-shape一致
    const scaledStrokeWidth = strokeWidth * Math.min(scaleX, scaleY);
    
    const style = {
      fill,
      stroke,
      strokeWidth: scaledStrokeWidth,
      width: '100%',
      height: '100%',
    };

    // 空心形状的样式
    const hollowStyle = {
      fill: 'none',
      stroke,
      strokeWidth: scaledStrokeWidth,
      width: '100%',
      height: '100%',
    };
    
    // 重要：borderRadius不需要缩放处理，直接使用原始值
    // 因为在SVG中，rx/ry是作为百分比值解释的，而不是像素
    
    switch (type) {
      // 基础实心形状
      case 'rectangle':
        return <rect width="100%" height="100%" rx={borderRadius} ry={borderRadius} style={style} />;
      case 'circle':
        return <circle cx="50%" cy="50%" r="45%" style={style} />;
      case 'triangle':
        return <polygon points={`50%,10% 10%,90% 90%,90%`} style={style} />;
      case 'diamond':
      case 'rhombus':
        return <polygon points={`50%,10% 90%,50% 50%,90% 10%,50%`} style={style} />;
      case 'star':
        return <polygon points="50,5 63,38 100,38 69,59 82,95 50,75 18,95 31,59 0,38 37,38" style={{ ...style, transform: 'scale(0.9)' }} />;
      
      // 基础空心形状
      case 'hollowRectangle':
        return <rect width="100%" height="100%" rx={borderRadius} ry={borderRadius} style={hollowStyle} />;
      case 'hollowCircle':
        return <circle cx="50%" cy="50%" r="45%" style={hollowStyle} />;
      case 'hollowTriangle':
        return <polygon points={`50%,10% 10%,90% 90%,90%`} style={hollowStyle} />;
      case 'hollowStar':
        return <polygon points="50,5 63,38 100,38 69,59 82,95 50,75 18,95 31,59 0,38 37,38" style={{ ...hollowStyle, transform: 'scale(0.9)' }} />;
        
      // 特殊形状
      case 'pacman':
        return <path d="M50,20 A30,30 0 1 0 50,80 L50,50 Z" style={style} />;
      case 'quarterCircle':
        return <path d="M10,90 L10,10 L90,10 A80,80 0 0 1 10,90 Z" style={style} />;
      case 'halfCircle':
        return <path d="M10,50 A40,40 0 0 1 90,50 L10,50 Z" style={style} />;
      case 'cross':
        return <path d="M35,10 H65 V35 H90 V65 H65 V90 H35 V65 H10 V35 H35 Z" style={style} />;
      
      // 多边形
      case 'pentagon':
        return <polygon points="50,5 95,35 80,90 20,90 5,35" style={{ ...style, transform: 'scale(0.9)' }} />;
      case 'hexagon':
        return <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" style={{ ...style, transform: 'scale(0.9)' }} />;
      case 'trapezoid':
        return <polygon points="20,20 80,20 95,80 5,80" style={style} />;
      case 'parallelogram':
        return <polygon points="25,20 95,20 75,80 5,80" style={style} />;
        
      // 特殊图形
      case 'heart':
        return <path d="M50,90 C100,65 100,25 75,15 C55,8 50,25 50,25 C50,25 45,8 25,15 C0,25 0,65 50,90 Z" style={{ ...style, transform: 'scale(0.9)' }} />;
      case 'arrow':
        return <polygon points="0,40 70,40 70,20 100,50 70,80 70,60 0,60" style={{ ...style, transform: 'scale(0.9)' }} />;
      case 'rightArrow':
        return (
          <g style={{ transform: 'scale(0.9)' }}>
            <line x1="10" y1="50" x2="70" y2="50" style={{ ...hollowStyle, strokeWidth: scaledStrokeWidth * 2 }} />
            <polyline points="50,20 80,50 50,80" style={{ ...hollowStyle, strokeWidth: scaledStrokeWidth * 2, fill: 'none' }} />
          </g>
        );
      case 'line':
        return <line x1="10%" y1="50%" x2="90%" y2="50%" style={{ ...hollowStyle, strokeWidth: scaledStrokeWidth * 2 }} />;
      
      default:
        return <rect width="100%" height="100%" style={style} />;
    }
  };
  
  return (
    <div 
      className="relative overflow-hidden"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Combine all elements and sort by zIndex */}
      {(() => {
        // Create an array of all renderable elements with their zIndex
        const elements = [];
        
        // Add background
        if (scene.background) {
          elements.push({ 
            type: 'background', 
            zIndex: 0, // Default background to lowest zIndex
            render: () => renderBackground() 
          });
        }
        
        // Add texts
        if (scene.texts && scene.texts.length > 0) {
          scene.texts.forEach((text, idx) => {
            elements.push({
              type: 'text',
              id: `text-${idx}`,
              zIndex: text.zIndex || 1,
              render: () => (
                <div 
                  key={`text-${idx}`}
                  className="absolute overflow-hidden whitespace-pre-wrap"
                  style={{
                    left: `${text.x * scaleX}px`,
                    top: `${text.y * scaleY}px`,
                    width: `${text.width * scaleX}px`,
                    height: "auto",
                    fontSize: `${text.fontSize * Math.min(scaleX, scaleY)}px`,
                    fontFamily: text.fontFamily || 'sans-serif',
                    color: text.fontColor || '#000000',
                    backgroundColor: text.backgroundColor || 'transparent',
                    fontWeight: text.bold ? 'bold' : 'normal',
                    fontStyle: text.italic ? 'italic' : 'normal',
                    textAlign: text.alignment || 'left',
                    transform: `rotate(${text.rotation}deg)`,
                    zIndex: text.zIndex || 1,
                    lineHeight: '1.2',
                    wordBreak: 'break-word'
                  }}
                >
                  {text.content}
                </div>
              )
            });
          });
        }
        
        // Add media
        if (scene.media && scene.media.length > 0) {
          scene.media.forEach((mediaItem, idx) => {
            const element = mediaItem.element;
            elements.push({
              type: 'media',
              id: `media-${idx}`,
              zIndex: element.zIndex || 1,
              render: () => {
                if (mediaItem.type === "image") {
                  return (
                    <div 
                      key={`media-${idx}`}
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
                  return (
                    <div 
                      key={`video-${idx}`}
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
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-500">视频</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }
            });
          });
        }
        
        // Add shapes
        if (scene.shapes && scene.shapes.length > 0) {
          scene.shapes.forEach((shape, idx) => {
            elements.push({
              type: 'shape',
              id: `shape-${idx}`,
              zIndex: shape.zIndex || 1,
              render: () => (
                <div 
                  key={`shape-${idx}`}
                  className="absolute"
                  style={{
                    left: `${shape.x * scaleX}px`,
                    top: `${shape.y * scaleY}px`,
                    width: `${shape.width * scaleX}px`,
                    height: `${shape.height * scaleY}px`,
                    transform: `rotate(${shape.rotation}deg)`,
                    zIndex: shape.zIndex || 1,
                    transformOrigin: 'center center'
                  }}
                >
                  <svg 
                    width="100%" 
                    height="100%" 
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                  >
                    {renderShapeSVG(shape.type, shape.fill, shape.stroke, shape.strokeWidth, shape.borderRadius, scaleX, scaleY)}
                  </svg>
                </div>
              )
            });
          });
        }
        
        // Add avatar
        if (scene.avatar) {
          const avatar = scene.avatar;
          elements.push({
            type: 'avatar',
            id: 'avatar',
            zIndex: avatar.zIndex || 1,
            render: () => (
              <div 
                key="avatar"
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
            )
          });
        }
        
        // Sort elements by zIndex
        elements.sort((a, b) => a.zIndex - b.zIndex);
        
        // Render all elements in order
        return elements.map((element) => (
          <React.Fragment key={element.id || `${element.type}-${element.zIndex}`}>
            {element.render()}
          </React.Fragment>
        ));
      })()}
    </div>
  );
}