import { useCallback } from 'react';
import { Scene, Background } from '@/types/scene';

/**
 * Hook for managing background operations
 */
export const useBackgroundOperations = (
  scenes: Scene[],
  activeScene: number,
  updateHistory: (newScenes: Scene[]) => void
) => {
  // Handle background change
  const handleBackgroundChange = useCallback(
    (background: Background) => {
      const newScenes = [...scenes];
      newScenes[activeScene].background = background;
      updateHistory(newScenes);
    },
    [scenes, activeScene, updateHistory]
  );

  return {
    handleBackgroundChange
  };
};