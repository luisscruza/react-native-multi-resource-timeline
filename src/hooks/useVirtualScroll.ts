import { useCallback, useMemo, useState } from 'react';

interface UseVirtualScrollProps {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Number of items to render outside viewport
}

export const useVirtualScroll = ({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 5,
}: UseVirtualScrollProps) => {
  const [scrollOffset, setScrollOffset] = useState(0);

  // Calculate visible range
  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    const viewportStartIndex = Math.floor(scrollOffset / itemHeight);
    const viewportEndIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollOffset + containerHeight) / itemHeight)
    );

    const startIndex = Math.max(0, viewportStartIndex - overscan);
    const endIndex = Math.min(itemCount - 1, viewportEndIndex + overscan);
    
    const visibleItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
      visibleItems.push({
        index: i,
        offsetY: i * itemHeight,
      });
    }

    return {
      startIndex,
      endIndex,
      visibleItems,
    };
  }, [scrollOffset, itemHeight, containerHeight, itemCount, overscan]);

  // Total content height
  const totalHeight = itemCount * itemHeight;

  const handleScroll = useCallback((event: any) => {
    const newScrollOffset = event.nativeEvent.contentOffset.y;
    setScrollOffset(newScrollOffset);
  }, []);

  return {
    visibleItems,
    totalHeight,
    startIndex,
    endIndex,
    handleScroll,
    scrollOffset,
  };
};
