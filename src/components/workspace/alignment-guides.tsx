"use client"
import React from 'react';
import { AlignmentGuide } from '@/utils/alignment-utils';

interface AlignmentGuidesProps {
  guides: AlignmentGuide[];
  scale?: number; // Scale factor for responsive display
}

/**
 * Component to display alignment guides when elements are being dragged
 */
export function AlignmentGuides({ guides, scale = 1 }: AlignmentGuidesProps) {
  if (!guides || guides.length === 0) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {guides.map((guide, index) => {
        const isHorizontal = guide.orientation === 'horizontal';
        const guideStyle = {
          position: 'absolute' as const,
          backgroundColor: guide.type === 'center' ? '#1a73e8' : '#ff4081', // Blue for center, Pink for edges/elements
          opacity: 0.8,
          // For horizontal guides (align with y-axis)
          ...(isHorizontal ? {
            width: '100%',
            height: '1px',
            left: 0,
            top: `${guide.position * scale}px`,
          } : {
            // For vertical guides (align with x-axis)
            width: '1px',
            height: '100%',
            left: `${guide.position * scale}px`,
            top: 0,
          }),
        };
        
        return <div key={`guide-${index}`} style={guideStyle} />;
      })}
    </div>
  );
}