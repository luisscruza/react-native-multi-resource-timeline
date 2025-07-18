/**
 * Selection Granularity Tests
 * @jest-environment node
 */

/* eslint-env jest */

import { useTimelineCalculations } from '../hooks/useTimelineCalculations';

// Mock react hooks
jest.mock('react', () => ({
  useCallback: jest.fn((fn) => fn),
  useMemo: jest.fn((fn) => fn()),
}));

describe('Selection Granularity', () => {
  const mockProps = {
    startHour: 8,
    endHour: 18,
    timeSlotInterval: 60,
    hourHeight: 80,
    date: '2024-01-15',
  };

  describe('useTimelineCalculations with selectionGranularity', () => {
    it('should create selection slots based on granularity when provided', () => {
      const { timeSlots, selectionSlots, slotHeight, selectionHeight } = useTimelineCalculations({
        ...mockProps,
        selectionGranularity: 15,
      });

      // Time slots should be based on timeSlotInterval (60 minutes)
      expect(timeSlots.length).toBe(10); // 10 hours * 1 slot per hour
      expect(slotHeight).toBe(80); // 80px per hour / 1 slot per hour

      // Selection slots should be based on selectionGranularity (15 minutes)
      expect(selectionSlots.length).toBe(40); // 10 hours * 4 slots per hour (15min each)
      expect(selectionHeight).toBe(20); // 80px per hour / 4 slots per hour
    });

    it('should fall back to timeSlotInterval when selectionGranularity is not provided', () => {
      const { timeSlots, selectionSlots, slotHeight, selectionHeight } = useTimelineCalculations(mockProps);

      // Both should be the same when no granularity is specified
      expect(timeSlots.length).toBe(selectionSlots.length);
      expect(slotHeight).toBe(selectionHeight);
    });

    it('should create correct time values for 30-minute granularity', () => {
      const { selectionSlots } = useTimelineCalculations({
        ...mockProps,
        selectionGranularity: 30,
      });

      // First few slots should be 8:00, 8:30, 9:00, 9:30, etc.
      expect(selectionSlots[0]).toEqual({ hours: 8, minutes: 0, index: 0 });
      expect(selectionSlots[1]).toEqual({ hours: 8, minutes: 30, index: 1 });
      expect(selectionSlots[2]).toEqual({ hours: 9, minutes: 0, index: 2 });
      expect(selectionSlots[3]).toEqual({ hours: 9, minutes: 30, index: 3 });
    });

    it('should create correct time values for 15-minute granularity', () => {
      const { selectionSlots } = useTimelineCalculations({
        ...mockProps,
        selectionGranularity: 15,
      });

      // First few slots should be 8:00, 8:15, 8:30, 8:45, 9:00, etc.
      expect(selectionSlots[0]).toEqual({ hours: 8, minutes: 0, index: 0 });
      expect(selectionSlots[1]).toEqual({ hours: 8, minutes: 15, index: 1 });
      expect(selectionSlots[2]).toEqual({ hours: 8, minutes: 30, index: 2 });
      expect(selectionSlots[3]).toEqual({ hours: 8, minutes: 45, index: 3 });
      expect(selectionSlots[4]).toEqual({ hours: 9, minutes: 0, index: 4 });
    });

    it('should handle 5-minute granularity correctly', () => {
      const { selectionSlots, selectionHeight } = useTimelineCalculations({
        ...mockProps,
        selectionGranularity: 5,
      });

      // Should create 12 slots per hour (5-minute intervals)
      expect(selectionSlots.length).toBe(120); // 10 hours * 12 slots per hour
      expect(selectionHeight).toBe(80 / 12); // 80px per hour / 12 slots per hour ≈ 6.67px

      // Check a few time values
      expect(selectionSlots[0]).toEqual({ hours: 8, minutes: 0, index: 0 });
      expect(selectionSlots[1]).toEqual({ hours: 8, minutes: 5, index: 1 });
      expect(selectionSlots[12]).toEqual({ hours: 9, minutes: 0, index: 12 });
    });

    it('should maintain display slots independent of selection granularity', () => {
      const with15MinGranularity = useTimelineCalculations({
        ...mockProps,
        selectionGranularity: 15,
      });

      const with5MinGranularity = useTimelineCalculations({
        ...mockProps,
        selectionGranularity: 5,
      });

      // Display slots should be the same regardless of selection granularity
      expect(with15MinGranularity.timeSlots).toEqual(with5MinGranularity.timeSlots);
      expect(with15MinGranularity.slotHeight).toBe(with5MinGranularity.slotHeight);
      
      // But selection slots should be different
      expect(with15MinGranularity.selectionSlots.length).toBe(40);
      expect(with5MinGranularity.selectionSlots.length).toBe(120);
    });

    it('should handle edge cases correctly', () => {
      const { selectionSlots } = useTimelineCalculations({
        startHour: 23,
        endHour: 24,
        timeSlotInterval: 60,
        selectionGranularity: 15,
        hourHeight: 80,
        date: '2024-01-15',
      });

      // Should have 4 slots for 1 hour with 15-minute granularity
      expect(selectionSlots.length).toBe(4);
      expect(selectionSlots[0]).toEqual({ hours: 23, minutes: 0, index: 0 });
      expect(selectionSlots[1]).toEqual({ hours: 23, minutes: 15, index: 1 });
      expect(selectionSlots[2]).toEqual({ hours: 23, minutes: 30, index: 2 });
      expect(selectionSlots[3]).toEqual({ hours: 23, minutes: 45, index: 3 });
    });
  });
});