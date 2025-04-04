export interface AnimationMarker {
  id: string;           // 唯一标识符
  description: string;  // 描述（通常是上下文文本）
  sceneId: string;      // 所属场景ID
  timestamp?: number;   // 时间戳（可选）
  type: 'animation';    // 标记类型
}

// 用于在组件间共享的动画标记列表
export type AnimationMarkers = AnimationMarker[];