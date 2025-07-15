import { useMemo } from 'react';
import { Resource } from '../types';
import { getResourceWorkingHours, WorkingSlots } from '../utils/workingHoursParser';

export interface UseWorkingHoursResult {
  getWorkingHoursForResource: (resourceId: string) => WorkingSlots;
  hasWorkingHours: boolean;
}

/**
 * Hook for managing working hours calculations
 * @param resources Array of resources with working hours
 * @param date Current date in YYYY-MM-DD format
 * @param startHour Timeline start hour
 * @param endHour Timeline end hour
 * @param timeSlotInterval Time slot interval in minutes
 * @returns Working hours utilities
 */
export const useWorkingHours = (
  resources: Resource[],
  date: string,
  startHour: number,
  endHour: number,
  timeSlotInterval: number
): UseWorkingHoursResult => {
  
  // Pre-calculate working hours for all resources
  const workingHoursMap = useMemo(() => {
    const map = new Map<string, WorkingSlots>();
    
    resources.forEach(resource => {
      const workingSlots = getResourceWorkingHours(
        resource,
        date,
        startHour,
        endHour,
        timeSlotInterval
      );
      map.set(resource.id, workingSlots);
    });
    
    return map;
  }, [resources, date, startHour, endHour, timeSlotInterval]);

  // Check if any resource has working hours defined
  const hasWorkingHours = useMemo(() => {
    return resources.some(resource => 
      resource.workingHours && 
      resource.workingHours[date] && 
      resource.workingHours[date].length > 0
    );
  }, [resources, date]);

  const getWorkingHoursForResource = (resourceId: string): WorkingSlots => {
    return workingHoursMap.get(resourceId) || {
      isWorking: [],
      workingRanges: []
    };
  };

  return {
    getWorkingHoursForResource,
    hasWorkingHours
  };
};
