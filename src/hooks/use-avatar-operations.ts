import { useCallback } from 'react';
import { Scene, AvatarElement } from '@/types/scene';

/**
 * Hook for managing avatar operations
 */
export const useAvatarOperations = (
  scenes: Scene[],
  activeScene: number,
  updateHistory: (newScenes: Scene[]) => void,
  setSelectedElement: (element: any) => void,
  currentCanvasDimensions: { width: number, height: number }
) => {
  // Handle avatar resize
  const handleAvatarResize = useCallback(
    (newSize: Partial<AvatarElement>) => {
      const newScenes = [...scenes];
      if (newScenes[activeScene].avatar) {
        newScenes[activeScene].avatar = { ...newScenes[activeScene].avatar, ...newSize } as AvatarElement;
        updateHistory(newScenes);
      }
    },
    [scenes, activeScene, updateHistory]
  );

  // Handle avatar selection
  const handleSelectAvatar = useCallback(
    (avatarSrc: string) => {
      const newScenes = [...scenes];

      // Create new avatar element or update existing one
      const newAvatar: AvatarElement = {
        src: avatarSrc,
        width: 400,
        height: 400,
        x: currentCanvasDimensions.width / 2 - 200, // Center placement
        y: currentCanvasDimensions.height / 2 - 200,
        rotation: 0,
        zIndex: 10,
      };

      // Update current scene's avatar
      newScenes[activeScene].avatar = newAvatar;

      // Update history
      updateHistory(newScenes);

      // Select newly added avatar element
      setSelectedElement({
        type: "avatar"
      });
    },
    [scenes, activeScene, updateHistory, currentCanvasDimensions, setSelectedElement]
  );

  return {
    handleAvatarResize,
    handleSelectAvatar
  };
};