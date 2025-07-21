/**
 * Test to verify the exact fix for the selection granularity issue
 * @jest-environment node
 */

/* eslint-env jest */

import { useTimelineCalculations } from '../hooks/useTimelineCalculations';
import { useTimelineSelection } from '../hooks/useTimelineSelection';

// Mock react hooks
jest.mock('react', () => ({
  useCallback: jest.fn((fn) => fn),
  useMemo: jest.fn((fn) => fn()),
  useState: jest.fn((initialValue) => [initialValue, jest.fn()]),
}));

describe('Selection Granularity Fix', () => {
  describe('User reported issue: timeSlotInterval=60, selectionGranularity=15', () => {
    const mockProps = {
      startHour: 7,
      endHour: 18,
      timeSlotInterval: 60,
      selectionGranularity: 15,
      hourHeight: 80,
      date: '2024-01-15',
    };

    it('should preserve exact granular times when dragging from 07:15 to 08:00', () => {
      const { selectionSlots, selectionHeight } = useTimelineCalculations(mockProps);
      const { completeDragSelection } = useTimelineSelection();

      // Simulate drag from 07:15 to 08:00
      // 07:15 = 15 minutes = 0.25 * 80px = 20px from start
      const startY = 20;
      const endY = 80; // 08:00 = 1 hour = 80px

      const startSlotIndex = Math.floor(startY / selectionHeight);
      const endSlotIndex = Math.floor(endY / selectionHeight);

      console.log('Selection height:', selectionHeight);
      console.log('Start slot index:', startSlotIndex, 'at', selectionSlots[startSlotIndex]);
      console.log('End slot index:', endSlotIndex, 'at', selectionSlots[endSlotIndex]);

      // Verify the slots represent the correct times
      expect(selectionSlots[startSlotIndex]).toEqual({ hours: 7, minutes: 15, index: startSlotIndex });
      expect(selectionSlots[endSlotIndex]).toEqual({ hours: 8, minutes: 0, index: endSlotIndex });

      // Test the completion callback with conversion
      const mockOnComplete = jest.fn();
      
      // Simulate the completeDragSelection call with the exact parameters from the main component
      completeDragSelection(
        mockOnComplete,
        selectionSlots,
        mockProps.timeSlotInterval,
        mockProps.startHour,
        mockProps.selectionGranularity
      );

      // The callback should be called with indices that, when used with selectionGranularity,
      // give back the exact selected times
      expect(mockOnComplete).toHaveBeenCalled();
      const [resourceId, startIndex, endIndex] = mockOnComplete.mock.calls[0];

      console.log('Callback called with indices:', startIndex, endIndex);

      // Convert back to times to verify
      const startMinutes = startIndex * mockProps.selectionGranularity;
      const endMinutes = endIndex * mockProps.selectionGranularity;

      const startTime = {
        hours: Math.floor((startMinutes + mockProps.startHour * 60) / 60),
        minutes: (startMinutes + mockProps.startHour * 60) % 60
      };

      const endTime = {
        hours: Math.floor((endMinutes + mockProps.startHour * 60) / 60),
        minutes: (endMinutes + mockProps.startHour * 60) % 60
      };

      console.log('Converted start time:', startTime);
      console.log('Converted end time:', endTime);

      // Verify the exact times are preserved
      expect(startTime).toEqual({ hours: 7, minutes: 15 });
      expect(endTime).toEqual({ hours: 8, minutes: 0 });
    });

    it('should preserve exact granular times when dragging from 07:45 to 08:00', () => {
      const { selectionSlots, selectionHeight } = useTimelineCalculations(mockProps);
      const { completeDragSelection } = useTimelineSelection();

      // Simulate drag from 07:45 to 08:00
      // 07:45 = 45 minutes = 0.75 * 80px = 60px from start
      const startY = 60;
      const endY = 80; // 08:00 = 1 hour = 80px

      const startSlotIndex = Math.floor(startY / selectionHeight);
      const endSlotIndex = Math.floor(endY / selectionHeight);

      // Verify the slots represent the correct times
      expect(selectionSlots[startSlotIndex]).toEqual({ hours: 7, minutes: 45, index: startSlotIndex });
      expect(selectionSlots[endSlotIndex]).toEqual({ hours: 8, minutes: 0, index: endSlotIndex });

      // Test the completion callback with conversion
      const mockOnComplete = jest.fn();
      
      completeDragSelection(
        mockOnComplete,
        selectionSlots,
        mockProps.timeSlotInterval,
        mockProps.startHour,
        mockProps.selectionGranularity
      );

      expect(mockOnComplete).toHaveBeenCalled();
      const [resourceId, startIndex, endIndex] = mockOnComplete.mock.calls[0];

      // Convert back to times to verify
      const startMinutes = startIndex * mockProps.selectionGranularity;
      const endMinutes = endIndex * mockProps.selectionGranularity;

      const startTime = {
        hours: Math.floor((startMinutes + mockProps.startHour * 60) / 60),
        minutes: (startMinutes + mockProps.startHour * 60) % 60
      };

      const endTime = {
        hours: Math.floor((endMinutes + mockProps.startHour * 60) / 60),
        minutes: (endMinutes + mockProps.startHour * 60) % 60
      };

      // Verify the exact times are preserved
      expect(startTime).toEqual({ hours: 7, minutes: 45 });
      expect(endTime).toEqual({ hours: 8, minutes: 0 });
    });
  });

  describe('Backward compatibility', () => {
    it('should work with standard timeSlotInterval without selectionGranularity', () => {
      const mockProps = {
        startHour: 8,
        endHour: 18,
        timeSlotInterval: 30,
        hourHeight: 80,
        date: '2024-01-15',
      };

      const { timeSlots, selectionSlots } = useTimelineCalculations(mockProps);
      const { completeDragSelection } = useTimelineSelection();

      // When no selectionGranularity is provided, selection should work as before
      expect(timeSlots.length).toBe(selectionSlots.length);
      expect(timeSlots[0]).toEqual(selectionSlots[0]);

      // Test completion callback without selectionGranularity parameter
      const mockOnComplete = jest.fn();
      
      completeDragSelection(
        mockOnComplete,
        selectionSlots,
        mockProps.timeSlotInterval,
        mockProps.startHour
        // No selectionGranularity parameter
      );

      expect(mockOnComplete).toHaveBeenCalled();
      // Should fall back to raw indices for backward compatibility
    });
  });

  describe('Edge cases', () => {
    it('should handle different granularities correctly', () => {
      const testCases = [
        { granularity: 5, description: '5-minute granularity' },
        { granularity: 15, description: '15-minute granularity' },
        { granularity: 30, description: '30-minute granularity' },
      ];

      testCases.forEach(({ granularity, description }) => {
        console.log(`Testing ${description}`);

        const mockProps = {
          startHour: 9,
          endHour: 17,
          timeSlotInterval: 60,
          selectionGranularity: granularity,
          hourHeight: 80,
          date: '2024-01-15',
        };

        const { selectionSlots } = useTimelineCalculations(mockProps);
        
        // Verify the slots are correctly calculated
        const slotsPerHour = 60 / granularity;
        const expectedSlots = (mockProps.endHour - mockProps.startHour) * slotsPerHour;
        
        expect(selectionSlots.length).toBe(expectedSlots);

        // Verify first few slots have correct times
        for (let i = 0; i < Math.min(3, selectionSlots.length); i++) {
          const expectedMinutes = mockProps.startHour * 60 + i * granularity;
          const expectedHours = Math.floor(expectedMinutes / 60);
          const expectedMins = expectedMinutes % 60;
          
          expect(selectionSlots[i]).toEqual({
            hours: expectedHours,
            minutes: expectedMins,
            index: i
          });
        }
      });
    });
  });
});