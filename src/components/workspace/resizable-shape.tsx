import { useRef, useState } from 'react';
import { ShapeElement, ShapeType } from '@/types/scene';
import { Rnd } from 'react-rnd';
import { AlignmentGuides } from "./alignment-guides";
import { checkForSnapping, AlignmentGuide } from "@/utils/alignment-utils";

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

// 渲染不同形状的组件
const ShapeRenderer = ({ type, fill, stroke, strokeWidth, width, height, borderRadius = 0 }: {
  type: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  width: number;
  height: number;
  borderRadius?: number;
}) => {
  
  const style = {
    fill,
    stroke,
    strokeWidth,
    width: '100%',
    height: '100%',
  };

  // 空心形状的样式
  const hollowStyle = {
    fill: 'none',
    stroke,
    strokeWidth,
    width: '100%',
    height: '100%',
  };

  switch (type) {
    // 基础实心形状
    case 'rectangle':
      return <rect width="100%" height="100%" rx={borderRadius} ry={borderRadius} style={style} />;
    case 'circle':
      return <circle cx="50%" cy="50%" r="45%" style={style} />;
    case 'triangle':
      return (
        <polygon 
          points="50,10 10,90 90,90"
          style={style}
        />
      );
    case 'diamond':
    case 'rhombus':
      return (
        <polygon 
          points="50,10 90,50 50,90 10,50"
          style={style}
        />
      );
    case 'star':
      return (
        <polygon 
          points="50,5 63,38 100,38 69,59 82,95 50,75 18,95 31,59 0,38 37,38"
          style={{ ...style, transform: 'scale(0.9)' }}
        />
      );
    
    // 基础空心形状
    case 'hollowRectangle':
      return <rect width="100%" height="100%" rx={borderRadius} ry={borderRadius} style={hollowStyle} />;
    case 'hollowCircle':
      return <circle cx="50%" cy="50%" r="45%" style={hollowStyle} />;
    case 'hollowTriangle':
      return (
        <polygon 
          points="50,10 10,90 90,90"
          style={hollowStyle}
        />
      );
    case 'hollowStar':
      return (
        <polygon 
          points="50,5 63,38 100,38 69,59 82,95 50,75 18,95 31,59 0,38 37,38"
          style={{ ...hollowStyle, transform: 'scale(0.9)' }}
        />
      );
      
    // 特殊形状
    case 'pacman':
      return (
        <path
          d="M50,20 A30,30 0 1 0 50,80 L50,50 Z"
          style={style}
        />
      );
    case 'quarterCircle':
      return (
        <path
          d="M10,90 L10,10 L90,10 A80,80 0 0 1 10,90 Z"
          style={style}
        />
      );
    case 'halfCircle':
      return (
        <path
          d="M10,50 A40,40 0 0 1 90,50 L10,50 Z"
          style={style}
        />
      );
    case 'cross':
      return (
        <path
          d="M35,10 H65 V35 H90 V65 H65 V90 H35 V65 H10 V35 H35 Z"
          style={style}
        />
      );
      
    // 多边形
    case 'pentagon':
      return (
        <polygon 
          points="50,5 95,35 80,90 20,90 5,35"
          style={{ ...style, transform: 'scale(0.9)' }}
        />
      );
    case 'hexagon':
      return (
        <polygon 
          points="50,5 90,25 90,75 50,95 10,75 10,25"
          style={{ ...style, transform: 'scale(0.9)' }}
        />
      );
    case 'trapezoid':
      return (
        <polygon 
          points="20,20 80,20 95,80 5,80"
          style={style}
        />
      );
    case 'parallelogram':
      return (
        <polygon 
          points="25,20 95,20 75,80 5,80"
          style={style}
        />
      );
    
    // 特殊图形
    case 'heart':
      return (
        <path
          d="M50,90 C100,65 100,25 75,15 C55,8 50,25 50,25 C50,25 45,8 25,15 C0,25 0,65 50,90 Z"
          style={{ ...style, transform: 'scale(0.9)' }}
        />
      );
    case 'arrow':
      return (
        <polygon 
          points="0,40 70,40 70,20 100,50 70,80 70,60 0,60"
          style={{ ...style, transform: 'scale(0.9)' }}
        />
      );
    case 'rightArrow':
      return (
        <g style={{ transform: 'scale(0.9)' }}>
          <line x1="10" y1="50" x2="70" y2="50" style={{ ...hollowStyle, strokeWidth: strokeWidth * 2 }} />
          <polyline points="50,20 80,50 50,80" style={{ ...hollowStyle, strokeWidth: strokeWidth * 2, fill: 'none' }} />
        </g>
      );
    case 'line':
      return <line x1="10%" y1="50%" x2="90%" y2="50%" style={{ ...hollowStyle, strokeWidth: strokeWidth * 2 }} />;
    
    default:
      return <rect width="100%" height="100%" style={style} />;
  }
};

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
  otherElements
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
          zIndex: isSelected ? 1000 : undefined,
        }}
        resizeHandleStyles={{
          bottomRight: { display: isSelected ? 'block' : 'none' },
          bottomLeft: { display: isSelected ? 'block' : 'none' },
          topRight: { display: isSelected ? 'block' : 'none' },
          topLeft: { display: isSelected ? 'block' : 'none' },
        }}
        // lockAspectRatio={shouldLockAspectRatio()}
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
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
          >
            <ShapeRenderer 
              type={type} 
              fill={fill} 
              stroke={stroke} 
              strokeWidth={strokeWidth}
              width={width}
              height={height}
              borderRadius={borderRadius}
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