// Alignment utilities for workspace elements

// Types for alignment guides
export interface AlignmentGuide {
  position: number; // Position in pixels
  orientation: 'horizontal' | 'vertical';
  type: 'edge' | 'center' | 'element';
}

// Threshold for snapping in pixels
export const SNAP_THRESHOLD = 3;

// Canvas dimensions (standard video size)
export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;

// Element position and dimensions interface
export interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Gets all elements from a scene for alignment purposes, optionally excluding one element
 * @param scene The current scene
 * @param excludeId Optional ID of the element to exclude (for example, the currently selected element)
 * @param excludeType Optional type of the element to exclude ('text', 'image', 'video', 'avatar', 'shape')
 * @param excludeIndex Optional index of the text element to exclude
 * @returns Array of element positions
 */
export function getAllElementsForAlignment(
  scene: any,
  excludeId?: string,
  excludeType?: string,
  excludeIndex?: number
): ElementPosition[] {
  const elements: ElementPosition[] = [];
  
  // Add text elements
  if (scene.texts) {
    scene.texts.forEach((t: any, index: number) => {
      if (!(excludeType === 'text' && excludeIndex === index)) {
        elements.push({ x: t.x, y: t.y, width: t.width, height: t.height });
      }
    });
  }
  
  // Add image elements
  if (scene.media) {
    scene.media
      .filter((m: any) => m && m.type === "image" && m.id !== excludeId && m.element)
      .forEach((m: any) => {
        elements.push({
          x: m.element.x,
          y: m.element.y,
          width: m.element.width,
          height: m.element.height
        });
      });
  }
  
  // Add video elements
  if (scene.media) {
    scene.media
      .filter((m: any) => m && m.type === "video" && m.id !== excludeId && m.element)
      .forEach((m: any) => {
        elements.push({
          x: m.element.x,
          y: m.element.y,
          width: m.element.width,
          height: m.element.height
        });
      });
  }
  
  // Add avatar element if exists
  if (scene.avatar && !(excludeType === 'avatar')) {
    elements.push({
      x: scene.avatar.x,
      y: scene.avatar.y,
      width: scene.avatar.width,
      height: scene.avatar.height
    });
  }
  
  // Add shape elements
  if (scene.shapes) {
    scene.shapes.forEach((shape: any, index: number) => {
      if (!(excludeType === 'shape' && excludeIndex === index)) {
        elements.push({
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height
        });
      }
    });
  }
  
  return elements;
}

/**
 * Checks if a value is within the threshold of another value
 */
export function isWithinThreshold(value: number, target: number, threshold: number = SNAP_THRESHOLD): boolean {
  return Math.abs(value - target) <= threshold;
}

/**
 * Generates alignment guides for the canvas (center and edges)
 */
export function getCanvasGuides(): AlignmentGuide[] {
  return [
    // Horizontal guides
    { position: 0, orientation: 'horizontal', type: 'edge' }, // Top edge
    { position: CANVAS_HEIGHT / 2, orientation: 'horizontal', type: 'center' }, // Center
    { position: CANVAS_HEIGHT, orientation: 'horizontal', type: 'edge' }, // Bottom edge
    
    // Vertical guides
    { position: 0, orientation: 'vertical', type: 'edge' }, // Left edge
    { position: CANVAS_WIDTH / 2, orientation: 'vertical', type: 'center' }, // Center
    { position: CANVAS_WIDTH, orientation: 'vertical', type: 'edge' } // Right edge
  ];
}

/**
 * Generates alignment guides for a specific element
 */
export function getElementGuides(element: ElementPosition): AlignmentGuide[] {
  return [
    // Horizontal guides
    { position: element.y, orientation: 'horizontal', type: 'element' }, // Top edge
    { position: element.y + element.height / 2, orientation: 'horizontal', type: 'element' }, // Center
    { position: element.y + element.height, orientation: 'horizontal', type: 'element' }, // Bottom edge
    
    // Vertical guides
    { position: element.x, orientation: 'vertical', type: 'element' }, // Left edge
    { position: element.x + element.width / 2, orientation: 'vertical', type: 'element' }, // Center
    { position: element.x + element.width, orientation: 'vertical', type: 'element' } // Right edge
  ];
}

/**
 * Checks if an element's position should snap to any guides
 * Returns the adjusted position if snapping should occur
 */
export function checkForSnapping(
  currentElement: ElementPosition,
  otherElements: ElementPosition[],
  scale: number = 1
): { x: number | null; y: number | null; guides: AlignmentGuide[] } {
  const result = { x: null as number | null, y: null as number | null, guides: [] as AlignmentGuide[] };
  
  // Get guides for the canvas
  const canvasGuides = getCanvasGuides();
  
  // Get guides for all other elements
  const elementGuides: AlignmentGuide[] = [];
  otherElements.forEach(element => {
    getElementGuides(element).forEach(guide => elementGuides.push(guide));
  });
  
  // All guides combined
  const allGuides = [...canvasGuides, ...elementGuides];
  
  // Current element guides
  const currentElementGuides = getElementGuides(currentElement);
  
  // Check for horizontal alignment (y-axis)
  currentElementGuides
    .filter(guide => guide.orientation === 'horizontal')
    .forEach(currentGuide => {
      allGuides
        .filter(guide => guide.orientation === 'horizontal')
        .forEach(targetGuide => {
          if (isWithinThreshold(currentGuide.position, targetGuide.position)) {
            result.y = targetGuide.position - (currentGuide.position - currentElement.y);
            result.guides.push(targetGuide);
          }
        });
    });
  
  // Check for vertical alignment (x-axis)
  currentElementGuides
    .filter(guide => guide.orientation === 'vertical')
    .forEach(currentGuide => {
      allGuides
        .filter(guide => guide.orientation === 'vertical')
        .forEach(targetGuide => {
          if (isWithinThreshold(currentGuide.position, targetGuide.position)) {
            result.x = targetGuide.position - (currentGuide.position - currentElement.x);
            result.guides.push(targetGuide);
          }
        });
    });
  
  // Check for edge-to-edge alignment with other elements
  otherElements.forEach(otherElement => {
    // Horizontal edge alignment (top-to-top, bottom-to-bottom, top-to-bottom, etc.)
    // Current element top edge to other element top edge
    if (isWithinThreshold(currentElement.y, otherElement.y)) {
      result.y = otherElement.y;
      result.guides.push({ position: otherElement.y, orientation: 'horizontal', type: 'edge' });
    }
    // Current element bottom edge to other element bottom edge
    if (isWithinThreshold(currentElement.y + currentElement.height, otherElement.y + otherElement.height)) {
      result.y = otherElement.y + otherElement.height - currentElement.height;
      result.guides.push({ position: otherElement.y + otherElement.height, orientation: 'horizontal', type: 'edge' });
    }
    // Current element top edge to other element bottom edge
    if (isWithinThreshold(currentElement.y, otherElement.y + otherElement.height)) {
      result.y = otherElement.y + otherElement.height;
      result.guides.push({ position: otherElement.y + otherElement.height, orientation: 'horizontal', type: 'edge' });
    }
    // Current element bottom edge to other element top edge
    if (isWithinThreshold(currentElement.y + currentElement.height, otherElement.y)) {
      result.y = otherElement.y - currentElement.height;
      result.guides.push({ position: otherElement.y, orientation: 'horizontal', type: 'edge' });
    }
    
    // Vertical edge alignment (left-to-left, right-to-right, left-to-right, etc.)
    // Current element left edge to other element left edge
    if (isWithinThreshold(currentElement.x, otherElement.x)) {
      result.x = otherElement.x;
      result.guides.push({ position: otherElement.x, orientation: 'vertical', type: 'edge' });
    }
    // Current element right edge to other element right edge
    if (isWithinThreshold(currentElement.x + currentElement.width, otherElement.x + otherElement.width)) {
      result.x = otherElement.x + otherElement.width - currentElement.width;
      result.guides.push({ position: otherElement.x + otherElement.width, orientation: 'vertical', type: 'edge' });
    }
    // Current element left edge to other element right edge
    if (isWithinThreshold(currentElement.x, otherElement.x + otherElement.width)) {
      result.x = otherElement.x + otherElement.width;
      result.guides.push({ position: otherElement.x + otherElement.width, orientation: 'vertical', type: 'edge' });
    }
    // Current element right edge to other element left edge
    if (isWithinThreshold(currentElement.x + currentElement.width, otherElement.x)) {
      result.x = otherElement.x - currentElement.width;
      result.guides.push({ position: otherElement.x, orientation: 'vertical', type: 'edge' });
    }
  });
  
  return result;
}