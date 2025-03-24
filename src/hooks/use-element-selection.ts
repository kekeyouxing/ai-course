import { useCallback } from 'react';
import { SelectedElementType } from '@/types/scene';

/**
 * Hook for managing element selection in the editor
 */
export const useElementSelection = (
  setSelectedElement: (element: SelectedElementType | null) => void,
  setActiveTab: (tab: string) => void
) => {
  // Handle element selection and update active tab accordingly
  const handleElementSelect = useCallback((element: SelectedElementType | null) => {
    setSelectedElement(element);

    // Update activeTab based on selected element
    if (element?.type === "text") {
      setActiveTab("Text");
    } else if (element?.type === "avatar") {
      setActiveTab("Avatar");
    } else if (element?.type === "image" || element?.type === "video") {
      setActiveTab("Media");
    }
  }, [setSelectedElement, setActiveTab]);

  return {
    handleElementSelect
  };
};