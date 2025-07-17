import { useMemo } from 'react';
import { PERFORMANCE } from '../constants';
import { Resource } from '../types';

interface UseHorizontalVirtualizationProps {
  resources: Resource[];
  columnWidth: number;
  scrollViewWidth: number;
  scrollX: number;
}

export const useHorizontalVirtualization = ({
  resources,
  columnWidth,
  scrollViewWidth,
  scrollX,
}: UseHorizontalVirtualizationProps) => {
  
  const shouldVirtualize = resources.length > PERFORMANCE.horizontalVirtualization.columnThreshold;
  
  const virtualizedData = useMemo(() => {
    if (!shouldVirtualize) {
      return {
        visibleResources: resources,
        startIndex: 0,
        endIndex: resources.length - 1,
        offsetLeft: 0,
        offsetRight: 0,
        isVirtualized: false,
      };
    }

    // Calculate how many columns fit in the viewport
    const columnsInViewport = Math.ceil(scrollViewWidth / columnWidth);
    const buffer = PERFORMANCE.horizontalVirtualization.visibleColumnsBuffer;
    
    // Calculate start and end indices with buffer
    const startIndex = Math.max(0, Math.floor(scrollX / columnWidth) - buffer);
    const endIndex = Math.min(
      resources.length - 1,
      startIndex + columnsInViewport + (buffer * 2)
    );
    
    // Calculate offset to maintain scroll position
    const offsetLeft = startIndex * columnWidth;
    const offsetRight = (resources.length - endIndex - 1) * columnWidth;
    
    const visibleResources = resources.slice(startIndex, endIndex + 1);
    
    return {
      visibleResources,
      startIndex,
      endIndex,
      offsetLeft,
      offsetRight,
      isVirtualized: true,
    };
  }, [resources, columnWidth, scrollViewWidth, scrollX, shouldVirtualize]);

  return virtualizedData;
};