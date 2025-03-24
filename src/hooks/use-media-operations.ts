import { useCallback } from 'react';
import { Scene, ImageElement, VideoElement, ImageMedia, VideoMedia } from '@/types/scene';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { ContentMediaItem } from '@/components/media/media-content';

/**
 * Hook for managing media operations (image, video)
 */
export const useMediaOperations = (
  scenes: Scene[],
  activeScene: number,
  updateHistory: (newScenes: Scene[]) => void,
  setSelectedElement: (element: any) => void,
  setActiveTab: (tab: string) => void,
  currentCanvasDimensions: { width: number, height: number }
) => {
  // Image operations
  const handleImageResize = useCallback(
    (newSize: Partial<ImageElement>, mediaId: string) => {
      const newScenes = [...scenes];

      // Add safety check
      if (!newScenes[activeScene]?.media) {
        console.error("Current scene has no media elements");
        return;
      }

      const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === mediaId);

      if (
        mediaIndex !== -1 &&
        newScenes[activeScene].media[mediaIndex].type === "image"
      ) {
        const imageMedia = newScenes[activeScene].media[mediaIndex] as ImageMedia;
        imageMedia.element = { ...imageMedia.element, ...newSize } as ImageElement;
        updateHistory(newScenes);
      } else {
        console.error("Invalid image element ID:", mediaId);
        toast.error("Image element does not exist");
      }
    },
    [scenes, activeScene, updateHistory]
  );

  const handleImageUpdate = useCallback(
    (mediaId: string, updates: Partial<ImageElement>) => {
      const newScenes = [...scenes];
      if (!newScenes[activeScene] || !Array.isArray(newScenes[activeScene].media)) {
        console.error("Current scene has no media elements");
        toast.error("Cannot update image: Media element does not exist");
        return;
      }
      const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === mediaId);

      if (mediaIndex !== -1 && newScenes[activeScene].media[mediaIndex].type === "image") {
        const imageMedia = newScenes[activeScene].media[mediaIndex] as ImageMedia;
        imageMedia.element = { ...imageMedia.element, ...updates } as ImageElement;
        updateHistory(newScenes);
      }
    },
    [scenes, activeScene, updateHistory]
  );

  // Video operations
  const handleVideoResize = useCallback(
    (newSize: Partial<VideoElement>, mediaId: string) => {
      const newScenes = [...scenes];

      // Add safety check
      if (!newScenes[activeScene]?.media) {
        console.error("Current scene has no media elements");
        return;
      }

      const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === mediaId);

      if (
        mediaIndex !== -1 &&
        newScenes[activeScene].media[mediaIndex].type === "video"
      ) {
        const videoMedia = newScenes[activeScene].media[mediaIndex] as VideoMedia;
        videoMedia.element = { ...videoMedia.element, ...newSize } as VideoElement;
        updateHistory(newScenes);
      } else {
        console.error("Invalid video element ID:", mediaId);
        toast.error("Video element does not exist");
      }
    },
    [scenes, activeScene, updateHistory]
  );

  const handleVideoUpdate = useCallback(
    (mediaId: string, updates: Partial<VideoElement>) => {
      const newScenes = [...scenes];
      if (!newScenes[activeScene] || !Array.isArray(newScenes[activeScene].media)) {
        console.error("Current scene has no media elements");
        toast.error("Cannot update video: Media element does not exist");
        return;
      }
      const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === mediaId);

      if (mediaIndex !== -1 && newScenes[activeScene].media[mediaIndex].type === "video") {
        const videoMedia = newScenes[activeScene].media[mediaIndex] as VideoMedia;
        videoMedia.element = { ...videoMedia.element, ...updates } as VideoElement;
        updateHistory(newScenes);
      }
    },
    [scenes, activeScene, updateHistory]
  );

  // Get selected media
  const getSelectedMedia = useCallback(
    (selectedElement: any) => {
      if (!selectedElement || (selectedElement.type !== "image" && selectedElement.type !== "video")) {
        return null;
      }
      if (!scenes[activeScene] || !Array.isArray(scenes[activeScene].media)) {
        return null;
      }
      const mediaId = selectedElement.mediaId;
      const mediaItem = scenes[activeScene].media.find(item => item.id === mediaId);

      if (!mediaItem) return null;

      return mediaItem;
    },
    [scenes, activeScene]
  );

  // Add media
  const handleAddMedia = useCallback(
    (mediaItem: ContentMediaItem) => {
      const newScenes = [...scenes];
      // Ensure current scene exists
      if (!newScenes[activeScene]) {
        console.error("Current scene does not exist");
        toast.error("Cannot add media: Current scene does not exist");
        return;
      }

      // Ensure media array is initialized
      if (!Array.isArray(newScenes[activeScene].media)) {
        newScenes[activeScene].media = [];
      }

      // Create media element with proper typing
      if (mediaItem.type === "image") {
        // Create image media with correct type
        const newImageMedia: ImageMedia = {
          id: uuidv4(),
          type: "image",
          element: {
            src: mediaItem.src,
            width: 400,
            height: 300,
            x: currentCanvasDimensions.width / 2 - 200,
            y: currentCanvasDimensions.height / 2 - 150,
            rotation: 0,
            zIndex: 10
          }
        };

        // Add to current scene
        newScenes[activeScene].media.push(newImageMedia);

        // Update history and select the new element
        updateHistory(newScenes);
        setSelectedElement({
          type: "image",
          mediaId: newImageMedia.id
        });
      } else if (mediaItem.type === "video") {
        // Create video media with correct type
        const newVideoMedia: VideoMedia = {
          id: uuidv4(),
          type: "video",
          element: {
            src: mediaItem.src,
            width: 400,
            height: 300,
            x: currentCanvasDimensions.width / 2 - 200,
            y: currentCanvasDimensions.height / 2 - 150,
            rotation: 0,
            zIndex: 10,
            volume: 0.5,
            loop: false,
            autoplay: true,
            displayMode: "freeze",
            thumbnail: "",
            duration: "00:00"
          }
        };

        // Add to current scene
        newScenes[activeScene].media.push(newVideoMedia);

        // Update history and select the new element
        updateHistory(newScenes);
        setSelectedElement({
          type: "video",
          mediaId: newVideoMedia.id
        });
      }

      // Switch to Media tab
      setActiveTab("Media");
    },
    [scenes, activeScene, updateHistory, currentCanvasDimensions, setSelectedElement, setActiveTab]
  );

  return {
    handleImageResize,
    handleImageUpdate,
    handleVideoResize,
    handleVideoUpdate,
    getSelectedMedia,
    handleAddMedia
  };
};