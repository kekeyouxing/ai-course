import { useState, useEffect, RefObject } from 'react';
import { AspectRatioType } from '@/types/scene';
import { CANVAS_DIMENSIONS } from './use-canvas-dimensions';

/**
 * Hook for managing preview dimensions based on container size and aspect ratio
 */
export const usePreviewDimensions = (
  editorRef: RefObject<HTMLDivElement | null>,
  aspectRatio: AspectRatioType
) => {
  // Initialize preview dimensions based on current aspect ratio
  const [previewDimensions, setPreviewDimensions] = useState(() => {
    const currentDimensions = CANVAS_DIMENSIONS[aspectRatio];
    return {
      width: currentDimensions.width,
      height: currentDimensions.height
    };
  });

  // Update preview dimensions when container size or aspect ratio changes
  useEffect(() => {
    if (!editorRef.current) return;

    // Get the container element
    const mainContainer = document.querySelector('.flex-1.flex.items-center.justify-center.p-4');
    if (!mainContainer) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        // Ensure width and height are not zero
        if (width === 0 || height === 0) continue;

        // Get current canvas dimensions
        const currentDimensions = CANVAS_DIMENSIONS[aspectRatio];
        const canvasRatio = currentDimensions.width / currentDimensions.height;

        // Calculate preview dimensions based on container size and canvas ratio
        const containerRatio = width / height;
        let previewWidth, previewHeight;

        if (containerRatio > canvasRatio) {
          // Container is wider, use height as base
          previewHeight = height * 0.9; // Leave some margin
          previewWidth = previewHeight * canvasRatio;
        } else {
          // Container is taller, use width as base
          previewWidth = width * 0.9; // Leave some margin
          previewHeight = previewWidth / canvasRatio;
        }

        setPreviewDimensions({
          width: previewWidth,
          height: previewHeight
        });
      }
    });

    // Observe the main container
    resizeObserver.observe(mainContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, [aspectRatio, editorRef]);

  return {
    previewDimensions,
    setPreviewDimensions
  };
};