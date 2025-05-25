"use client"

import React from 'react';
import { Scene, ColorBackground, ImageBackground, VideoBackground } from '@/types/scene';
import { CANVAS_DIMENSIONS } from '@/hooks/use-canvas-dimensions';
import { renderShape, getShapeAspectRatio } from '@/types/shapes';

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
    scaleY: number = 1,
    shapeWidth?: number,
    shapeHeight?: number
  ) => {
    // 在时间轴预览中，原始的strokeWidth需要进行缩放
    // 但不需要设置最小值，要保持与resizable-shape一致
    const scaledStrokeWidth = strokeWidth * Math.min(scaleX, scaleY);
    
    return renderShape({
      type: type as any,
      fill,
      stroke,
      strokeWidth: scaledStrokeWidth,
      borderRadius,
      scale: Math.min(scaleX, scaleY),
      // 为空心矩形传递动态viewBox尺寸
      viewBoxWidth: type === 'hollowRectangle' && shapeWidth && shapeHeight
        ? (shapeWidth / shapeHeight > 1 ? 100 * (shapeWidth / shapeHeight) : 100)
        : 100,
      viewBoxHeight: type === 'hollowRectangle' && shapeWidth && shapeHeight
        ? (shapeWidth / shapeHeight > 1 ? 100 : 100 / (shapeWidth / shapeHeight))
        : 100,
    });
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
                        className="w-full h-full object-contain"
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
            // 获取形状的理想viewBox
            const { viewBox } = getShapeAspectRatio(shape.type);
            
            // 为空心矩形动态计算viewBox以匹配实际宽高比
            let finalViewBox = viewBox;
            if (shape.type === 'hollowRectangle') {
              const actualAspectRatio = shape.width / shape.height;
              if (actualAspectRatio > 1) {
                // 宽矩形：保持高度100，调整宽度
                finalViewBox = `0 0 ${100 * actualAspectRatio} 100`;
              } else {
                // 高矩形：保持宽度100，调整高度
                finalViewBox = `0 0 100 ${100 / actualAspectRatio}`;
              }
            }
            
            // 决定形状的preserveAspectRatio属性
            const getPreserveAspectRatio = () => {
              // 对于可自由调整尺寸的形状，不保持宽高比
              if (shape.type === 'rectangle' || shape.type === 'hollowRectangle' || shape.type === 'arrow') {
                return "none";
              }
              // 对于其他形状，保持宽高比并居中
              return "xMidYMid meet";
            };
            
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
                    viewBox={finalViewBox}
                    preserveAspectRatio={getPreserveAspectRatio()}
                  >
                    {renderShapeSVG(shape.type, shape.fill, shape.stroke, shape.strokeWidth, shape.borderRadius, scaleX, scaleY, shape.width, shape.height)}
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
                  className="w-full h-full object-contain"
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