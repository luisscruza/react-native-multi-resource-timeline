// Main timeline component - will be created next
export { default as MultiResourceTimeline } from './MultiResourceTimeline';

// Types
export type {
  MultiResourceEvent,
  Resource,
  TimeSlot,
  EventPosition,
  DragSelection,
  MultiResourceTimelineRef,
  MultiResourceTimelineProps,
  TimelineTheme,
  WorkingHours,
  WorkingHoursStyle,
  EventStatus
} from './types';

export { StatusColors } from './types';

// Theme
export { lightTheme, darkTheme, getTheme } from './theme';

// Styles
export { createTimelineStyles } from './styles/timelineStyles';
export { createEventStyles } from './styles/eventStyles';

// Hooks
export { useHapticFeedback, HapticPattern } from './hooks/useHapticFeedback';

// Utils
export {
  parseWorkingHours,
  getResourceWorkingHours,
  timeToMinutes,
  minutesToSlotIndex,
  parseTimeRange
} from './utils/workingHoursParser';

export { createHapticFeedback } from './utils/haptics';
export type { HapticFeedback, HapticFeedbackOptions } from './utils/haptics';

// Constants
export {
  HOUR_WIDTH,
  MIN_TOUCH_TARGET,
  ZOOM_LIMITS,
  ANIMATION_DURATIONS,
  EVENT_CONSTRAINTS,
  ACCESSIBILITY,
  PERFORMANCE
} from './constants';
