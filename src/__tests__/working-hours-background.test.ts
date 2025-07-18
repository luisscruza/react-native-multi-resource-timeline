/**
 * Working Hours Background Tests
 * 
 * Tests to ensure working hours background shows correctly even when 
 * working hours are not defined for a resource on a specific date.
 */

/* eslint-env jest */

import { getResourceWorkingHours } from '../utils/workingHoursParser';

describe('Working Hours Background', () => {
  const testDate = '2025-01-15';
  const startHour = 9;
  const endHour = 17;
  const timeSlotInterval = 30;
  const expectedTotalSlots = ((endHour - startHour) * 60) / timeSlotInterval; // 16 slots for 8 hours with 30-min intervals

  describe('getResourceWorkingHours', () => {
    it('should return all non-working slots when resource has no working hours', () => {
      const resource = { id: 'test-resource' };
      
      const result = getResourceWorkingHours(resource, testDate, startHour, endHour, timeSlotInterval);
      
      expect(result.isWorking).toHaveLength(expectedTotalSlots);
      expect(result.isWorking.every(slot => slot === false)).toBe(true);
      expect(result.workingRanges).toHaveLength(0);
    });

    it('should return all non-working slots when resource has working hours but not for the specific date', () => {
      const resource = {
        id: 'test-resource',
        workingHours: {
          '2025-01-14': ['09:00-17:00'], // Different date
        }
      };
      
      const result = getResourceWorkingHours(resource, testDate, startHour, endHour, timeSlotInterval);
      
      expect(result.isWorking).toHaveLength(expectedTotalSlots);
      expect(result.isWorking.every(slot => slot === false)).toBe(true);
      expect(result.workingRanges).toHaveLength(0);
    });

    it('should return all non-working slots when resource has empty working hours array for the date', () => {
      const resource = {
        id: 'test-resource',
        workingHours: {
          [testDate]: [] // Empty array
        }
      };
      
      const result = getResourceWorkingHours(resource, testDate, startHour, endHour, timeSlotInterval);
      
      expect(result.isWorking).toHaveLength(expectedTotalSlots);
      expect(result.isWorking.every(slot => slot === false)).toBe(true);
      expect(result.workingRanges).toHaveLength(0);
    });

    it('should return correct working slots when resource has working hours for the date', () => {
      const resource = {
        id: 'test-resource',
        workingHours: {
          [testDate]: ['09:00-12:00', '13:00-17:00'] // Working hours with lunch break
        }
      };
      
      const result = getResourceWorkingHours(resource, testDate, startHour, endHour, timeSlotInterval);
      
      expect(result.isWorking).toHaveLength(expectedTotalSlots);
      expect(result.workingRanges).toHaveLength(2);
      
      // Check that we have some working slots
      expect(result.isWorking.some(slot => slot === true)).toBe(true);
      // Check that we have some non-working slots (lunch break)
      expect(result.isWorking.some(slot => slot === false)).toBe(true);
    });

    it('should handle single working hour range correctly', () => {
      const resource = {
        id: 'test-resource',
        workingHours: {
          [testDate]: ['10:00-14:00'] // Single 4-hour working period
        }
      };
      
      const result = getResourceWorkingHours(resource, testDate, startHour, endHour, timeSlotInterval);
      
      expect(result.isWorking).toHaveLength(expectedTotalSlots);
      expect(result.workingRanges).toHaveLength(1);
      
      // Should have both working and non-working slots
      expect(result.isWorking.some(slot => slot === true)).toBe(true);
      expect(result.isWorking.some(slot => slot === false)).toBe(true);
    });
  });
});