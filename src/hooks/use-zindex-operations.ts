import { useCallback } from 'react';
import { Scene, SelectedElementType } from '@/types/scene';
import { bringToFront, sendToBack, bringForward, sendBackward } from '@/utils/layer-controls';

/**
 * Hook for managing z-index operations
 */
export const useZIndexOperations = (
  scenes: Scene[],
  activeScene: number,
  selectedElement: SelectedElementType | null,
  updateHistory: (newScenes: Scene[]) => void
) => {
  // Bring element to front
  const handleBringToFront = useCallback(() => {
    if (!selectedElement) return;

    const newScenes = bringToFront(scenes, activeScene, selectedElement);
    if (newScenes) {
      updateHistory(newScenes);
    }
  }, [scenes, activeScene, selectedElement, updateHistory]);

  // Send element to back
  const handleSendToBack = useCallback(() => {
    if (!selectedElement) return;

    const newScenes = sendToBack(scenes, activeScene, selectedElement);
    if (newScenes) {
      updateHistory(newScenes);
    }
  }, [scenes, activeScene, selectedElement, updateHistory]);

  // Bring element forward
  const handleBringForward = useCallback(() => {
    if (!selectedElement) return;

    const newScenes = bringForward(scenes, activeScene, selectedElement);
    if (newScenes) {
      updateHistory(newScenes);
    }
  }, [scenes, activeScene, selectedElement, updateHistory]);

  // Send element backward
  const handleSendBackward = useCallback(() => {
    if (!selectedElement) return;

    const newScenes = sendBackward(scenes, activeScene, selectedElement);
    if (newScenes) {
      updateHistory(newScenes);
    }
  }, [scenes, activeScene, selectedElement, updateHistory]);

  return {
    handleBringToFront,
    handleSendToBack,
    handleBringForward,
    handleSendBackward
  };
};