import { useCallback } from 'react';
import { Scene, TextElement, ImageElement, VideoElement, AvatarElement, ImageMedia, VideoMedia, Background, SelectedElementType } from '@/types/scene';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { ContentMediaItem } from '@/api/media';

/**
 * Hook for managing element operations (text, image, video, avatar)
 */
export const useElementOperations = (
  scenes: Scene[],
  activeScene: number,
  updateHistory: (newScenes: Scene[]) => void,
  setSelectedElement: (element: any) => void,
  setActiveTab: (tab: string) => void,
  canvasDimensions: { width: number, height: number },
  selectedElement :SelectedElementType | null
) => {
  const handleTextChange = useCallback(
    (newText: string) => {
      // 从闭包中获取 selectedElement
      if (!selectedElement || selectedElement.type !== "text" || selectedElement.index === undefined) return;
  
      const newScenes = [...scenes];
      // Add safety check
      if (
        newScenes[activeScene]?.texts &&
        newScenes[activeScene].texts.length > selectedElement.index &&
        selectedElement.index >= 0
      ) {
        newScenes[activeScene].texts[selectedElement.index].content = newText;
        updateHistory(newScenes);
      } else {
        console.error("Invalid text element index:", selectedElement.index);
        toast.error("Text element does not exist");
      }
    },
    [scenes, activeScene, updateHistory, selectedElement]
  );
  

// 同样修改 handleTextUpdate 函数签名
const handleTextUpdate = useCallback(
  (newProps: Partial<TextElement>) => {
    if (!selectedElement || selectedElement.type !== "text" || selectedElement.index === undefined) return;

    const newScenes = [...scenes];

    // Add safety check
    if (
      newScenes[activeScene]?.texts &&
      newScenes[activeScene].texts.length > selectedElement.index &&
      selectedElement.index >= 0
    ) {
      newScenes[activeScene].texts[selectedElement.index] = {
        ...newScenes[activeScene].texts[selectedElement.index],
        ...newProps
      } as TextElement;
      updateHistory(newScenes);
    } else {
      console.error("Invalid text element index:", selectedElement.index);
      toast.error("Cannot update non-existent text element");
    }
  },
  [scenes, activeScene, updateHistory, selectedElement]
);

  // Add text element
  const handleAddTextElement = useCallback(
    (type: "title" | "subtitle" | "body") => {
      const newScenes = [...scenes];
      // Create new text element
      const newText: TextElement = {
        content: type === "title" ? "标题" : type === "subtitle" ? "副标题" : "正文",
        fontSize: type === "title" ? 216 : type === "subtitle" ? 130 : 65,
        x: canvasDimensions.width / 2 - 400, // Center horizontally
        y: canvasDimensions.height / 2 - 100, // Center vertically
        width: 800, // Increase width to fit text
        height: 200, // Increase height to fit text
        rotation: 0,
        fontFamily: "'Noto Sans SC', 'Noto Sans CJK SC'",
        fontColor: "#000000",
        backgroundColor: "rgba(255, 255, 255, 0)",
        bold: type === "title",
        italic: false,
        alignment: "center"
      };

      // Add new text element to current scene
      if (!newScenes[activeScene].texts) {
        newScenes[activeScene].texts = [];
      }
      newScenes[activeScene].texts.push(newText);
      updateHistory(newScenes);

      // Select newly added text element
      setSelectedElement({
        type: "text",
        index: newScenes[activeScene].texts.length - 1
      });
      setActiveTab("Text");
    },
    [scenes, activeScene, updateHistory, canvasDimensions, setSelectedElement, setActiveTab]
  );

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
            console.error("当前场景无媒体元素");
            toast.error("无法更新图片：媒体元素不存在");
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
        console.error("当前场景无媒体元素");
        toast.error("无法更新视频：媒体元素不存在");
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

  // Avatar operations
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

  const handleSelectAvatar = useCallback(
    (avatarSrc: string) => {
      const newScenes = [...scenes];

      // Create new avatar element or update existing one
      const newAvatar: AvatarElement = {
        src: avatarSrc,
        width: 400,
        height: 400,
        x: canvasDimensions.width / 2 - 200, // Center placement
        y: canvasDimensions.height / 2 - 200,
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
      setActiveTab("Avatar");
    },
    [scenes, activeScene, updateHistory, canvasDimensions, setSelectedElement, setActiveTab]
  );

  // Media operations
  const handleAddMedia = useCallback(
    (mediaItem: ContentMediaItem) => {
      const newScenes = [...scenes];
      // Ensure current scene exists
      if (!newScenes[activeScene]) {
        console.error("Current scene does not exist");
        toast.error("Cannot add media: current scene does not exist");
        return;
      }

      // Ensure media array is initialized
      if (!Array.isArray(newScenes[activeScene].media)) {
        newScenes[activeScene].media = [];
      }

      // Create media element with proper typing
      if (!mediaItem.thumbnail) {
        // Create image media with correct type
        const newImageMedia: ImageMedia = {
          id: uuidv4(),
          type: "image",
          element: {
            src: mediaItem.src,
            width: 400,
            height: 300,
            x: canvasDimensions.width / 2 - 200,
            y: canvasDimensions.height / 2 - 150,
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
      } else if (mediaItem.thumbnail) {
        // Create video media with correct type
        const newVideoMedia: VideoMedia = {
          id: uuidv4(),
          type: "video",
          element: {
            src: mediaItem.src,
            width: 400,
            height: 300,
            x: canvasDimensions.width / 2 - 200,
            y: canvasDimensions.height / 2 - 150,
            rotation: 0,
            zIndex: 10,
            volume: 0.5,
            loop: false,
            autoplay: true,
            displayMode: "freeze",
            thumbnail: mediaItem.thumbnail || "",
            duration: mediaItem.duration || 0
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
    [scenes, activeScene, updateHistory, canvasDimensions, setSelectedElement, setActiveTab]
  );

  // Background operations
  const handleBackgroundChange = useCallback(
    (background: Background) => {
      const newScenes = [...scenes];
      newScenes[activeScene].background = background;
      updateHistory(newScenes);
    },
    [scenes, activeScene, updateHistory]
  );

  // Helper function to get selected media
const getSelectedMedia = useCallback(
  () => {
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
  [scenes, activeScene, selectedElement]
);

  return {
    // Text operations
    handleTextChange,
    handleTextUpdate,
    handleAddTextElement,
    
    // Image operations
    handleImageResize,
    handleImageUpdate,
    
    // Video operations
    handleVideoResize,
    handleVideoUpdate,
    
    // Avatar operations
    handleAvatarResize,
    handleSelectAvatar,
    
    // Media operations
    handleAddMedia,
    getSelectedMedia,
    
    // Background operations
    handleBackgroundChange,
  };
};