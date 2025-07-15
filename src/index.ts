// Main timeline component - will be created next
export { default as MultiResourceTimeline } from './MultiResourceTimeline';

// Types
export type {
    DragSelection, EventPosition, EventStatus, MultiResourceEvent, MultiResourceTimelineProps, MultiResourceTimelineRef, Resource,
    TimeSlot, TimelineTheme,
    WorkingHours,
    WorkingHoursStyle
} from './types';

export { StatusColors } from './types';

// Theme
export { darkTheme, getTheme, lightTheme } from './theme';

// Styles
export { createEventStyles } from './styles/eventStyles';
export { createTimelineStyles } from './styles/timelineStyles';

// Hooks
export { HapticPattern, useHapticFeedback } from './hooks/useHapticFeedback';

// Utils
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

