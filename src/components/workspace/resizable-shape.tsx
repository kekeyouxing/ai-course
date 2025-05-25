import { useRef, useState } from 'react';
import { ShapeElement, ShapeType } from '@/types/scene';
import { Rnd } from 'react-rnd';
import { AlignmentGuides } from "./alignment-guides";
import { checkForSnapping, AlignmentGuide } from "@/utils/alignment-utils";
import { ShapeRenderer, getShapeAspectRatio } from '@/types/shapes';

interface ResizableShapeProps extends ShapeElement {
  onResize: (newSize: { width: number; height: number; x: number; y: number; rotation: number }) => void;
  onSelect: () => void;
  isSelected: boolean;
  canvasWidth: number;
  canvasHeight: number;
  containerWidth: number;
  containerHeight: number;
  otherElements?: { x: number; y: number; width: number; height: number }[];
}

export function ResizableShape({
  type,
  width,
  height,
  x,
  y,
  rotation,
  fill,
  stroke,
  strokeWidth,
  borderRadius,
  onResize,
  onSelect,
  isSelected,
  canvasWidth,
  canvasHeight,
  containerWidth,
  containerHeight,
  otherElements,
  zIndex,
}: ResizableShapeProps) {
  const shapeRef = useRef<Rnd>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  
  // 计算缩放比例
  const scaleX = containerWidth / canvasWidth;
  const scaleY = containerHeight / canvasHeight;
  const scale = Math.min(scaleX, scaleY);
  
  // 根据缩放比例计算位置和大小
  const scaledWidth = width * scaleX;
  const scaledHeight = height * scaleY;
  const scaledX = x * scaleX;
  const scaledY = y * scaleY;

  // 获取形状的理想viewBox
  const { viewBox } = getShapeAspectRatio(type);

  // 决定形状的preserveAspectRatio属性
  const getPreserveAspectRatio = () => {
    // 对于可自由调整尺寸的形状，不保持宽高比
    if (type === 'rectangle' || type === 'hollowRectangle' || type === 'arrow') {
      return "none";
    }
    // 对于其他形状，保持宽高比并居中
    return "xMidYMid meet";
  };

  // 反向计算: 从UI尺寸转回画布尺寸
  const rescale = (uiValue: number, scale: number) => uiValue / scale;

  // 处理尺寸变化和位置变化
  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
    const newWidth = Math.round(rescale(parseFloat(ref.style.width), scaleX));
    const newHeight = Math.round(rescale(parseFloat(ref.style.height), scaleY));
    const newX = Math.round(rescale(position.x, scaleX));
    const newY = Math.round(rescale(position.y, scaleY));
    
    // 确保我们保留当前的旋转值
    onResize({
      width: newWidth,
      height: newHeight,
      x: newX,
      y: newY,
      rotation // 保持旋转角度不变
    });
  };

  // 处理拖拽过程中的对齐
  const handleDrag = (e: any, data: any) => {
    // Current element position (使用整数坐标)
    const currentElement = {
      x: Math.round(rescale(data.x, scaleX)),
      y: Math.round(rescale(data.y, scaleY)),
      width,
      height
    };
    
    // Use provided otherElements or empty array if not provided
    const elementsToAlign = otherElements || [];
    
    // Check for snapping
    const { guides } = checkForSnapping(currentElement, elementsToAlign, scale);
    
    // Update alignment guides
    setAlignmentGuides(guides);
  };

  // 处理拖拽结束事件
  const handleDragStop = (e: any, data: any) => {
    setIsDragging(false);
    // 清除对齐指南
    setAlignmentGuides([]);
    
    // 获取拖拽后的位置并确保为整数
    const newX = Math.round(rescale(data.x, scaleX));
    const newY = Math.round(rescale(data.y, scaleY));
    
    // 确保我们保留当前的旋转值
    onResize({
      width,
      height,
      x: newX,
      y: newY,
      rotation // 保持旋转角度不变
    });
  };

  // 计算选中时的边框样式
  const getBorderStyle = () => {
    if (isSelected) {
      return {
        border: '1px solid #2196f3',
        borderRadius: '2px',
      };
    }
    return {};
  };
  
  // 根据形状类型确定是否需要锁定宽高比
  const shouldLockAspectRatio = () => {
    // 长方形和箭头可以自由调整宽高
    if (type === 'rectangle' || type === 'hollowRectangle' || type === 'arrow') {
      return false;
    }
    // 其他形状需要保持宽高比
    return true;
  };

  return (
    <>
      {/* Alignment guides - only show when dragging */}
      {isDragging && alignmentGuides.length > 0 && (
        <AlignmentGuides guides={alignmentGuides} scale={scale} />
      )}
      
      <Rnd
        ref={shapeRef}
        size={{ width: scaledWidth, height: scaledHeight }}
        position={{ x: scaledX, y: scaledY }}
        onDragStart={() => {
          setIsDragging(true);
          onSelect();
        }}
        onDrag={handleDrag}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        onMouseDown={onSelect}
        onTouchStart={onSelect}
        style={{
          touchAction: 'none',
          zIndex: zIndex,
        }}
        resizeHandleStyles={{
          bottomRight: { display: isSelected ? 'block' : 'none' },
          bottomLeft: { display: isSelected ? 'block' : 'none' },
          topRight: { display: isSelected ? 'block' : 'none' },
          topLeft: { display: isSelected ? 'block' : 'none' },
        }}
        lockAspectRatio={shouldLockAspectRatio()}
        dragHandleClassName="drag-handle"
      >
        <div 
          className="drag-handle" 
          style={{ 
            width: '100%', 
            height: '100%',
            cursor: isDragging ? 'grabbing' : 'grab',
            position: 'relative',
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            ...getBorderStyle()
          }}
        >
          <svg 
            width="100%" 
            height="100%" 
            viewBox={viewBox}
            preserveAspectRatio={getPreserveAspectRatio()}
          >
            <ShapeRenderer 
              type={type} 
              fill={fill}
              stroke={stroke} 
              strokeWidth={strokeWidth}
              borderRadius={borderRadius}
              scale={scale}
            />
          </svg>
          
          {/* 选中边框和控制点 */}
          {isSelected && (
            <>
              {/* 角落的调整点 */}
              <div className="absolute top-0 right-0 w-3 h-3 bg-white border border-blue-500 rounded-full translate-x-1/2 -translate-y-1/2 cursor-nwse-resize">
                <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="absolute top-0 left-0 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-nesw-resize">
                <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-white border border-blue-500 rounded-full translate-x-1/2 translate-y-1/2 cursor-nesw-resize">
                <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 translate-y-1/2 cursor-nwse-resize">
                <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              {/* 边缘中点的调整点 */}
              <div className="absolute top-0 left-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-ns-resize">
                <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 translate-y-1/2 cursor-ns-resize">
                <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="absolute left-0 top-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-ew-resize">
                <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="absolute right-0 top-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full translate-x-1/2 -translate-y-1/2 cursor-ew-resize">
                <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
            </>
          )}
        </div>
      </Rnd>
    </>
  );
} 