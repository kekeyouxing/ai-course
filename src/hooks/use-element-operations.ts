import { useCallback } from 'react';
import { Scene, TextElement, ImageElement, VideoElement, AvatarElement, ImageMedia, VideoMedia, Background, SelectedElementType, ShapeElement, ShapeType } from '@/types/scene';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { ContentMediaItem } from '@/api/media';
import { collectAllElements } from '@/utils/layer-controls'; // Import the layer control utility
import { getShapeDefaultSize } from '@/types/shapes'; // 导入形状默认尺寸函数

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
  // Helper function to get the highest zIndex + 1 for new elements
  const getTopZIndex = useCallback(() => {
    // Collect all elements and find the highest zIndex
    const elements = collectAllElements(scenes, activeScene);
    if (elements.length === 0) return 2; // Start from 2 if no elements (1 is for background)
    
    // Find the maximum zIndex among all elements
    const maxZIndex = Math.max(...elements.map(el => el.zIndex));
    return maxZIndex+1; // Return the highest + 1 to ensure it's on top
  }, [scenes, activeScene]);
  
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
        // 只有当内容真正发生变化时才更新，避免不必要的状态更新
        if (newScenes[activeScene].texts[selectedElement.index].content !== newText) {
          newScenes[activeScene].texts[selectedElement.index].content = newText;
          updateHistory(newScenes);
        }
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
      
      // Get the top zIndex for the new element
      const topZIndex = getTopZIndex();
      
      // Create new text element
      const newText: TextElement = {
        content: type === "title" ? "标题" : type === "subtitle" ? "副标题" : "正文",
        fontSize: type === "title" ? 96 : type === "subtitle" ? 66 : 46,
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
        alignment: "left",
        zIndex: topZIndex // Use dynamic top zIndex
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
    [scenes, activeScene, updateHistory, canvasDimensions, setSelectedElement, setActiveTab, getTopZIndex]
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
            console.log("更新图片元素", imageMedia.element)
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

      // Get the top zIndex for the new element
      const topZIndex = getTopZIndex();

      // Create new avatar element or update existing one
      const newAvatar: AvatarElement = {
        src: avatarSrc,
        width: 400,
        height: 400,
        x: canvasDimensions.width / 2 - 200, // Center placement
        y: canvasDimensions.height / 2 - 200,
        rotation: 0,
        zIndex: topZIndex, // Use dynamic top zIndex
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
    [scenes, activeScene, updateHistory, canvasDimensions, setSelectedElement, setActiveTab, getTopZIndex]
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

      // Get the top zIndex for the new element
      const topZIndex = getTopZIndex();

      // Ensure media array is initialized
      if (!Array.isArray(newScenes[activeScene].media)) {
        newScenes[activeScene].media = [];
      }

      // 计算适合画布的尺寸
      let width = 400; // 默认宽度
      let height = 300; // 默认高度
      
      // 如果有原始尺寸，计算合适的展示尺寸
      if (mediaItem.width && mediaItem.height) {
        const canvasWidth = canvasDimensions.width;
        const canvasHeight = canvasDimensions.height;
        
        // 计算合适的缩放比例，确保媒体在画布中有合适的大小
        // 限制媒体最大宽度为画布宽度的60%，最大高度为画布高度的60%
        const maxWidth = canvasWidth * 0.6;
        const maxHeight = canvasHeight * 0.6;
        
        // 保持原始宽高比
        const aspectRatio = mediaItem.width / mediaItem.height;
        
        if (aspectRatio >= 1) { // 宽图/视频
          width = Math.min(maxWidth, mediaItem.width);
          height = Math.round(width / aspectRatio); // 使用Math.round确保整数
          
          // 检查高度是否超过最大值
          if (height > maxHeight) {
            height = maxHeight;
            width = Math.round(height * aspectRatio); // 使用Math.round确保整数
          }
        } else { // 高图/视频
          height = Math.min(maxHeight, mediaItem.height);
          width = Math.round(height * aspectRatio); // 使用Math.round确保整数
          
          // 检查宽度是否超过最大值
          if (width > maxWidth) {
            width = maxWidth;
            height = Math.round(width / aspectRatio); // 使用Math.round确保整数
          }
        }
      }
      
      // 确保尺寸为整数
      width = Math.round(width);
      height = Math.round(height);
      
      // 计算居中位置
      const x = (canvasDimensions.width - width) / 2;
      const y = (canvasDimensions.height - height) / 2;

      // Create media element with proper typing
      if (!mediaItem.thumbnail) {
        // Create image media with correct type
        const newImageMedia: ImageMedia = {
          id: uuidv4(),
          type: "image",
          element: {
            src: mediaItem.src,
            width: width,
            height: height,
            x: x,
            y: y,
            rotation: 0,
            zIndex: topZIndex // Use dynamic top zIndex
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
            width: width,
            height: height,
            x: x,
            y: y,
            rotation: 0,
            zIndex: topZIndex, // Use dynamic top zIndex
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
    [scenes, activeScene, updateHistory, canvasDimensions, setSelectedElement, setActiveTab, getTopZIndex]
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

  // Shape operations
  const handleAddShapeElement = useCallback(
    (shapeType: ShapeType) => {
      // Get the top zIndex for the new element
      const topZIndex = getTopZIndex();
      
      // 确保shapes数组已初始化
      const newScenes = [...scenes];
      if (!Array.isArray(newScenes[activeScene].shapes)) {
        newScenes[activeScene].shapes = [];
      }
      
      // 获取形状的默认尺寸
      const { width: shapeWidth, height: shapeHeight } = getShapeDefaultSize(shapeType);
      
      // 计算居中位置
      const centerX = canvasDimensions.width / 2 - shapeWidth / 2;
      const centerY = canvasDimensions.height / 2 - shapeHeight / 2;
      
      // 创建新形状
      const newShape: ShapeElement = {
        type: shapeType,
        width: shapeWidth,
        height: shapeHeight,
        x: centerX,
        y: centerY,
        rotation: 0,
        fill: "#000000", // 默认颜色
        stroke: "#000000",
        strokeWidth: shapeType.startsWith('hollow') ? 8 : 0, // 空心形状使用更粗的描边
        zIndex: topZIndex // Use dynamic top zIndex
      };
      
      // 添加到当前场景
      newScenes[activeScene].shapes.push(newShape);
      updateHistory(newScenes);
      
      // 选中新添加的形状
      const index = newScenes[activeScene].shapes.length - 1;
      setSelectedElement({ type: "shape", index });
      setActiveTab("Shape");
    },
    [scenes, activeScene, updateHistory, canvasDimensions, setSelectedElement, setActiveTab, getTopZIndex]
  );

  const handleShapeUpdate = useCallback(
    (updates: Partial<ShapeElement>) => {
      if (!selectedElement || selectedElement.type !== "shape" || selectedElement.index === undefined) return;

      // 记录收到的更新
      console.log("ShapeUpdate received:", updates);
      
      const newScenes = [...scenes];
      // 确保shapes数组存在
      if (!Array.isArray(newScenes[activeScene].shapes)) {
        newScenes[activeScene].shapes = [];
      }

      // 验证形状索引是否有效
      if (
        newScenes[activeScene].shapes.length > selectedElement.index &&
        selectedElement.index >= 0
      ) {
        // 更新形状的属性，包括旋转角度
        const updatedShape = {
          ...newScenes[activeScene].shapes[selectedElement.index],
          ...updates
        };
        
        // 记录更新前后的旋转值
        console.log(
          "Rotation update:", 
          newScenes[activeScene].shapes[selectedElement.index].rotation, 
          "->", 
          updatedShape.rotation
        );
        
        newScenes[activeScene].shapes[selectedElement.index] = updatedShape;
        updateHistory(newScenes);
      } else {
        console.error("无效的形状元素索引:", selectedElement.index);
        toast.error("形状元素不存在");
      }
    },
    [scenes, activeScene, updateHistory, selectedElement]
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
    
    // Shape operations
    handleAddShapeElement,
    handleShapeUpdate
  };
};