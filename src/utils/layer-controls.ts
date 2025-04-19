import { Scene, ImageMedia, VideoMedia, SelectedElementType } from "@/types/scene";

// 获取当前元素的 zIndex
export function getCurrentElementZIndex(
    scenes: Scene[],
    activeScene: number,
    selectedElement: SelectedElementType | null
): number {
    if (!selectedElement) return 0;
    
    // 确保当前场景存在
    if (!scenes[activeScene]) return 0;
    
    let currentZIndex = 0;
    
    if (selectedElement.type === "text" && selectedElement.index !== undefined) {
        // 确保texts数组存在且索引有效
        if (scenes[activeScene].texts && scenes[activeScene].texts[selectedElement.index]) {
            currentZIndex = scenes[activeScene].texts[selectedElement.index].zIndex || 0;
        }
    } else if ((selectedElement.type === "image" || selectedElement.type === "video") && selectedElement.mediaId) {
        // 确保media数组存在
        if (scenes[activeScene].media) {
            const mediaIndex = scenes[activeScene].media.findIndex(item => item.id === selectedElement.mediaId);
            if (mediaIndex !== -1 && scenes[activeScene].media[mediaIndex]) {
                if (scenes[activeScene].media[mediaIndex].type === "image") {
                    currentZIndex = (scenes[activeScene].media[mediaIndex] as ImageMedia).element.zIndex || 0;
                } else if (scenes[activeScene].media[mediaIndex].type === "video") {
                    currentZIndex = (scenes[activeScene].media[mediaIndex] as VideoMedia).element.zIndex || 0;
                }
            }
        }
    } else if (selectedElement.type === "avatar" && scenes[activeScene].avatar) {
        currentZIndex = scenes[activeScene].avatar.zIndex || 0;
    }
    
    return currentZIndex;
}

// 收集当前场景中所有元素的 zIndex 信息
export function collectAllElements(
    scenes: Scene[],
    activeScene: number
): {type: string, index?: number, mediaId?: string, zIndex: number}[] {
    const allElements: {type: string, index?: number, mediaId?: string, zIndex: number}[] = [];
    
    // 确保当前场景存在
    if (!scenes[activeScene]) return allElements;
    
    // 收集文本元素
    if (scenes[activeScene].texts) {
        scenes[activeScene].texts.forEach((text, index) => {
            allElements.push({
                type: "text",
                index,
                zIndex: text.zIndex || 0
            });
        });
    }
    
    // 收集媒体元素
    if (scenes[activeScene].media) {
        scenes[activeScene].media.forEach((media) => {
            if (media.type === "image") {
                allElements.push({
                    type: "image",
                    mediaId: media.id,
                    zIndex: (media as ImageMedia).element.zIndex || 0
                });
            } else if (media.type === "video") {
                allElements.push({
                    type: "video",
                    mediaId: media.id,
                    zIndex: (media as VideoMedia).element.zIndex || 0
                });
            }
        });
    }
    
    // 收集头像元素
    if (scenes[activeScene].avatar) {
        allElements.push({
            type: "avatar",
            zIndex: scenes[activeScene].avatar.zIndex || 0
        });
    }
    
    return allElements;
}

// 找到当前元素在排序后数组中的位置
export function findCurrentElementIndex(
    allElements: {type: string, index?: number, mediaId?: string, zIndex: number}[],
    selectedElement: SelectedElementType
): number {
    let currentIndex = -1;
    for (let i = 0; i < allElements.length; i++) {
        const el = allElements[i];
        if (el.type === selectedElement.type) {
            if (el.type === "text" && el.index === selectedElement.index) {
                currentIndex = i;
                break;
            } else if ((el.type === "image" || el.type === "video") && el.mediaId === selectedElement.mediaId) {
                currentIndex = i;
                break;
            } else if (el.type === "avatar") {
                currentIndex = i;
                break;
            }
        }
    }
    return currentIndex;
}

// 更新元素的 zIndex
export function updateElementZIndex(
    scenes: Scene[],
    activeScene: number,
    selectedElement: SelectedElementType,
    newZIndex: number
): Scene[] {
    const newScenes = [...scenes];
    
    // 确保当前场景存在
    if (!newScenes[activeScene]) return newScenes;
    
    if (selectedElement.type === "text" && selectedElement.index !== undefined) {
        // 确保texts数组和索引有效
        if (newScenes[activeScene].texts && newScenes[activeScene].texts[selectedElement.index]) {
            newScenes[activeScene].texts[selectedElement.index].zIndex = newZIndex;
        }
    } else if ((selectedElement.type === "image" || selectedElement.type === "video") && selectedElement.mediaId) {
        // 确保media数组存在
        if (newScenes[activeScene].media) {
            const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === selectedElement.mediaId);
            if (mediaIndex !== -1 && newScenes[activeScene].media[mediaIndex]) {
                if (newScenes[activeScene].media[mediaIndex].type === "image") {
                    (newScenes[activeScene].media[mediaIndex] as ImageMedia).element.zIndex = newZIndex;
                } else if (newScenes[activeScene].media[mediaIndex].type === "video") {
                    (newScenes[activeScene].media[mediaIndex] as VideoMedia).element.zIndex = newZIndex;
                }
            }
        }
    } else if (selectedElement.type === "avatar" && newScenes[activeScene].avatar) {
        newScenes[activeScene].avatar.zIndex = newZIndex;
    }
    
    return newScenes;
}

// 确保场景中所有元素的 z-index 唯一且连续
export function normalizeZIndices(
    scenes: Scene[],
    activeScene: number
): Scene[] {
    const newScenes = [...scenes];
    
    // 确保当前场景存在
    if (!newScenes[activeScene]) return newScenes;
    
    // 收集所有元素
    const allElements = collectAllElements(newScenes, activeScene);
    
    // 按 z-index 排序，如果 z-index 相同，保持原有顺序
    allElements.sort((a, b) => {
        if (a.zIndex === b.zIndex) {
            // 如果 z-index 相同，可以根据元素类型或其他属性进行二次排序
            // 这里简单地保持原有顺序
            return 0;
        }
        return a.zIndex - b.zIndex;
    });
    
    // 重新分配 z-index，确保唯一性和连续性
    // 从 2 开始，因为背景是 1
    for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        const newZIndex = i + 2; // 确保从2开始
        
        // 更新元素的 z-index
        if (element.type === "text" && element.index !== undefined) {
            // 确保texts数组和索引有效
            if (newScenes[activeScene].texts && newScenes[activeScene].texts[element.index]) {
                newScenes[activeScene].texts[element.index].zIndex = newZIndex;
            }
        } else if ((element.type === "image" || element.type === "video") && element.mediaId) {
            // 确保media数组存在
            if (newScenes[activeScene].media) {
                const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === element.mediaId);
                if (mediaIndex !== -1 && newScenes[activeScene].media[mediaIndex]) {
                    if (newScenes[activeScene].media[mediaIndex].type === "image") {
                        (newScenes[activeScene].media[mediaIndex] as ImageMedia).element.zIndex = newZIndex;
                    } else if (newScenes[activeScene].media[mediaIndex].type === "video") {
                        (newScenes[activeScene].media[mediaIndex] as VideoMedia).element.zIndex = newZIndex;
                    }
                }
            }
        } else if (element.type === "avatar" && newScenes[activeScene].avatar) {
            newScenes[activeScene].avatar.zIndex = newZIndex;
        }
    }
    
    return newScenes;
}

// 置于顶层
export function bringToFront(
    scenes: Scene[],
    activeScene: number,
    selectedElement: SelectedElementType | null
): Scene[] | null {
    if (!selectedElement) return null;
    
    // 确保当前场景存在
    if (!scenes[activeScene]) return scenes;
    
    // 先确保所有元素的 z-index 唯一且连续
    let newScenes = normalizeZIndices([...scenes], activeScene);
    
    // 收集所有元素
    const allElements = collectAllElements(newScenes, activeScene);
    
    // 找到当前元素
    const currentIndex = findCurrentElementIndex(allElements, selectedElement);
    if (currentIndex === -1) return null;
    
    // 将当前元素移到数组末尾（最顶层）
    const currentElement = allElements.splice(currentIndex, 1)[0];
    allElements.push(currentElement);
    
    // 重新分配所有元素的 z-index
    for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        const newZIndex = i + 2; // 确保从2开始
        
        if (element.type === "text" && element.index !== undefined) {
            // 确保texts数组和索引有效
            if (newScenes[activeScene].texts && newScenes[activeScene].texts[element.index]) {
                newScenes[activeScene].texts[element.index].zIndex = newZIndex;
            }
        } else if ((element.type === "image" || element.type === "video") && element.mediaId) {
            // 确保media数组存在
            if (newScenes[activeScene].media) {
                const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === element.mediaId);
                if (mediaIndex !== -1 && newScenes[activeScene].media[mediaIndex]) {
                    if (newScenes[activeScene].media[mediaIndex].type === "image") {
                        (newScenes[activeScene].media[mediaIndex] as ImageMedia).element.zIndex = newZIndex;
                    } else if (newScenes[activeScene].media[mediaIndex].type === "video") {
                        (newScenes[activeScene].media[mediaIndex] as VideoMedia).element.zIndex = newZIndex;
                    }
                }
            }
        } else if (element.type === "avatar" && newScenes[activeScene].avatar) {
            newScenes[activeScene].avatar.zIndex = newZIndex;
        }
    }
    
    return newScenes;
}

// 置于底层
export function sendToBack(
    scenes: Scene[],
    activeScene: number,
    selectedElement: SelectedElementType | null
): Scene[] | null {
    if (!selectedElement) return null;
    
    // 确保当前场景存在
    if (!scenes[activeScene]) return scenes;
    
    // 先确保所有元素的 z-index 唯一且连续
    let newScenes = normalizeZIndices([...scenes], activeScene);
    
    // 收集所有元素
    const allElements = collectAllElements(newScenes, activeScene);
    
    // 找到当前元素
    const currentIndex = findCurrentElementIndex(allElements, selectedElement);
    if (currentIndex === -1) return null;
    
    // 将当前元素移到数组开头（最底层）
    const currentElement = allElements.splice(currentIndex, 1)[0];
    allElements.unshift(currentElement);
    
    // 重新分配所有元素的 z-index
    for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        const newZIndex = i + 2; // 确保从2开始
        
        if (element.type === "text" && element.index !== undefined) {
            // 确保texts数组和索引有效
            if (newScenes[activeScene].texts && newScenes[activeScene].texts[element.index]) {
                newScenes[activeScene].texts[element.index].zIndex = newZIndex;
            }
        } else if ((element.type === "image" || element.type === "video") && element.mediaId) {
            // 确保media数组存在
            if (newScenes[activeScene].media) {
                const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === element.mediaId);
                if (mediaIndex !== -1 && newScenes[activeScene].media[mediaIndex]) {
                    if (newScenes[activeScene].media[mediaIndex].type === "image") {
                        (newScenes[activeScene].media[mediaIndex] as ImageMedia).element.zIndex = newZIndex;
                    } else if (newScenes[activeScene].media[mediaIndex].type === "video") {
                        (newScenes[activeScene].media[mediaIndex] as VideoMedia).element.zIndex = newZIndex;
                    }
                }
            }
        } else if (element.type === "avatar" && newScenes[activeScene].avatar) {
            newScenes[activeScene].avatar.zIndex = newZIndex;
        }
    }
    
    return newScenes;
}

// 上移一层
export function bringForward(
    scenes: Scene[],
    activeScene: number,
    selectedElement: SelectedElementType | null
): Scene[] | null {
    if (!selectedElement) return null;
    
    // 确保当前场景存在
    if (!scenes[activeScene]) return scenes;
    
    // 先确保所有元素的 z-index 唯一且连续
    let newScenes = normalizeZIndices([...scenes], activeScene);
    
    // 收集所有元素
    const allElements = collectAllElements(newScenes, activeScene);
    
    // 按 z-index 排序
    allElements.sort((a, b) => a.zIndex - b.zIndex);
    
    // 找到当前元素在排序后数组中的位置
    const currentIndex = findCurrentElementIndex(allElements, selectedElement);
    
    // 如果当前元素已经是最顶层或未找到，则不需要操作
    if (currentIndex === -1 || currentIndex === allElements.length - 1) {
        return null;
    }
    
    // 交换当前元素和上一层元素的位置
    const temp = allElements[currentIndex];
    allElements[currentIndex] = allElements[currentIndex + 1];
    allElements[currentIndex + 1] = temp;
    
    // 重新分配所有元素的 z-index
    for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        const newZIndex = i + 2; // 确保从2开始
        
        if (element.type === "text" && element.index !== undefined) {
            // 确保texts数组和索引有效
            if (newScenes[activeScene].texts && newScenes[activeScene].texts[element.index]) {
                newScenes[activeScene].texts[element.index].zIndex = newZIndex;
            }
        } else if ((element.type === "image" || element.type === "video") && element.mediaId) {
            // 确保media数组存在
            if (newScenes[activeScene].media) {
                const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === element.mediaId);
                if (mediaIndex !== -1 && newScenes[activeScene].media[mediaIndex]) {
                    if (newScenes[activeScene].media[mediaIndex].type === "image") {
                        (newScenes[activeScene].media[mediaIndex] as ImageMedia).element.zIndex = newZIndex;
                    } else if (newScenes[activeScene].media[mediaIndex].type === "video") {
                        (newScenes[activeScene].media[mediaIndex] as VideoMedia).element.zIndex = newZIndex;
                    }
                }
            }
        } else if (element.type === "avatar" && newScenes[activeScene].avatar) {
            newScenes[activeScene].avatar.zIndex = newZIndex;
        }
    }
    
    return newScenes;
}

// 下移一层
export function sendBackward(
    scenes: Scene[],
    activeScene: number,
    selectedElement: SelectedElementType | null
): Scene[] | null {
    if (!selectedElement) return null;
    
    // 确保当前场景存在
    if (!scenes[activeScene]) return scenes;
    
    // 先确保所有元素的 z-index 唯一且连续
    let newScenes = normalizeZIndices([...scenes], activeScene);
    
    // 收集所有元素
    const allElements = collectAllElements(newScenes, activeScene);
    
    // 按 z-index 排序
    allElements.sort((a, b) => a.zIndex - b.zIndex);
    
    // 找到当前元素在排序后数组中的位置
    const currentIndex = findCurrentElementIndex(allElements, selectedElement);
    
    // 如果当前元素已经是最底层或未找到，则不需要操作
    if (currentIndex <= 0 || currentIndex === -1) {
        return null;
    }
    
    // 交换当前元素和下一层元素的位置
    const temp = allElements[currentIndex];
    allElements[currentIndex] = allElements[currentIndex - 1];
    allElements[currentIndex - 1] = temp;
    
    // 重新分配所有元素的 z-index
    for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        const newZIndex = i + 2; // 确保从2开始
        
        if (element.type === "text" && element.index !== undefined) {
            // 确保texts数组和索引有效
            if (newScenes[activeScene].texts && newScenes[activeScene].texts[element.index]) {
                newScenes[activeScene].texts[element.index].zIndex = newZIndex;
            }
        } else if ((element.type === "image" || element.type === "video") && element.mediaId) {
            // 确保media数组存在
            if (newScenes[activeScene].media) {
                const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === element.mediaId);
                if (mediaIndex !== -1 && newScenes[activeScene].media[mediaIndex]) {
                    if (newScenes[activeScene].media[mediaIndex].type === "image") {
                        (newScenes[activeScene].media[mediaIndex] as ImageMedia).element.zIndex = newZIndex;
                    } else if (newScenes[activeScene].media[mediaIndex].type === "video") {
                        (newScenes[activeScene].media[mediaIndex] as VideoMedia).element.zIndex = newZIndex;
                    }
                }
            }
        } else if (element.type === "avatar" && newScenes[activeScene].avatar) {
            newScenes[activeScene].avatar.zIndex = newZIndex;
        }
    }
    
    return newScenes;
}