import { useCallback } from 'react';
import { Scene, AspectRatioType } from '@/types/scene';
import { v4 as uuidv4 } from 'uuid';
import { useAnimationMarkers } from './animation-markers-context';

/**
 * Hook for managing scene operations
 */
export const useSceneOperations = (
  scenes: Scene[],
  updateHistory: (newScenes: Scene[]) => void,
  setActiveScene: (index: number) => void,
  setSelectedElement: (element: any) => void,
  setAspectRatio: (ratio: AspectRatioType) => void,
  aspectRatio: AspectRatioType
) => {
  const { setCurrentSceneId } = useAnimationMarkers();

  // Handle scene click/selection
  const handleSceneClick = useCallback((index: number) => {
    setActiveScene(index);
    setSelectedElement(null);
    
    // Set current scene ID for animation markers
    setCurrentSceneId(scenes[index].id);

    // Set current scene's aspect ratio
    if (scenes[index].aspectRatio) {
      setAspectRatio(scenes[index].aspectRatio);
    }
  }, [scenes, setActiveScene, setSelectedElement, setCurrentSceneId, setAspectRatio]);

  // Add new scene
  const addNewScene = useCallback(() => {
    const newScene: Scene = {
      id: uuidv4(),
      title: `Scene ${scenes.length + 1}`,
      media: [],
      texts: [],  // Initialize as empty array
      avatar: null,
      background: {
        type: "color",
        color: "#FFFFFF"
      },
      script: "",  // Ensure empty script field
      aspectRatio: aspectRatio  // Use current aspect ratio
    };
    
    updateHistory([...scenes, newScene]);
    setActiveScene(scenes.length);
  }, [scenes, updateHistory, setActiveScene, aspectRatio]);

  // Update script content
  const handleScriptUpdate = useCallback((newScript: string, activeScene: number) => {
    const newScenes = [...scenes];
    newScenes[activeScene].script = newScript;
    updateHistory(newScenes);
  }, [scenes, updateHistory]);

  return {
    handleSceneClick,
    addNewScene,
    handleScriptUpdate
  };
};