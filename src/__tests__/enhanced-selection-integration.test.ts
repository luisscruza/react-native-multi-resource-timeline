/**
 * Integration Test for Enhanced Time Slots Selection
 * @jest-environment node
 */

/* eslint-env jest */

import { useTimelineCalculations } from '../hooks/useTimelineCalculations';

// Mock react hooks
jest.mock('react', () => ({
  useCallback: jest.fn((fn) => fn),
  useMemo: jest.fn((fn) => fn()),
}));

describe('Enhanced Time Slots Selection - Integration Tests', () => {
  describe('Real-world scenarios', () => {
    it('should handle a typical clinic schedule (60min slots, 15min selection)', () => {
      const { timeSlots, selectionSlots, slotHeight, selectionHeight } = useTimelineCalculations({
        startHour: 9,
        endHour: 17,
        timeSlotInterval: 60,
        selectionGranularity: 15,
        hourHeight: 80,
        date: '2024-01-15',
      });

      // Visual slots: 9:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00 (8 slots)
      expect(timeSlots.length).toBe(8);
      expect(slotHeight).toBe(80); // 80px per hour slot

      // Selection slots: 4 per hour for 8 hours = 32 slots  
      expect(selectionSlots.length).toBe(32);
      expect(selectionHeight).toBe(20); // 80px / 4 slots per hour

      // Verify some key selection slots
      expect(selectionSlots[0]).toEqual({ hours: 9, minutes: 0, index: 0 });   // 9:00
      expect(selectionSlots[1]).toEqual({ hours: 9, minutes: 15, index: 1 });  // 9:15
      expect(selectionSlots[2]).toEqual({ hours: 9, minutes: 30, index: 2 });  // 9:30
      expect(selectionSlots[3]).toEqual({ hours: 9, minutes: 45, index: 3 });  // 9:45
      expect(selectionSlots[4]).toEqual({ hours: 10, minutes: 0, index: 4 });  // 10:00
    });

    it('should handle appointment booking scenario (30min slots, 5min selection)', () => {
      const { timeSlots, selectionSlots, slotHeight, selectionHeight } = useTimelineCalculations({
        startHour: 8,
        endHour: 18,
        timeSlotInterval: 30,
        selectionGranularity: 5,
        hourHeight: 60,
        date: '2024-01-15',
      });

      // Visual slots: 2 per hour for 10 hours = 20 slots
      expect(timeSlots.length).toBe(20);
      expect(slotHeight).toBe(30); // 60px / 2 slots per hour

      // Selection slots: 12 per hour for 10 hours = 120 slots
      expect(selectionSlots.length).toBe(120);
      expect(selectionHeight).toBe(5); // 60px / 12 slots per hour

      // Verify precise selection capability
      expect(selectionSlots[0]).toEqual({ hours: 8, minutes: 0, index: 0 });   // 8:00
      expect(selectionSlots[1]).toEqual({ hours: 8, minutes: 5, index: 1 });   // 8:05
      expect(selectionSlots[3]).toEqual({ hours: 8, minutes: 15, index: 3 });  // 8:15
      expect(selectionSlots[6]).toEqual({ hours: 8, minutes: 30, index: 6 });  // 8:30
      expect(selectionSlots[12]).toEqual({ hours: 9, minutes: 0, index: 12 }); // 9:00
    });

    it('should handle edge case: same granularity as slot interval', () => {
      const { timeSlots, selectionSlots, slotHeight, selectionHeight } = useTimelineCalculations({
        startHour: 10,
        endHour: 12,
        timeSlotInterval: 30,
        selectionGranularity: 30,
        hourHeight: 100,
        date: '2024-01-15',
      });

      // When granularity equals slot interval, everything should be the same
      expect(timeSlots.length).toBe(selectionSlots.length);
      expect(slotHeight).toBe(selectionHeight);
      expect(timeSlots).toEqual(selectionSlots);
    });

    it('should handle calendar-style view (large slots, fine selection)', () => {
      const { timeSlots, selectionSlots, slotHeight, selectionHeight } = useTimelineCalculations({
        startHour: 6,
        endHour: 22,
        timeSlotInterval: 120, // 2-hour display slots
        selectionGranularity: 30, // 30-minute selection
        hourHeight: 40,
        date: '2024-01-15',
      });

      // Visual slots: 0.5 per hour for 16 hours = 8 slots
      expect(timeSlots.length).toBe(8);
      expect(slotHeight).toBe(80); // 40px per hour * 2 hours per slot

      // Selection slots: 2 per hour for 16 hours = 32 slots
      expect(selectionSlots.length).toBe(32);
      expect(selectionHeight).toBe(20); // 40px per hour / 2 slots per hour

      // Verify display slots are 2-hour intervals
      expect(timeSlots[0]).toEqual({ hours: 6, minutes: 0, index: 0 });   // 6:00-8:00
      expect(timeSlots[1]).toEqual({ hours: 8, minutes: 0, index: 1 });   // 8:00-10:00
      expect(timeSlots[2]).toEqual({ hours: 10, minutes: 0, index: 2 });  // 10:00-12:00

      // Verify selection slots are 30-minute intervals
      expect(selectionSlots[0]).toEqual({ hours: 6, minutes: 0, index: 0 });   // 6:00
      expect(selectionSlots[1]).toEqual({ hours: 6, minutes: 30, index: 1 });  // 6:30
      expect(selectionSlots[2]).toEqual({ hours: 7, minutes: 0, index: 2 });   // 7:00
      expect(selectionSlots[3]).toEqual({ hours: 7, minutes: 30, index: 3 });  // 7:30
      expect(selectionSlots[4]).toEqual({ hours: 8, minutes: 0, index: 4 });   // 8:00
    });
  });

  describe('Selection position calculations', () => {
    it('should calculate correct pixel positions for 15-minute selections', () => {
      const { selectionHeight } = useTimelineCalculations({
        startHour: 9,
        endHour: 10,
        timeSlotInterval: 60,
        selectionGranularity: 15,
        hourHeight: 80,
        date: '2024-01-15',
      });

      // Each 15-minute slot should be 20px high (80px / 4 slots)
      expect(selectionHeight).toBe(20);

      // If dragging from slot 0 to slot 3:
      // - Start position: 0 * 20 = 0px
      // - End position: 3 * 20 = 60px  
      // - Height: (3 - 0 + 1) * 20 = 80px (full hour)
      const startSlot = 0;
      const endSlot = 3;
      const expectedTop = startSlot * selectionHeight;
      const expectedHeight = (endSlot - startSlot + 1) * selectionHeight;

      expect(expectedTop).toBe(0);
      expect(expectedHeight).toBe(80);
    });

    it('should handle partial hour selections correctly', () => {
      const { selectionHeight } = useTimelineCalculations({
        startHour: 9,
        endHour: 10,
        timeSlotInterval: 60,
        selectionGranularity: 15,
        hourHeight: 80,
        date: '2024-01-15',
      });

      // If dragging from 9:15 to 9:45 (slots 1 to 2):
      // - Start position: 1 * 20 = 20px
      // - Height: (2 - 1 + 1) * 20 = 40px (30 minutes)
      const startSlot = 1; // 9:15
      const endSlot = 2;   // 9:45
      const expectedTop = startSlot * selectionHeight;
      const expectedHeight = (endSlot - startSlot + 1) * selectionHeight;

      expect(expectedTop).toBe(20);
      expect(expectedHeight).toBe(40);
    });
  });

  describe('Performance characteristics', () => {
    it('should handle large time ranges efficiently', () => {
      // Test with a full 24-hour period with 1-minute granularity
      const { timeSlots, selectionSlots } = useTimelineCalculations({
        startHour: 0,
        endHour: 24,
        timeSlotInterval: 60,
        selectionGranularity: 1,
        hourHeight: 60,
        date: '2024-01-15',
      });

      // Should handle 24 display slots and 1440 selection slots (24 * 60)
      expect(timeSlots.length).toBe(24);
      expect(selectionSlots.length).toBe(1440);
      
      // Verify last selection slot is 23:59
      expect(selectionSlots[1439]).toEqual({ hours: 23, minutes: 59, index: 1439 });
    });

    it('should maintain consistency across different configurations', () => {
      const configs = [
        { timeSlotInterval: 60, selectionGranularity: 15 },
        { timeSlotInterval: 30, selectionGranularity: 5 },
        { timeSlotInterval: 120, selectionGranularity: 30 },
      ];

      configs.forEach(config => {
        const result = useTimelineCalculations({
          startHour: 9,
          endHour: 17,
          hourHeight: 80,
          date: '2024-01-15',
          ...config,
        });

        // All configurations should produce valid results
        expect(result.timeSlots.length).toBeGreaterThan(0);
        expect(result.selectionSlots.length).toBeGreaterThan(0);
        expect(result.slotHeight).toBeGreaterThan(0);
        expect(result.selectionHeight).toBeGreaterThan(0);
        
        // Selection should be at least as granular as display
        expect(result.selectionSlots.length).toBeGreaterThanOrEqual(result.timeSlots.length);
      });
    });
  });
});