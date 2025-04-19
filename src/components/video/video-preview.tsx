import React from 'react';
import { BackgroundRenderer } from "@/components/background/background-renderer";
import { ResizableText } from "@/components/workspace/resizable-text";
import { ResizableImage } from "@/components/workspace/resizable-image";
import { ResizableVideo } from "@/components/workspace/resizable-video";
import { ResizableAvatar } from "@/components/workspace/resizable-avatar";
import { ElementContextMenu } from "@/components/workspace/element-context-menu";
import { getAllElementsForAlignment } from "@/utils/alignment-utils";
import { Scene, SelectedElementType, ImageMedia, VideoMedia } from "@/types/scene";

interface VideoPreviewProps {
  scenes: Scene[];
  activeScene: number;
  selectedElement: SelectedElementType | null;
  handleElementSelect: (element: SelectedElementType | null) => void;
  handleTextChange: (newText: string) => void;
  handleTextUpdate: (newProps: any) => void;
  handleImageResize: (newSize: any, mediaId: string) => void;
  handleVideoResize: (newSize: any, mediaId: string) => void;
  handleAvatarResize: (newSize: any) => void;
  handleBringToFront: () => void;
  handleSendToBack: () => void;
  handleBringForward: () => void;
  handleSendBackward: () => void;
  previewDimensions: { width: number; height: number };
  currentCanvasDimensions: { width: number; height: number };
  editorRef: React.RefObject<HTMLDivElement>;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  scenes,
  activeScene,
  selectedElement,
  handleElementSelect,
  handleTextChange,
  handleTextUpdate,
  handleImageResize,
  handleVideoResize,
  handleAvatarResize,
  handleBringToFront,
  handleSendToBack,
  handleBringForward,
  handleSendBackward,
  previewDimensions,
  currentCanvasDimensions,
  editorRef
}) => {
  return (
    <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
      <div
        style={{
          width: previewDimensions.width,
          height: previewDimensions.height,
          position: 'relative',
          transition: 'width 0.3s, height 0.3s'
        }}
        className="shadow-md"
      >
        <BackgroundRenderer
          background={scenes[activeScene]?.background || {
            type: "color",
            color: "#ffffff"
          }}
          onClick={(e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
              handleElementSelect(null);
            }
          }}
          editorRef={editorRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            overflow: 'hidden'
          }}
        >
          {scenes[activeScene].texts?.map((text, index) => (
            <ElementContextMenu
              key={index}
              onBringToFront={handleBringToFront}
              onSendToBack={handleSendToBack}
              onBringForward={handleBringForward}
              onSendBackward={handleSendBackward}
              disabled={!(selectedElement?.type === "text" && selectedElement.index === index)}
            >
              <ResizableText
                {...text}
                canvasWidth={currentCanvasDimensions.width}
                canvasHeight={currentCanvasDimensions.height}
                containerWidth={previewDimensions.width}
                containerHeight={previewDimensions.height}
                onTextChange={handleTextChange}
                onResize={handleTextUpdate}
                onSelect={() => handleElementSelect({ type: "text", index })}
                isSelected={selectedElement?.type === "text" && selectedElement.index === index}
                otherElements={getAllElementsForAlignment(scenes[activeScene], undefined, "text", index)}
              />
            </ElementContextMenu>
          ))}
          {/* Render media elements */}
          {scenes[activeScene].media?.map((mediaItem) => {
            if (mediaItem.type === "image") {
              return (
                <ElementContextMenu
                  key={mediaItem.id}
                  onBringToFront={handleBringToFront}
                  onSendToBack={handleSendToBack}
                  onBringForward={handleBringForward}
                  onSendBackward={handleSendBackward}
                  disabled={!(selectedElement?.type === "image" && selectedElement.mediaId === mediaItem.id)}
                >
                  <ResizableImage
                    {...(mediaItem as ImageMedia).element}
                    onResize={(newSize) => handleImageResize(newSize, mediaItem.id!)}
                    onSelect={() => handleElementSelect({ type: "image", mediaId: mediaItem.id })}
                    isSelected={selectedElement?.type === "image" && selectedElement.mediaId === mediaItem.id}
                    canvasWidth={currentCanvasDimensions.width}
                    canvasHeight={currentCanvasDimensions.height}
                    containerWidth={previewDimensions.width}
                    containerHeight={previewDimensions.height}
                    otherElements={getAllElementsForAlignment(scenes[activeScene], mediaItem.id, "image")}
                  />
                </ElementContextMenu>
              );
            } else if (mediaItem.type === "video") {
              return (
                <ElementContextMenu
                  key={mediaItem.id}
                  onBringToFront={handleBringToFront}
                  onSendToBack={handleSendToBack}
                  onBringForward={handleBringForward}
                  onSendBackward={handleSendBackward}
                  disabled={!(selectedElement?.type === "video" && selectedElement.mediaId === mediaItem.id)}
                >
                  <ResizableVideo
                    {...(mediaItem as VideoMedia).element}
                    onResize={(newSize) => handleVideoResize(newSize, mediaItem.id!)}
                    onSelect={() => handleElementSelect({ type: "video", mediaId: mediaItem.id })}
                    isSelected={selectedElement?.type === "video" && selectedElement.mediaId === mediaItem.id}
                    canvasWidth={currentCanvasDimensions.width}
                    canvasHeight={currentCanvasDimensions.height}
                    containerWidth={previewDimensions.width}
                    containerHeight={previewDimensions.height}
                    otherElements={getAllElementsForAlignment(scenes[activeScene], mediaItem.id, "video")}
                  />
                </ElementContextMenu>
              );
            }
            return null;
          })}

          {scenes[activeScene].avatar && (
            <ElementContextMenu
              onBringToFront={handleBringToFront}
              onSendToBack={handleSendToBack}
              onBringForward={handleBringForward}
              onSendBackward={handleSendBackward}
              disabled={!(selectedElement?.type === "avatar")}
            >
              <ResizableAvatar
                {...scenes[activeScene].avatar}
                onResize={handleAvatarResize}
                onSelect={() => handleElementSelect({ type: "avatar" })}
                isSelected={selectedElement?.type === "avatar"}
                canvasWidth={currentCanvasDimensions.width}
                canvasHeight={currentCanvasDimensions.height}
                containerWidth={previewDimensions.width}
                containerHeight={previewDimensions.height}
                otherElements={getAllElementsForAlignment(scenes[activeScene], undefined, "avatar")}
              />
            </ElementContextMenu>
          )}
        </BackgroundRenderer>
      </div>
    </div>
  );
};