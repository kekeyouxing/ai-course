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
    alignment?: "left" | "center" | "right"
}

// 图片元素接口
export interface ImageElement {
    src: string
    width: number
    height: number
    x: number
    y: number
    rotation: number
}

// 头像元素接口
export interface AvatarElement {
    src: string
    width: number
    height: number
    x: number
    y: number
    rotation: number
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
    title: string;
}

// 视频背景
export interface VideoBackground extends BackgroundBase {
    type: "video";
    src: string;
    title: string;
    duration: string;
    thumbnail?: string; // 添加缩略图字段
}

// 背景联合类型
export type Background = ColorBackground | ImageBackground | VideoBackground;

// 场景接口
export interface Scene {
    title: string
    image: ImageElement | null
    texts: TextElement[]
    avatar: AvatarElement | null
    background: Background
}

// 选中元素类型
export interface SelectedElementType {
    type: "text" | "image" | "avatar"
    index?: number
}