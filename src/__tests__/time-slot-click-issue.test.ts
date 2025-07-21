/**
 * Time Slot Click Issue Tests
 * Testing the reported issue where clicking on time slots gives wrong times
 * @jest-environment node
 */

/* eslint-env jest */

import { useTimelineCalculations } from '../hooks/useTimelineCalculations';

// Mock react hooks
jest.mock('react', () => ({
  useCallback: jest.fn((fn) => fn),
  useMemo: jest.fn((fn) => fn()),
}));

describe('Time Slot Click Issue', () => {
  const baseProps = {
    startHour: 0,
    endHour: 24,
    hourHeight: 80,
    date: '2024-01-15',
  };

  describe('Click position to time slot mapping', () => {
    // Helper function to simulate a click at a specific Y position and return the expected time
    const simulateClickAtPosition = (yPosition: number, timeSlotInterval: number, selectionGranularity?: number) => {
      const calculations = useTimelineCalculations({
        ...baseProps,
        timeSlotInterval,
        selectionGranularity,
      });

      // This simulates the gesture handler logic from useTimelineGestures.ts
      const selectionSlotIndex = Math.floor(yPosition / calculations.selectionHeight);
      const clampedSlotIndex = Math.max(0, Math.min(selectionSlotIndex, calculations.selectionSlots.length - 1));
      
      // Get the time slot that would be selected
      const selectedSlot = calculations.selectionSlots[clampedSlotIndex];
      
      return {
        calculatedIndex: clampedSlotIndex,
        selectedTime: `${selectedSlot.hours.toString().padStart(2, '0')}:${selectedSlot.minutes.toString().padStart(2, '0')}`,
        expectedIndex: Math.floor(yPosition / calculations.slotHeight), // What the display index should be
        calculations,
      };
    };

    it('should correctly map click at 01:00 position for 30-minute intervals', () => {
      // For 30-minute intervals, 01:00 should be at Y position 160 (2 * 80px)
      const yPosition = 160; // 2 hours * 80px per hour
      const result = simulateClickAtPosition(yPosition, 30);
      
      console.log('30-minute test:', result);
      expect(result.selectedTime).toBe('01:00');
    });

    it('should correctly map click at 01:00 position for 60-minute intervals', () => {
      // For 60-minute intervals, 01:00 should be at Y position 80 (1 * 80px)
      const yPosition = 80; // 1 hour * 80px per hour
      const result = simulateClickAtPosition(yPosition, 60);
      
      console.log('60-minute test:', result);
      expect(result.selectedTime).toBe('01:00');
    });

    it('should correctly map click at 01:00 position for 15-minute intervals', () => {
      // For 15-minute intervals, 01:00 should be at Y position 80 (1 * 80px)  
      const yPosition = 80; // 1 hour * 80px per hour
      const result = simulateClickAtPosition(yPosition, 15);
      
      console.log('15-minute test:', result);
      expect(result.selectedTime).toBe('01:00');
    });

    it('should work correctly with different hour heights', () => {
      const calculations = useTimelineCalculations({
        ...baseProps,
        timeSlotInterval: 60,
        hourHeight: 120, // Different hour height
      });

      // For 60-minute intervals with 120px hour height, 01:00 should be at Y position 120
      const yPosition = 120;
      const selectionSlotIndex = Math.floor(yPosition / calculations.selectionHeight);
      const selectedSlot = calculations.selectionSlots[selectionSlotIndex];
      const selectedTime = `${selectedSlot.hours.toString().padStart(2, '0')}:${selectedSlot.minutes.toString().padStart(2, '0')}`;
      
      expect(selectedTime).toBe('01:00');
    });

    describe('Detailed calculation analysis', () => {
      it('should show calculation details for 60-minute intervals', () => {
        const calculations = useTimelineCalculations({
          ...baseProps,
          timeSlotInterval: 60,
        });

        console.log('60-minute calculations:', {
          timeSlots: calculations.timeSlots.length,
          selectionSlots: calculations.selectionSlots.length,
          slotHeight: calculations.slotHeight,
          selectionHeight: calculations.selectionHeight,
          firstFewTimeSlots: calculations.timeSlots.slice(0, 5),
          firstFewSelectionSlots: calculations.selectionSlots.slice(0, 5),
        });

        // At Y=80 (1 hour down), we should get slot index 1
        const yPosition = 80;
        const calculatedIndex = Math.floor(yPosition / calculations.selectionHeight);
        console.log('At Y=80:', { calculatedIndex, expectedTime: '01:00' });
      });

      it('should show calculation details for 15-minute intervals', () => {
        const calculations = useTimelineCalculations({
          ...baseProps,
          timeSlotInterval: 15,
        });

        console.log('15-minute calculations:', {
          timeSlots: calculations.timeSlots.length,
          selectionSlots: calculations.selectionSlots.length,
          slotHeight: calculations.slotHeight,
          selectionHeight: calculations.selectionHeight,
          firstFewTimeSlots: calculations.timeSlots.slice(0, 8),
          firstFewSelectionSlots: calculations.selectionSlots.slice(0, 8),
        });

        // At Y=80 (1 hour down), we should get the slot that represents 01:00
        const yPosition = 80;
        const calculatedIndex = Math.floor(yPosition / calculations.selectionHeight);
        console.log('At Y=80:', { calculatedIndex, expectedTime: '01:00' });
        
        // For 15-minute intervals, 01:00 should be at index 4 (4 * 15min = 60min = 1 hour)
        expect(calculatedIndex).toBe(4);
        expect(calculations.selectionSlots[4]).toEqual({ hours: 1, minutes: 0, index: 4 });
      });
    });
  });
});