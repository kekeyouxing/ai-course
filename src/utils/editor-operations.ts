import { Scene, SelectedElementType } from "@/types/scene";
import { v4 as uuidv4 } from 'uuid';

// 撤销操作
export const useUndoOperation = (
  history: Scene[][],
  historyIndex: number,
  setHistoryIndex: (index: number) => void,
  setScenes: (scenes: Scene[]) => void
) => {
  return () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      // 使用深拷贝确保状态独立
      setScenes(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };
};

// 重做操作
export const useRedoOperation = (
  history: Scene[][],
  historyIndex: number,
  setHistoryIndex: (index: number) => void,
  setScenes: (scenes: Scene[]) => void
) => {
  return () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      // 使用深拷贝确保状态独立
      setScenes(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };
};

// 复制元素操作
export const useCopyElementOperation = (
  scenes: Scene[],
  activeScene: number,
  selectedElement: SelectedElementType | null,
  setClipboardItem: (item: { type: "text" | "image" | "video" | "avatar" | "shape"; data: any; } | null) => void
) => {
  return () => {
    if (!selectedElement) return;

    const newClipboardItem = { type: selectedElement.type, data: undefined } as {
      type: "text" | "image" | "video" | "avatar" | "shape";
      data: any;
    };
    const currentScenes = [...scenes];
    
    // 确保当前场景存在
    if (!currentScenes[activeScene]) return;

    if (selectedElement.type === "text" && selectedElement.index !== undefined) {
      // 确保文本数组存在且索引有效
      if (Array.isArray(currentScenes[activeScene].texts) && 
          selectedElement.index >= 0 && 
          selectedElement.index < currentScenes[activeScene].texts.length) {
        // 复制文本元素
        newClipboardItem.data = { ...currentScenes[activeScene].texts[selectedElement.index] };
      }
    } else if (selectedElement.type === "image" && selectedElement.mediaId) {
      // 确保媒体数组存在
      if (Array.isArray(currentScenes[activeScene].media)) {
        // 复制图片元素
        const mediaItem = currentScenes[activeScene].media.find(
          item => item.id === selectedElement.mediaId && item.type === "image"
        );
        if (mediaItem) {
          newClipboardItem.data = { ...mediaItem.element };
        }
      }
    } else if (selectedElement.type === "video" && selectedElement.mediaId) {
      // 确保媒体数组存在
      if (Array.isArray(currentScenes[activeScene].media)) {
        // 复制视频元素
        const mediaItem = currentScenes[activeScene].media.find(
          item => item.id === selectedElement.mediaId && item.type === "video"
        );
        if (mediaItem) {
          newClipboardItem.data = { ...mediaItem.element };
        }
      }
    } else if (selectedElement.type === "avatar") {
      // 复制头像元素
      if (currentScenes[activeScene].avatar) {
        newClipboardItem.data = { ...currentScenes[activeScene].avatar };
      }
    } else if (selectedElement.type === "shape" && selectedElement.index !== undefined) {
      // 确保形状数组存在且索引有效
      if (Array.isArray(currentScenes[activeScene].shapes) && 
          selectedElement.index >= 0 && 
          selectedElement.index < currentScenes[activeScene].shapes.length) {
        // 复制形状元素
        newClipboardItem.data = { ...currentScenes[activeScene].shapes[selectedElement.index] };
      }
    }

    if (newClipboardItem.data) {
      setClipboardItem(newClipboardItem);
    }
  };
};

// 粘贴元素操作
export const usePasteElementOperation = (
  clipboardItem: { type: "text" | "image" | "video" | "avatar" | "shape"; data: any; } | null,
  scenes: Scene[],
  activeScene: number,
  updateHistory: (newScenes: Scene[]) => void,
  setSelectedElement: (element: SelectedElementType | null) => void
) => {
  return () => {
    if (!clipboardItem || !clipboardItem.data) return;
    
    // 确保场景数组和当前场景存在
    if (!scenes || !scenes[activeScene]) return;

    const newScenes = [...scenes];
    const OFFSET = 20; // 粘贴后的位置偏移量

    if (clipboardItem.type === "text") {
      // 确保文本数组存在
      if (!Array.isArray(newScenes[activeScene].texts)) {
        newScenes[activeScene].texts = [];
      }
      
      // 粘贴文本元素
      const newText = { 
        ...clipboardItem.data,
        x: clipboardItem.data.x + OFFSET,
        y: clipboardItem.data.y + OFFSET
      };
      newScenes[activeScene].texts.push(newText);
      
      // 选中新粘贴的文本元素
      updateHistory(newScenes);
      setSelectedElement({
        type: "text",
        index: newScenes[activeScene].texts.length - 1
      });
    } else if (clipboardItem.type === "image") {
      // 确保媒体数组存在
      if (!Array.isArray(newScenes[activeScene].media)) {
        newScenes[activeScene].media = [];
      }
      
      // 粘贴图片元素
      const newMediaId = uuidv4();
      newScenes[activeScene].media.push({
        id: newMediaId,
        type: "image",
        element: {
          ...clipboardItem.data,
          x: clipboardItem.data.x + OFFSET,
          y: clipboardItem.data.y + OFFSET
        }
      });
      
      // 选中新粘贴的图片元素
      updateHistory(newScenes);
      setSelectedElement({
        type: "image",
        mediaId: newMediaId
      });
    } else if (clipboardItem.type === "video") {
      // 确保媒体数组存在
      if (!Array.isArray(newScenes[activeScene].media)) {
        newScenes[activeScene].media = [];
      }
      
      // 粘贴视频元素
      const newMediaId = uuidv4();
      newScenes[activeScene].media.push({
        id: newMediaId,
        type: "video",
        element: {
          ...clipboardItem.data,
          x: clipboardItem.data.x + OFFSET,
          y: clipboardItem.data.y + OFFSET
        }
      });
      
      // 选中新粘贴的视频元素
      updateHistory(newScenes);
      setSelectedElement({
        type: "video",
        mediaId: newMediaId
      });
    } else if (clipboardItem.type === "avatar") {
      // 粘贴头像元素
      const newAvatar = {
        ...clipboardItem.data,
        x: clipboardItem.data.x + OFFSET,
        y: clipboardItem.data.y + OFFSET
      };
      
      newScenes[activeScene].avatar = newAvatar;
      
      // 选中新粘贴的头像元素
      updateHistory(newScenes);
      setSelectedElement({
        type: "avatar"
      });
    } else if (clipboardItem.type === "shape") {
      // 确保形状数组存在
      if (!Array.isArray(newScenes[activeScene].shapes)) {
        newScenes[activeScene].shapes = [];
      }
      
      // 粘贴形状元素
      const newShape = { 
        ...clipboardItem.data,
        x: clipboardItem.data.x + OFFSET,
        y: clipboardItem.data.y + OFFSET
      };
      newScenes[activeScene].shapes.push(newShape);
      
      // 选中新粘贴的形状元素
      updateHistory(newScenes);
      setSelectedElement({
        type: "shape",
        index: newScenes[activeScene].shapes.length - 1
      });
    }
  };
};

// 删除元素操作
export const useDeleteElementOperation = (
  scenes: Scene[],
  activeScene: number,
  selectedElement: SelectedElementType | null,
  updateHistory: (newScenes: Scene[]) => void,
  setSelectedElement: (element: SelectedElementType | null) => void
) => {
  return () => {
    if (!selectedElement) return;
    
    // 确保场景数组和当前场景存在
    if (!scenes || !scenes[activeScene]) return;

    const newScenes = [...scenes];

    if (selectedElement.type === "text" && selectedElement.index !== undefined) {
      // 确保文本数组存在且索引有效
      if (Array.isArray(newScenes[activeScene].texts) && 
          selectedElement.index >= 0 && 
          selectedElement.index < newScenes[activeScene].texts.length) {
        // 删除指定索引的文本元素
        newScenes[activeScene].texts.splice(selectedElement.index, 1);
      }
    } else if ((selectedElement.type === "image" || selectedElement.type === "video") && selectedElement.mediaId) {
      // 确保媒体数组存在
      if (Array.isArray(newScenes[activeScene].media)) {
        // 删除指定ID的媒体元素
        newScenes[activeScene].media = newScenes[activeScene].media.filter(
          item => item.id !== selectedElement.mediaId
        );
      }
    } else if (selectedElement.type === "avatar") {
      // 将选中的元素设置为 null
      newScenes[activeScene].avatar = null;
    } else if (selectedElement.type === "shape" && selectedElement.index !== undefined) {
      // 确保形状数组存在且索引有效
      if (Array.isArray(newScenes[activeScene].shapes) && 
          selectedElement.index >= 0 && 
          selectedElement.index < newScenes[activeScene].shapes.length) {
        // 删除指定索引的形状元素
        newScenes[activeScene].shapes.splice(selectedElement.index, 1);
        console.log("删除形状元素:", selectedElement.index, "形状数组:", newScenes[activeScene].shapes);
      }
    }

    // 更新历史记录
    updateHistory(newScenes);

    // 清除选中状态
    setSelectedElement(null);
  };
};