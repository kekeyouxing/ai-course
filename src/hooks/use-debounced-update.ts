import { useCallback, useEffect, useRef } from 'react';
import { updateScene } from '@/api/scene';
import { Scene } from '@/types/scene';
import { toast } from 'sonner';

/**
 * 使用防抖处理的场景更新Hook
 * @param sceneId 场景ID
 * @param debounceTime 防抖时间（毫秒）
 * @returns 一个回调函数，用于触发场景更新
 */
export const useDebouncedSceneUpdate = (debounceTime = 2000) => {
  // 用于存储最近一次的更新请求
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 用于跟踪正在处理的更新请求
  const pendingUpdatesRef = useRef<Map<string, Partial<Scene>>>(new Map());
  // 用于跟踪更新状态
  const isUpdatingRef = useRef<Set<string>>(new Set());

  /**
   * 触发防抖更新，根据场景ID缓存最新的更新数据
   */
  const debouncedUpdate = useCallback(
    (sceneId: string, updates: Partial<Scene>, showToast = false) => {
      if (!sceneId) {
        console.error('场景ID不能为空');
        return;
      }

      // 合并同一场景的更新
      const currentUpdates = pendingUpdatesRef.current.get(sceneId) || {};
      pendingUpdatesRef.current.set(sceneId, { ...currentUpdates, ...updates });

      // 清除现有的计时器
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }

      // 设置新的计时器
      updateTimerRef.current = setTimeout(() => {
        // 处理所有待更新的场景
        pendingUpdatesRef.current.forEach(async (sceneUpdates, id) => {
          if (isUpdatingRef.current.has(id)) return; // 跳过正在更新的场景
          
          try {
            isUpdatingRef.current.add(id);
            await updateScene(id, sceneUpdates);
            pendingUpdatesRef.current.delete(id);
            if (showToast) {
              toast.success('已保存更改');
            }
          } catch (error) {
            console.error(`更新场景 ${id} 失败:`, error);
            if (showToast) {
              toast.error('保存更改失败，请重试');
            }
          } finally {
            isUpdatingRef.current.delete(id);
          }
        });
      }, debounceTime);
    },
    [debounceTime]
  );

  // 组件卸载时处理未完成的更新
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
        
        // 立即处理所有待更新的场景
        pendingUpdatesRef.current.forEach(async (sceneUpdates, id) => {
          if (!isUpdatingRef.current.has(id)) {
            try {
              await updateScene(id, sceneUpdates);
            } catch (error) {
              console.error(`组件卸载时更新场景 ${id} 失败:`, error);
            }
          }
        });
      }
    };
  }, []);

  return debouncedUpdate;
}; 