/**
 * Performance optimization tests
 * @jest-environment node
 */

/* eslint-env jest */

import { PERFORMANCE } from '../constants';

describe('Performance Optimizations', () => {
  describe('Virtual Scroll Thresholds', () => {
    it('should have lower thresholds for multi-column scenarios', () => {
      expect(PERFORMANCE.virtualScrollThresholds.events).toBe(50);
      expect(PERFORMANCE.virtualScrollThresholds.eventsWithMultipleColumns).toBe(20);
      expect(PERFORMANCE.virtualScrollThresholds.columnsThreshold).toBe(4);
    });

    it('should enable virtual scrolling for high event count', () => {
      const eventsCount = 60;
      const resourcesCount = 3;
      
      const shouldEnable = eventsCount > PERFORMANCE.virtualScrollThresholds.events || 
        (eventsCount > PERFORMANCE.virtualScrollThresholds.eventsWithMultipleColumns && 
         resourcesCount > PERFORMANCE.virtualScrollThresholds.columnsThreshold);
      
      expect(shouldEnable).toBe(true);
    });

    it('should enable virtual scrolling for many columns with fewer events', () => {
      const eventsCount = 25;
      const resourcesCount = 6; // 6 employees scenario
      
      const shouldEnable = eventsCount > PERFORMANCE.virtualScrollThresholds.events || 
        (eventsCount > PERFORMANCE.virtualScrollThresholds.eventsWithMultipleColumns && 
         resourcesCount > PERFORMANCE.virtualScrollThresholds.columnsThreshold);
      
      expect(shouldEnable).toBe(true);
    });

    it('should not enable virtual scrolling for small datasets', () => {
      const eventsCount = 15;
      const resourcesCount = 3;
      
      const shouldEnable = eventsCount > PERFORMANCE.virtualScrollThresholds.events || 
        (eventsCount > PERFORMANCE.virtualScrollThresholds.eventsWithMultipleColumns && 
         resourcesCount > PERFORMANCE.virtualScrollThresholds.columnsThreshold);
      
      expect(shouldEnable).toBe(false);
    });
  });

  describe('ResourceColumn Memoization', () => {
    it('should have performance constants for throttling', () => {
      expect(PERFORMANCE.scrollThrottle).toBe(16);
      expect(PERFORMANCE.gestureThrottle).toBe(16);
      expect(PERFORMANCE.animationThrottle).toBe(32);
      expect(PERFORMANCE.zoomThrottle).toBe(32);
    });
  });

  describe('Horizontal Virtualization', () => {
    it('should have appropriate column thresholds', () => {
      expect(PERFORMANCE.horizontalVirtualization.columnThreshold).toBe(8);
      expect(PERFORMANCE.horizontalVirtualization.visibleColumnsBuffer).toBe(2);
    });

    it('should enable horizontal virtualization for many columns', () => {
      const columnsCount = 10;
      const shouldVirtualize = columnsCount > PERFORMANCE.horizontalVirtualization.columnThreshold;
      expect(shouldVirtualize).toBe(true);
    });

    it('should not enable horizontal virtualization for few columns', () => {
      const columnsCount = 6;
      const shouldVirtualize = columnsCount > PERFORMANCE.horizontalVirtualization.columnThreshold;
      expect(shouldVirtualize).toBe(false);
    });
  });
});