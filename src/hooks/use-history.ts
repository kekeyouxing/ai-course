import { useState, useCallback } from 'react';
import { Scene } from '@/types/scene';

/**
 * Hook for managing editor history (undo/redo)
 */
export const useHistory = (initialScenes: Scene[] = []) => {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);
  const [history, setHistory] = useState<Scene[][]>([initialScenes]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Update history with new scenes
  const updateHistory = useCallback(
    (newScenes: Scene[]) => {
      // If not at the end of history, truncate history
      const newHistory = history.slice(0, historyIndex + 1);
      // Add new state to history
      newHistory.push(JSON.parse(JSON.stringify(newScenes))); // Deep copy to ensure state independence
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setScenes(JSON.parse(JSON.stringify(newScenes))); // Ensure state update
    },
    [history, historyIndex]
  );

  // Undo operation
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      // Use deep copy to ensure state independence
      setScenes(JSON.parse(JSON.stringify(history[newIndex])));
    }
  }, [history, historyIndex]);

  // Redo operation
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      // Use deep copy to ensure state independence
      setScenes(JSON.parse(JSON.stringify(history[newIndex])));
    }
  }, [history, historyIndex]);

  return {
    scenes,
    setScenes,
    history,
    historyIndex,
    updateHistory,
    handleUndo,
    handleRedo
  };
};