// Main component
export { default as MultiResourceTimeline } from './MultiResourceTimeline';

// Types
export type {
    DragSelection, EventPosition, EventStatus, MultiResourceEvent, MultiResourceTimelineProps, MultiResourceTimelineRef, Resource,
    TimeSlot, TimelineTheme,
    WorkingHours,
    WorkingHoursStyle
} from './types';

export { StatusColors } from './types';

// Theme utilities
export { getTheme, lightTheme, darkTheme } from './theme';

// Constants
export * from './constants';

// Styles
export { createEventStyles } from './styles/eventStyles';
export { createTimelineStyles } from './styles/timelineStyles';

// Hooks (for advanced usage)
export { useTimelineCalculations } from './hooks/useTimelineCalculations';
export { useTimelineSelection } from './hooks/useTimelineSelection';
export { useHapticFeedback, HapticPattern } from './hooks/useHapticFeedback';
export { useWorkingHours } from './hooks/useWorkingHours';

// Utility functions
export {
    getResourceWorkingHours, minutesToSlotIndex,
    parseTimeRange, parseWorkingHours, timeToMinutes
} from './utils/workingHoursParser';

export { createHapticFeedback } from './utils/haptics';
export type { HapticFeedback, HapticFeedbackOptions } from './utils/haptics';

// Constants
export {
    ACCESSIBILITY, ANIMATION_DURATIONS,
    EVENT_CONSTRAINTS, HOUR_WIDTH,
    MIN_TOUCH_TARGET, PERFORMANCE, ZOOM_LIMITS
} from './constants';

