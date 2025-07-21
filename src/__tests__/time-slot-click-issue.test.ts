/**
 * Test to reproduce and fix the time slot click issue
 * 
 * User reports:
 * - 30-minute intervals: clicking 01:00 opens 01:00 ✓
 * - 60-minute intervals: clicking 01:00 opens 00:30 ✗
 * - 15-minute intervals: clicking 01:00 opens 02:00 ✗
 * 
 * @jest-environment node
 */

/* eslint-env jest */

import { useTimelineCalculations } from '../hooks/useTimelineCalculations';

// Mock react hooks
jest.mock('react', () => ({
  useCallback: jest.fn((fn) => fn),
  useMemo: jest.fn((fn) => fn()),
}));

// Simulate the complete user interaction flow
function simulateTimeSlotClick(
  yPosition: number,
  timeSlotInterval: number,
  selectionGranularity?: number,
  config: {
    startHour?: number;
    endHour?: number;
    hourHeight?: number;
  } = {}
) {
  const { startHour = 0, endHour = 24, hourHeight = 80 } = config;
  
  // Step 1: Calculate time slots (same as in component)
  const calculations = useTimelineCalculations({
    startHour,
    endHour,
    timeSlotInterval,
    selectionGranularity,
    hourHeight,
    date: '2024-01-15',
  });

  // Step 2: Simulate gesture handler (from useTimelineGestures.ts)
  const selectionSlotIndex = Math.floor(yPosition / calculations.selectionHeight);
  const clampedSlotIndex = Math.max(0, Math.min(selectionSlotIndex, calculations.selectionSlots.length - 1));
  
  // Step 3: Get the selected slot
  const selectedSlot = calculations.selectionSlots[clampedSlotIndex];
  
  // Step 4: Format the time as the user would see it
  const selectedTime = `${selectedSlot.hours.toString().padStart(2, '0')}:${selectedSlot.minutes.toString().padStart(2, '0')}`;
  
  return {
    slotIndex: clampedSlotIndex,
    selectedTime,
    calculations,
    expectedTime: '01:00', // User expects to click at 1 hour position
  };
}

describe('Time Slot Click Issue Investigation', () => {
  const clickPosition = 80; // Y=80 for hourHeight=80 should be 01:00

  describe('User reported scenarios', () => {
    test('30-minute intervals should work correctly', () => {
      const result = simulateTimeSlotClick(clickPosition, 30);
      
      console.log('30-minute test:', {
        slotIndex: result.slotIndex,
        selectedTime: result.selectedTime,
        selectionHeight: result.calculations.selectionHeight,
        calculation: `${clickPosition} / ${result.calculations.selectionHeight} = ${clickPosition / result.calculations.selectionHeight}`,
      });
      
      expect(result.selectedTime).toBe('01:00');
    });

    test('60-minute intervals should work correctly (user reports 00:30)', () => {
      const result = simulateTimeSlotClick(clickPosition, 60);
      
      console.log('60-minute test:', {
        slotIndex: result.slotIndex,
        selectedTime: result.selectedTime,
        selectionHeight: result.calculations.selectionHeight,
        calculation: `${clickPosition} / ${result.calculations.selectionHeight} = ${clickPosition / result.calculations.selectionHeight}`,
      });
      
      expect(result.selectedTime).toBe('01:00');
      // Note: This should pass, but user reports getting 00:30
    });

    test('15-minute intervals should work correctly (user reports 02:00)', () => {
      const result = simulateTimeSlotClick(clickPosition, 15);
      
      console.log('15-minute test:', {
        slotIndex: result.slotIndex,
        selectedTime: result.selectedTime,
        selectionHeight: result.calculations.selectionHeight,
        calculation: `${clickPosition} / ${result.calculations.selectionHeight} = ${clickPosition / result.calculations.selectionHeight}`,
      });
      
      expect(result.selectedTime).toBe('01:00');
      // Note: This should pass, but user reports getting 02:00
    });
  });

  describe('Consumer interpretation patterns that could cause the issue', () => {
    test('should demonstrate wrong consumer calculations', () => {
      const scenarios = [
        { interval: 30, description: '30-minute (reported working)' },
        { interval: 60, description: '60-minute (reported: 01:00 → 00:30)' },
        { interval: 15, description: '15-minute (reported: 01:00 → 02:00)' },
      ];

      scenarios.forEach(scenario => {
        const result = simulateTimeSlotClick(clickPosition, scenario.interval);
        
        // Test different ways consumers might incorrectly interpret slot indices
        const wrongInterpretations = {
          'hardcoded_30min': result.slotIndex * 30, // Always assumes 30 minutes per slot
          'slot_as_hours': result.slotIndex * 60,    // Assumes slot index = hours
          'half_interval': result.slotIndex * (scenario.interval / 2), // Assumes half intervals
        };

        console.log(`\n${scenario.description}:`);
        console.log(`  Correct slot index: ${result.slotIndex}`);
        console.log(`  Correct time: ${result.selectedTime}`);
        
        Object.entries(wrongInterpretations).forEach(([method, wrongMinutes]) => {
          const wrongHours = Math.floor(wrongMinutes / 60);
          const wrongMins = wrongMinutes % 60;
          const wrongTime = `${wrongHours.toString().padStart(2, '0')}:${wrongMins.toString().padStart(2, '0')}`;
          
          console.log(`  ${method}: ${wrongTime}`);
          
          // Check if this matches the user's reported bug
          if ((scenario.interval === 60 && wrongTime === '00:30') ||
              (scenario.interval === 15 && wrongTime === '02:00')) {
            console.log(`    ^^^^^ THIS MATCHES USER'S REPORTED BUG! ^^^^^`);
          }
        });
      });
    });
  });

  describe('Edge cases and boundary conditions', () => {
    test('should handle exact hour boundaries correctly', () => {
      const testPositions = [0, 80, 160]; // 0:00, 1:00, 2:00
      const testIntervals = [15, 30, 60];

      testIntervals.forEach(interval => {
        console.log(`\nTesting ${interval}-minute intervals:`);
        
        testPositions.forEach(position => {
          const expectedHour = position / 80;
          const result = simulateTimeSlotClick(position, interval);
          const actualHour = result.calculations.selectionSlots[result.slotIndex].hours;
          
          console.log(`  Y=${position} (expecting ${expectedHour}:00): got ${result.selectedTime}`);
          expect(actualHour).toBe(expectedHour);
        });
      });
    });

    test('should handle non-standard hour heights', () => {
      const result = simulateTimeSlotClick(100, 60, undefined, { hourHeight: 100 });
      expect(result.selectedTime).toBe('01:00');
    });

    test('should handle different start hours', () => {
      const result = simulateTimeSlotClick(80, 60, undefined, { startHour: 8 });
      // Click at Y=80 with startHour=8 should give 9:00
      expect(result.selectedTime).toBe('09:00');
    });
  });

  describe('Time slot index conversion (fix for user issue)', () => {
    test('should convert selection slot indices to time slot indices correctly', () => {
      const scenarios = [
        { timeSlotInterval: 30, selectionGranularity: undefined, description: '30-minute intervals' },
        { timeSlotInterval: 60, selectionGranularity: undefined, description: '60-minute intervals' },
        { timeSlotInterval: 15, selectionGranularity: undefined, description: '15-minute intervals' },
        { timeSlotInterval: 60, selectionGranularity: 15, description: '60-minute display, 15-minute selection' },
      ];

      scenarios.forEach(scenario => {
        console.log(`\nTesting ${scenario.description}:`);
        
        const calc = useTimelineCalculations({
          startHour: 0,
          endHour: 24,
          timeSlotInterval: scenario.timeSlotInterval,
          selectionGranularity: scenario.selectionGranularity,
          hourHeight: 80,
          date: '2024-01-15',
        });

        // Test clicking at 1:00 position (Y=80)
        const yPosition = 80;
        const selectionSlotIndex = Math.floor(yPosition / calc.selectionHeight);
        
        // Get the time this selection slot represents
        const selectedTime = calc.selectionSlots[selectionSlotIndex];
        console.log(`  Selection slot ${selectionSlotIndex}: ${selectedTime.hours}:${selectedTime.minutes.toString().padStart(2, '0')}`);
        
        // Convert to time slot index
        const timeSlotIndex = timeToTimeSlotIndex(
          selectedTime.hours,
          selectedTime.minutes,
          0, // startHour
          scenario.timeSlotInterval
        );
        
        console.log(`  Converted to time slot index: ${timeSlotIndex}`);
        
        // Verify the time slot index gives the expected time
        const expectedTimeInMinutes = timeSlotIndex * scenario.timeSlotInterval;
        const expectedHours = Math.floor(expectedTimeInMinutes / 60);
        const expectedMinutes = expectedTimeInMinutes % 60;
        const expectedTime = `${expectedHours}:${expectedMinutes.toString().padStart(2, '0')}`;
        
        console.log(`  Time slot ${timeSlotIndex} represents: ${expectedTime}`);
        
        // For the user's issue: the converted time should always be 01:00 when clicking at the 1-hour position
        expect(expectedTime).toBe('1:00');
      });
    });

    // Helper function for test
    function timeToTimeSlotIndex(hours: number, minutes: number, startHour: number, timeSlotInterval: number): number {
      const totalMinutes = hours * 60 + minutes;
      const startMinutes = startHour * 60;
      const offsetMinutes = totalMinutes - startMinutes;
      return Math.floor(offsetMinutes / timeSlotInterval);
    }
  });

  describe('Verification that the math is sound', () => {
    test('should verify calculation consistency', () => {
      const intervals = [15, 30, 60];
      const hourHeight = 80;
      
      intervals.forEach(interval => {
        const calc = useTimelineCalculations({
          startHour: 0,
          endHour: 24,
          timeSlotInterval: interval,
          selectionGranularity: undefined,
          hourHeight,
          date: '2024-01-15',
        });

        // Verify that selection and time slots are identical when no granularity specified
        expect(calc.timeSlots.length).toBe(calc.selectionSlots.length);
        expect(calc.slotHeight).toBe(calc.selectionHeight);
        
        // Verify that calculations are mathematically correct
        const expectedSlotHeight = hourHeight / (60 / interval);
        expect(calc.slotHeight).toBe(expectedSlotHeight);
        expect(calc.selectionHeight).toBe(expectedSlotHeight);
        
        // Verify slot content matches expectations
        for (let i = 0; i < Math.min(4, calc.timeSlots.length); i++) {
          expect(calc.timeSlots[i]).toEqual(calc.selectionSlots[i]);
          
          const expectedMinutes = i * interval;
          const expectedHours = Math.floor(expectedMinutes / 60);
          const expectedMins = expectedMinutes % 60;
          
          expect(calc.timeSlots[i].hours).toBe(expectedHours);
          expect(calc.timeSlots[i].minutes).toBe(expectedMins);
        }
      });
    });
  });
});

// Additional helper test to identify the exact issue
describe('Debugging helper', () => {
  test('should help identify where the 30-minute assumption comes from', () => {
    console.log('\n=== DEBUGGING THE 30-MINUTE ASSUMPTION ===');
    
    const testCases = [
      { interval: 60, expectsWrong: '00:30' },
      { interval: 15, expectsWrong: '02:00' },
    ];

    testCases.forEach(testCase => {
      const result = simulateTimeSlotClick(80, testCase.interval);
      
      console.log(`\n${testCase.interval}-minute interval:`);
      console.log(`  Slot index: ${result.slotIndex}`);
      console.log(`  Correct time: ${result.selectedTime}`);
      console.log(`  User reports: ${testCase.expectsWrong}`);
      
      // Work backwards from user's wrong result to find the calculation
      const [wrongHours, wrongMins] = testCase.expectsWrong.split(':').map(Number);
      const wrongTotalMins = wrongHours * 60 + wrongMins;
      
      console.log(`  Working backwards from ${testCase.expectsWrong}:`);
      console.log(`    Wrong total minutes: ${wrongTotalMins}`);
      console.log(`    If slotIndex * X = ${wrongTotalMins}, then X = ${wrongTotalMins / result.slotIndex}`);
      
      if (Math.abs(wrongTotalMins / result.slotIndex - 30) < 0.1) {
        console.log(`    ^^^^ CONFIRMS 30-MINUTE HARDCODED ASSUMPTION! ^^^^`);
      }
    });
  });
});