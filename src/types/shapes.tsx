import React from 'react';
import { ShapeType } from './scene';

/**
 * 形状渲染器接口
 */
interface ShapeRendererProps {
  type: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius?: number;
  scale?: number;
  // 为空心矩形添加动态viewBox支持
  viewBoxWidth?: number;
  viewBoxHeight?: number;
}

/**
 * 通用形状渲染函数 - 生成SVG元素
 * 
 * @param props ShapeRendererProps - 形状渲染器属性
 * @returns SVG元素
 */
export const renderShape = (props: ShapeRendererProps): React.ReactNode => {
  const { type, fill, stroke, strokeWidth, borderRadius = 0, scale = 1, viewBoxWidth = 100, viewBoxHeight = 100 } = props;
  
  // 计算缩放后的描边宽度
  const scaledStrokeWidth = strokeWidth * scale;
  
  // 基础样式
  const style = {
    fill,
    stroke,
    strokeWidth: scaledStrokeWidth,
  };

  // 空心形状的样式
  const hollowStyle = {
    fill: 'none',
    stroke,
    strokeWidth: scaledStrokeWidth,
  };
  
  // 空心矩形的特殊样式 - 使用vector-effect保持描边一致性
  const hollowRectangleStyle = {
    fill: 'none',
    stroke,
    strokeWidth: scaledStrokeWidth,
    vectorEffect: 'non-scaling-stroke' as const, // 保持描边宽度不随SVG缩放变化
  };
  
  switch (type) {
    // 基础实心形状
    case 'rectangle':
      return <rect width="100%" height="100%" rx={borderRadius} ry={borderRadius} style={style} />;
    
    case 'circle':
      return <circle cx="50%" cy="50%" r="45%" style={style} />;
    
    case 'triangle':
      return <polygon points="50,5 5,95 95,95" style={style} />;
    
    case 'diamond':
      return <polygon points="50,0 100,50 50,100 0,50" style={style} />;
    
    case 'star':
      return (
        <polygon 
          points="50,5 63,38 100,38 69,59 82,95 50,75 18,95 31,59 0,38 37,38"
          style={{ ...style, transform: 'scale(0.9)' }}
        />
      );
    
    // 基础空心形状
    case 'hollowRectangle':
      return <rect width={viewBoxWidth} height={viewBoxHeight} rx={borderRadius} ry={borderRadius} style={hollowRectangleStyle} />;
    
    case 'hollowCircle':
      return <circle cx="50%" cy="50%" r="45%" style={hollowStyle} />;
    
    case 'hollowTriangle':
      return (
        <path 
          d="M50,5 L5,95 L95,95 Z" 
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
    case 'quarterCircle':
      return <path d="M0,100 L0,0 L100,0 A100,100 0 0 1 0,100 Z" style={style} />;
    
    case 'halfCircle':
      return <path d="M0,50 A50,50 0 0 1 100,50 L0,50 Z" style={style} />;
    
    case 'cross':
      return <path d="M35,0 H65 V35 H100 V65 H65 V100 H35 V65 H0 V35 H35 Z" style={style} />;
      
    // 多边形
    case 'pentagon':
      return (
        <polygon 
          points="50,0 95,35 77,90 23,90 5,35"
          style={style}
        />
      );
    
    case 'hexagon':
      return (
        <polygon 
          points="25,0 75,0 100,50 75,100 25,100 0,50"
          style={style}
        />
      );
    
    case 'trapezoid':
      return <polygon points="0,50 100,50 80,0 20,0" style={style} />;
    
    case 'parallelogram':
      return <polygon points="0,50 80,50 100,0 20,0" style={style} />;
    
    case 'arrow':
      return (
        <polygon 
          points="0,15 70,15 70,0 100,25 70,50 70,35 0,35"
          style={style}
        />
      );
    
    default:
      return <rect width="100%" height="100%" style={style} />;
  }
};

/**
 * SVG形状渲染组件
 */
export const ShapeRenderer: React.FC<ShapeRendererProps> = (props) => {
  return renderShape(props);
};

/**
 * 获取形状的理想宽高比
 * 用于决定形状在容器中的渲染方式
 * 
 * @param type 形状类型
 * @returns 宽高比配置对象 {aspectRatio: 宽/高, viewBox: SVG viewBox}
 */
export const getShapeAspectRatio = (type: ShapeType): { aspectRatio: number, viewBox: string } => {
  switch (type) {
    case 'rectangle':
    case 'hollowRectangle':
      return { aspectRatio: 1, viewBox: '0 0 100 100' }; // 矩形可以任意宽高比
      
    case 'halfCircle':
      return { aspectRatio: 2, viewBox: '0 0 100 50' }; // 宽度是高度的2倍
    
    case 'arrow':
      return { aspectRatio: 2, viewBox: '0 0 100 50' }; // 箭头实际宽高比为2:1
    
    case 'triangle':
    case 'hollowTriangle':
      return { aspectRatio: 1, viewBox: '0 0 100 100' }; // 使用方形viewBox确保所有边都可见
      
    case 'diamond':
      return { aspectRatio: 1, viewBox: '0 0 100 100' }; // 菱形保持1:1的宽高比
    
    case 'hollowCircle':
      return { aspectRatio: 1, viewBox: '0 0 100 100' }; // 空心圆保持1:1的宽高比
    
    case 'star':
    case 'hollowStar':
      return { aspectRatio: 100/90, viewBox: '0 0 100 90' }; // 根据星形实际坐标计算的准确宽高比
    
    case 'pentagon':
      return { aspectRatio: 1, viewBox: '0 0 100 100' }; // 五边形保持1:1的宽高比
    
    case 'hexagon':
      return { aspectRatio: 1, viewBox: '0 0 100 100' }; // 六边形保持1:1的宽高比
    
    case 'trapezoid':
      return { aspectRatio: 2, viewBox: '0 0 100 50' }; // 梯形宽高比为2:1
    
    case 'parallelogram':
      return { aspectRatio: 2, viewBox: '0 0 100 50' }; // 平行四边形宽高比为2:1
    
    case 'cross':
      return { aspectRatio: 1, viewBox: '0 0 100 100' }; // 十字形保持1:1的宽高比
    
    case 'quarterCircle':
      return { aspectRatio: 1, viewBox: '0 0 100 100' }; // 四分之一圆保持1:1的宽高比
      
    // 默认正方形比例
    default:
      return { aspectRatio: 1, viewBox: '0 0 100 100' };
  }
};

/**
 * 获取形状的默认尺寸
 * 
 * @param type 形状类型
 * @returns 默认尺寸 {width, height}
 */
export const getShapeDefaultSize = (type: ShapeType): { width: number, height: number } => {
  switch (type) {
    // 保持方形比例的形状
    case 'circle':
    case 'hollowCircle':
      return { width: 180, height: 180 };
    
    case 'star':
    case 'hollowStar':
      return { width: 180, height: 162 }; // 根据准确的宽高比(100:90)调整
      
    case 'pentagon':
      return { width: 170, height: 170 };
      
    case 'hexagon':
      return { width: 170, height: 170 };
      
    case 'quarterCircle':
      return { width: 170, height: 170 }; // 提高尺寸使其更协调
      
    case 'cross':
      return { width: 170, height: 170 }; // 提高尺寸与其他形状协调
      
    // 宽形状
    case 'rectangle':
    case 'hollowRectangle':
      return { width: 200, height: 200 };
      
    case 'parallelogram':
      return { width: 200, height: 100 };
      
    case 'trapezoid':
      return { width: 200, height: 100 };
      
    // 箭头形状
    case 'arrow':
      return { width: 200, height: 100 }; // 调整为更合适的尺寸
      
    // 三角形 - 正三角形
    case 'triangle':
    case 'hollowTriangle':
      return { width: 180, height: 180 }; // 正方形容器适合修改后的三角形
      
    // 垂直方向上更高的形状
    case 'diamond':
      return { width: 160, height: 160 }; // 菱形尺寸根据设计效果调整
      
    // 半圆形状 - 宽度是高度的两倍
    case 'halfCircle':
      return { width: 260, height: 130 };
      
    // 默认正方形尺寸
    default:
      return { width: 180, height: 180 };
  }
}; 