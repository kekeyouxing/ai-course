export type TextAlignment = "left" | "center" | "right"

// 定义比例类型
export type AspectRatioType = "16:9" | "9:16" | "1:1" | "4:3";

// 形状类型定义
export type ShapeType = 
  | "rectangle" 
  | "circle" 
  | "triangle" 
  | "star" 
  | "diamond" 
  | "pentagon" 
  | "hexagon" 
  | "heart" 
  | "arrow"
  | "hollowRectangle"  // 空心矩形
  | "hollowCircle"     // 空心圆形
  | "hollowTriangle"   // 空心三角形
  | "hollowStar"       // 空心星形
  | "pacman"           // Pacman形状
  | "quarterCircle"    // 四分之一圆
  | "halfCircle"       // 半圆
  | "cross"            // 十字形
  | "trapezoid"        // 梯形
  | "parallelogram"    // 平行四边形
  | "rhombus"          // 菱形
  | "rightArrow"       // 右箭头
  | "line";             // 直线

// 文本元素接口
export interface TextElement {
    content: string
    fontSize: number
    x: number
    y: number
    width: number
    height: number
    rotation: number
    fontFamily?: string
    fontColor?: string
    backgroundColor?: string
    bold?: boolean
    italic?: boolean
    alignment?: TextAlignment
    zIndex?: number; // 添加 zIndex 属性
    // 动画相关字段
    animationType?: "none" | "fade" | "slide";
    animationBehavior?: "enter" | "exit" | "both";
    animationDirection?: "right" | "left" | "down" | "up";
    startAnimationMarkerId?: string; // 开始动画的标记ID
    endAnimationMarkerId?: string;   // 结束动画的标记ID
}

// 图片元素接口
export interface ImageElement {
    src: string
    width: number
    height: number
    x: number
    y: number
    rotation: number
    zIndex?: number; // 添加 zIndex 属性
    // 动画相关字段
    animationType?: "none" | "fade" | "slide";
    animationBehavior?: "enter" | "exit" | "both";
    animationDirection?: "right" | "left" | "down" | "up";
    startAnimationMarkerId?: string; // 开始动画的标记ID
    endAnimationMarkerId?: string;   // 结束动画的标记ID
}

// 视频元素接口
export interface VideoElement {
    src: string
    width: number
    height: number
    x: number
    y: number
    rotation: number
    volume?: number // 音量，0-1之间
    zIndex: number; // 添加 zIndex 属性
    autoplay: boolean;
    thumbnail: string; // 添加缩略图字段
    duration: number; // 添加时长字段（秒）
    loop?: boolean
    displayMode: "freeze" | "hide" | "loop"; // 显示模式
    // 动画相关字段
    animationType?: "none" | "fade" | "slide";
    animationBehavior?: "enter" | "exit" | "both";
    animationDirection?: "right" | "left" | "down" | "up";
    startAnimationMarkerId?: string; // 开始动画的标记ID
    endAnimationMarkerId?: string;   // 结束动画的标记ID
}

// 形状元素接口
export interface ShapeElement {
    type: ShapeType
    width: number
    height: number
    x: number
    y: number
    rotation: number
    fill: string
    stroke: string
    strokeWidth: number
    zIndex: number
    borderRadius?: number // 圆角半径，仅对矩形和空心矩形有效
    // 动画相关字段
    animationType?: "none" | "fade" | "slide";
    animationBehavior?: "enter" | "exit" | "both";
    animationDirection?: "right" | "left" | "down" | "up";
    startAnimationMarkerId?: string; // 开始动画的标记ID
    endAnimationMarkerId?: string;   // 结束动画的标记ID
}

// 媒体类型基础接口
export interface MediaBase {
    type: "image" | "video";
    id: string; // 添加唯一标识符
}

// 图片媒体
export interface ImageMedia extends MediaBase {
    type: "image";
    element: ImageElement;
}

// 视频媒体
export interface VideoMedia extends MediaBase {
    type: "video";
    element: VideoElement;
}

// 媒体项类型
export type MediaItem = ImageMedia | VideoMedia;

// 媒体联合类型
export type Media = MediaItem[];

// 头像元素接口
export interface AvatarElement {
    src: string
    width: number
    height: number
    x: number
    y: number
    rotation: number
    zIndex?: number; // 添加 zIndex 属性
}

// 背景基础接口
export interface BackgroundBase {
    type: "color" | "image" | "video";
}

// 颜色背景
export interface ColorBackground extends BackgroundBase {
    type: "color";
    color: string;
}

// 图片背景
export interface ImageBackground extends BackgroundBase {
    type: "image";
    src: string;
}

// 视频背景
export interface VideoBackground extends BackgroundBase {
    type: "video";
    src: string;
    duration: number;
    thumbnail?: string; // 添加缩略图字段
    volume?: number; // 音量，0-1之间
    displayMode?: "freeze" | "hide" | "loop"; // 显示模式
}

// 背景联合类型
export type Background = ColorBackground | ImageBackground | VideoBackground;

// 场景接口
export interface Scene {
    id: string      // 添加唯一标识符
    title: string
    media?: Media
    texts?: TextElement[]
    avatar?: AvatarElement | null
    background?: Background
    shapes?: ShapeElement[] // 添加形状数组
    script?: string  // 添加脚本字段
    audioSrc?: string
    duration?: number
    aspectRatio?: AspectRatioType  // 添加宽高比例字段
    language?: "zh" | "en"  // 添加语言字段，默认为中文
    voiceId?: string  // 添加声音ID字段
}

// 选中元素类型
export interface SelectedElementType {
    type: "text" | "image" | "video" | "avatar" | "shape"
    index?: number
    mediaId?: string // 添加媒体ID用于标识特定媒体元素
}
// 项目状态
export type ProjectStatus = "draft" | "published";

// 项目接口
export interface Project {
    id: string                  // 项目唯一标识符
    name: string                // 项目名称
    scenes: Scene[]             // 项目包含的场景
    createdAt: Date             // 创建时间
    updatedAt: Date             // 最后更新时间
    status: ProjectStatus       // 项目状态
    originalPptUrl?: string     // 原始PPT文件URL（如果是从PPT导入）
    createdBy?: string          // 创建者ID
}