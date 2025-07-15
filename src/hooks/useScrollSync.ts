import { useCallback, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { PERFORMANCE } from '../constants';

interface UseScrollSyncProps {
  currentColumnWidth: number;
  resourcesPerPage: number;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export const useScrollSync = ({
  currentColumnWidth,
  resourcesPerPage,
  totalPages,
  currentPage,
  setCurrentPage,
}: UseScrollSyncProps) => {
  
  // Refs for scroll views
  const headerScrollRef = useRef<ScrollView>(null);
  const contentScrollRef = useRef<ScrollView>(null);
  const isScrollingHeader = useRef(false);
  const isScrollingContent = useRef(false);

  // Shared values for animations
  const scrollIndicatorOpacity = useSharedValue(0);
  const headerScrollProgress = useSharedValue(0);
  const contentScrollProgress = useSharedValue(0);

  // Optimized header scroll handler
  const handleHeaderScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrollingContent.current) return;
    
    isScrollingHeader.current = true;
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    
    // Show scroll indicator
    scrollIndicatorOpacity.value = withTiming(1, { duration: 200 });
    
    // Calculate bounded scroll position
    const maxScrollX = Math.max(0, contentSize.width - layoutMeasurement.width);
    const boundedX = Math.max(0, Math.min(contentOffset.x, maxScrollX));
    
    // Update scroll progress
    headerScrollProgress.value = maxScrollX > 0 ? boundedX / maxScrollX : 0;
    
    // Sync content scroll
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTo({ x: boundedX, animated: false });
    }
    
    // Update pagination with debouncing
    const pageWidth = currentColumnWidth * resourcesPerPage;
    const page = Math.round(boundedX / pageWidth);
    if (page !== currentPage && page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
    
    // Hide scroll indicator with delay
    setTimeout(() => {
      scrollIndicatorOpacity.value = withTiming(0, { duration: 1000 });
    }, 1000);
    
    // Reset scrolling flag
    setTimeout(() => {
      isScrollingHeader.current = false;
    }, PERFORMANCE.scrollThrottle);
  }, [
    currentPage, 
    totalPages, 
    currentColumnWidth, 
    resourcesPerPage,
    scrollIndicatorOpacity,
    headerScrollProgress,
    setCurrentPage
  ]);

  // Optimized content scroll handler
  const handleContentScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrollingHeader.current) return;
    
    isScrollingContent.current = true;
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    
    // Show scroll indicator
    scrollIndicatorOpacity.value = withTiming(1, { duration: 200 });
    
    // Calculate bounded scroll position
    const maxScrollX = Math.max(0, contentSize.width - layoutMeasurement.width);
    const boundedX = Math.max(0, Math.min(contentOffset.x, maxScrollX));
    
    // Update scroll progress
    contentScrollProgress.value = maxScrollX > 0 ? boundedX / maxScrollX : 0;
    
    // Sync header scroll
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollTo({ x: boundedX, animated: false });
    }
    
    // Update pagination with debouncing
    const pageWidth = currentColumnWidth * resourcesPerPage;
    const page = Math.round(boundedX / pageWidth);
    if (page !== currentPage && page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
    
    // Hide scroll indicator with delay
    setTimeout(() => {
      scrollIndicatorOpacity.value = withTiming(0, { duration: 1000 });
    }, 1000);
    
    // Reset scrolling flag
    setTimeout(() => {
      isScrollingContent.current = false;
    }, PERFORMANCE.scrollThrottle);
  }, [
    currentPage, 
    totalPages, 
    currentColumnWidth, 
    resourcesPerPage,
    scrollIndicatorOpacity,
    contentScrollProgress,
    setCurrentPage
  ]);

  // Programmatic scroll methods
  const scrollToPosition = useCallback((x: number) => {
    headerScrollRef.current?.scrollTo({ x, animated: true });
    contentScrollRef.current?.scrollTo({ x, animated: true });
  }, []);

  const scrollToResource = useCallback((resourceIndex: number) => {
    const x = resourceIndex * currentColumnWidth;
    scrollToPosition(x);
  }, [currentColumnWidth, scrollToPosition]);

  const scrollToPage = useCallback((page: number) => {
    const x = page * currentColumnWidth * resourcesPerPage;
    scrollToPosition(x);
  }, [currentColumnWidth, resourcesPerPage, scrollToPosition]);

  return {
    headerScrollRef,
    contentScrollRef,
    handleHeaderScroll,
    handleContentScroll,
    scrollIndicatorOpacity,
    headerScrollProgress,
    contentScrollProgress,
    scrollToPosition,
    scrollToResource,
    scrollToPage,
  };
};
