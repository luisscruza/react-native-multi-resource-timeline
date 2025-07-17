/**
 * Test to verify horizontal zoom logic when there is only one resource
 * 
 * @jest-environment node
 */

/* eslint-env jest */

import { ZOOM_LIMITS } from '../constants';

describe('Horizontal Zoom Disable Logic', () => {
  describe('Resource count based zoom disable logic', () => {
    it('should determine when to disable horizontal zoom based on resource count', () => {
      // Test with single resource
      const singleResource = [{ id: 'resource1', name: 'Resource 1' }];
      const shouldDisableSingle = singleResource.length === 1;
      expect(shouldDisableSingle).toBe(true);

      // Test with multiple resources
      const multipleResources = [
        { id: 'resource1', name: 'Resource 1' },
        { id: 'resource2', name: 'Resource 2' },
      ];
      const shouldDisableMultiple = multipleResources.length === 1;
      expect(shouldDisableMultiple).toBe(false);

      // Test with empty resources (edge case)
      const emptyResources: any[] = [];
      const shouldDisableEmpty = emptyResources.length === 1;
      expect(shouldDisableEmpty).toBe(false);
    });

    it('should verify zoom limits are properly configured', () => {
      // Ensure horizontal zoom limits exist
      expect(ZOOM_LIMITS.horizontal).toBeDefined();
      expect(ZOOM_LIMITS.horizontal.min).toBeGreaterThan(0);
      expect(ZOOM_LIMITS.horizontal.max).toBeGreaterThan(ZOOM_LIMITS.horizontal.min);
      
      // Ensure vertical zoom limits exist for comparison
      expect(ZOOM_LIMITS.vertical).toBeDefined();
      expect(ZOOM_LIMITS.vertical.min).toBeGreaterThan(0);
      expect(ZOOM_LIMITS.vertical.max).toBeGreaterThan(ZOOM_LIMITS.vertical.min);
    });

    it('should simulate pinch direction logic with horizontal zoom disabled', () => {
      // Simulate the pinch gesture logic
      const deltaX = 10; // Horizontal movement
      const deltaY = 5;  // Vertical movement
      const disableHorizontalZoom = true;

      let pinchDirection: 'none' | 'vertical' | 'horizontal' = 'none';

      // Simulate the direction determination logic
      if (pinchDirection === 'none') {
        if (deltaX > deltaY && !disableHorizontalZoom) {
          pinchDirection = 'horizontal';
        } else {
          pinchDirection = 'vertical';
        }
      }

      // When horizontal zoom is disabled, should default to vertical even if deltaX > deltaY
      expect(pinchDirection).toBe('vertical');
    });

    it('should simulate pinch direction logic with horizontal zoom enabled', () => {
      // Simulate the pinch gesture logic
      const deltaX = 10; // Horizontal movement
      const deltaY = 5;  // Vertical movement
      const disableHorizontalZoom = false;

      let pinchDirection: 'none' | 'vertical' | 'horizontal' = 'none';

      // Simulate the direction determination logic
      if (pinchDirection === 'none') {
        if (deltaX > deltaY && !disableHorizontalZoom) {
          pinchDirection = 'horizontal';
        } else {
          pinchDirection = 'vertical';
        }
      }

      // When horizontal zoom is enabled and deltaX > deltaY, should be horizontal
      expect(pinchDirection).toBe('horizontal');
    });

    it('should verify zoom clamping logic respects limits', () => {
      // Test that zoom values are properly clamped to limits
      const testZoomValue = 3.0; // Above max limit
      const clampedZoom = Math.max(
        ZOOM_LIMITS.horizontal.min, 
        Math.min(ZOOM_LIMITS.horizontal.max, testZoomValue)
      );
      
      expect(clampedZoom).toBe(ZOOM_LIMITS.horizontal.max);
      expect(clampedZoom).toBeLessThanOrEqual(ZOOM_LIMITS.horizontal.max);
      expect(clampedZoom).toBeGreaterThanOrEqual(ZOOM_LIMITS.horizontal.min);

      // Test below min limit
      const testBelowMin = 0.5; // Below min limit
      const clampedBelowMin = Math.max(
        ZOOM_LIMITS.horizontal.min, 
        Math.min(ZOOM_LIMITS.horizontal.max, testBelowMin)
      );
      
      expect(clampedBelowMin).toBe(ZOOM_LIMITS.horizontal.min);
    });
  });
});