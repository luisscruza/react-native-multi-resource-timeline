import { useMemo } from 'react';
import { EVENT_CONSTRAINTS } from '../constants';
import { EventPosition, MultiResourceEvent } from '../types';

interface UseEventPositioningProps {
  events: MultiResourceEvent[];
  date: string;
  startHour: number;
  hourHeight: number;
  eventMinHeight: number;
}

export const useEventPositioning = ({
  events,
  date,
  startHour,
  hourHeight,
  eventMinHeight,
}: UseEventPositioningProps) => {
  
  const getEventPosition = useMemo(() => {
    return (event: MultiResourceEvent, allResourceEvents: MultiResourceEvent[] = []): EventPosition => {
      const startTime = new Date(`${date} ${event.start.split(' ')[1]}`);
      const endTime = new Date(`${date} ${event.end.split(' ')[1]}`);
      
      const startHours = startTime.getHours() + startTime.getMinutes() / 60;
      const endHours = endTime.getHours() + endTime.getMinutes() / 60;
      
      const top = (startHours - startHour) * hourHeight;
      const height = Math.max((endHours - startHours) * hourHeight, eventMinHeight);
      
      let leftOffset = '0%';
      let rightOffset = '0%';
      let eventWidth = '100%';
      
      // Handle overlapping events
      if (allResourceEvents.length > 1) {
        const overlappingEvents = allResourceEvents.filter(otherEvent => {
          if (otherEvent.start === event.start && otherEvent.end === event.end && otherEvent.title === event.title) {
            return false;
          }
          
          const otherStartTime = new Date(`${date} ${otherEvent.start.split(' ')[1]}`);
          const otherEndTime = new Date(`${date} ${otherEvent.end.split(' ')[1]}`);
          
          return (startTime < otherEndTime && endTime > otherStartTime);
        });
        
        if (overlappingEvents.length > 0) {
          const allOverlappingEvents = [event, ...overlappingEvents].sort((a, b) => {
            const aStart = new Date(`${date} ${a.start.split(' ')[1]}`);
            const bStart = new Date(`${date} ${b.start.split(' ')[1]}`);
            if (aStart.getTime() !== bStart.getTime()) {
              return aStart.getTime() - bStart.getTime();
            }
            const aEnd = new Date(`${date} ${a.end.split(' ')[1]}`);
            const bEnd = new Date(`${date} ${b.end.split(' ')[1]}`);
            return aEnd.getTime() - bEnd.getTime();
          });
          
          const totalOverlapping = allOverlappingEvents.length;
          const eventIndex = allOverlappingEvents.findIndex(e => 
            e.start === event.start && e.end === event.end && e.title === event.title
          );
          
          const widthPercent = 100 / totalOverlapping;
          const leftPercent = eventIndex * widthPercent;
          
          leftOffset = `${leftPercent}%`;
          eventWidth = `${widthPercent - 1}%`;
          rightOffset = '0%';
        }
      }
      
      return { 
        top, 
        height, 
        leftOffset, 
        rightOffset,
        eventWidth
      };
    };
  }, [date, startHour, hourHeight, eventMinHeight]);

  const getEventStyling = useMemo(() => {
    return (event: MultiResourceEvent, allResourceEvents: MultiResourceEvent[]) => {
      const { height } = getEventPosition(event, allResourceEvents);
      
      const startTime = new Date(`${date} ${event.start.split(' ')[1]}`);
      const endTime = new Date(`${date} ${event.end.split(' ')[1]}`);
      const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      
      const isVeryShortEvent = durationMinutes < EVENT_CONSTRAINTS.shortEventThreshold;
      const isShortEvent = durationMinutes < EVENT_CONSTRAINTS.veryShortEventThreshold;
      const actualHeight = Math.max(height, isVeryShortEvent ? EVENT_CONSTRAINTS.minHeight : 50);
      
      const isNarrowDueToOverlap = allResourceEvents.length > 1;
      
      return {
        isVeryShortEvent,
        isShortEvent,
        actualHeight,
        isNarrowDueToOverlap,
        durationMinutes,
        dynamicPadding: actualHeight < 60 
          ? (isNarrowDueToOverlap ? EVENT_CONSTRAINTS.padding.minimal : EVENT_CONSTRAINTS.padding.compact)
          : (isNarrowDueToOverlap ? EVENT_CONSTRAINTS.padding.compact : EVENT_CONSTRAINTS.padding.normal),
      };
    };
  }, [date, getEventPosition]);

  return {
    getEventPosition,
    getEventStyling,
  };
};
