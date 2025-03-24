import { useState, useCallback } from 'react';
import { AspectRatioType, Scene } from '@/types/scene';

// Canvas dimensions constants
export const CANVAS_DIMENSIONS = {
  "16:9": { width: 1920, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "1:1": { width: 1080, height: 1080 },
  "4:3": { width: 1440, height: 1080 }
};

/**
 * Hook for managing canvas dimensions and aspect ratio
 */
export const useCanvasDimensions = (initialScenes: Scene[]) => {
  // Initialize aspect ratio from first scene or default to 16:9
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>(() => {
    return initialScenes[0]?.aspectRatio || "16:9";
  });

  // Get current aspect ratio based on active scene
  const getCurrentAspectRatio = useCallback((scenes: Scene[], activeScene: number) => {
    // If current scene has aspect ratio, use it
    if (scenes[activeScene]?.aspectRatio) {
      return scenes[activeScene].aspectRatio;
    }
    // Otherwise use global setting
    return aspectRatio;
  }, [aspectRatio]);

  // Get current canvas dimensions
  const getCanvasDimensions = useCallback((scenes: Scene[], activeScene: number) => {
    const currentAspectRatio = getCurrentAspectRatio(scenes, activeScene);
    return CANVAS_DIMENSIONS[currentAspectRatio];
  }, [getCurrentAspectRatio]);

  return {
    aspectRatio,
    setAspectRatio,
    getCurrentAspectRatio,
    getCanvasDimensions,
    CANVAS_DIMENSIONS
  };
};