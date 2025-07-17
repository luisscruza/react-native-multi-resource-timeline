// Layout constants
export const HOUR_WIDTH = 60;
export const MIN_TOUCH_TARGET = 44;

// Zoom constraints
export const ZOOM_LIMITS = {
  vertical: {
    min: 0.75,
    max: 2.5,
  },
  horizontal: {
    min: 1.1,
    max: 2.5,
  },
} as const;

// Animation timing
export const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
  loading: 1000,
} as const;

// Event styling
export const EVENT_CONSTRAINTS = {
  minHeight: 40,
  shortEventThreshold: 30, // minutes
  veryShortEventThreshold: 45, // minutes
  padding: {
    normal: 12,
    compact: 8,
    minimal: 6,
  },
} as const;

// Accessibility
export const ACCESSIBILITY = {
  minTouchTarget: MIN_TOUCH_TARGET,
  focusTimeout: 300,
  announceDelay: 500,
} as const;

// Performance
export const PERFORMANCE = {
  scrollThrottle: 16, // ~60fps
  gestureThrottle: 16,
  animationThrottle: 32,
  zoomThrottle: 32, // ~30fps for zoom updates to prevent excessive worklet calls
  virtualizationBuffer: 5, // slots to render outside viewport
  // Horizontal virtualization thresholds
  horizontalVirtualization: {
    columnThreshold: 8, // Enable horizontal virtualization when > 8 columns
    visibleColumnsBuffer: 2, // Render 2 extra columns on each side
  },
  // Optimized thresholds for multi-column scenarios
  virtualScrollThresholds: {
    // Lower thresholds for better performance with multiple columns
    events: 50, // Was 100
    eventsWithMultipleColumns: 20, // When > 4 columns
    columnsThreshold: 4,
  },
} as const;
