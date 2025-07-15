# API Documentation

## Components

### MultiResourceTimeline

The main timeline component that displays events across multiple resources.

#### Example
```tsx
import { MultiResourceTimeline } from 'react-native-multi-resource-timeline';

<MultiResourceTimeline
  resources={resources}
  events={events}
  date="2025-07-15"
  startHour={8}
  endHour={18}
  onEventPress={(event) => console.log(event)}
/>
```

#### Props
See main README.md for full props documentation.

## Hooks

### useHapticFeedback

Provides haptic feedback functionality with graceful fallback.

```tsx
import { useHapticFeedback, HapticPattern } from 'react-native-multi-resource-timeline';

const { triggerHaptic, lightImpact, mediumImpact } = useHapticFeedback({ enabled: true });

// Trigger specific haptic
triggerHaptic(HapticPattern.SUCCESS);

// Or use direct methods
lightImpact();
```

## Utilities

### Working Hours Parser

```tsx
import { parseWorkingHours, getResourceWorkingHours } from 'react-native-multi-resource-timeline';

const workingSlots = parseWorkingHours(
  ['09:00-12:00', '14:00-18:00'],
  8, // startHour
  20, // endHour
  60 // timeSlotInterval
);
```

### Haptics

```tsx
import { createHapticFeedback } from 'react-native-multi-resource-timeline';

const haptics = createHapticFeedback({ enabled: true });
haptics.lightImpact();
```

## Types

### Core Types

- `MultiResourceEvent` - Event data structure
- `Resource` - Resource (column) definition
- `TimelineTheme` - Theme configuration
- `WorkingHours` - Working hours definition
- `MultiResourceTimelineProps` - Main component props
- `MultiResourceTimelineRef` - Component ref methods

### Enums

- `EventStatus` - Event status options
- `HapticPattern` - Haptic feedback patterns

## Theme System

The timeline uses a comprehensive theme system:

```tsx
import { getTheme, lightTheme, darkTheme } from 'react-native-multi-resource-timeline';

// Use predefined themes
const theme = getTheme('light'); // or 'dark'

// Custom theme
const customTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#6200ee'
  }
};
```

## Constants

### Layout Constants
- `HOUR_WIDTH` - Width of time column
- `MIN_TOUCH_TARGET` - Minimum touch target size

### Zoom Limits
- `ZOOM_LIMITS.vertical` - Vertical zoom constraints
- `ZOOM_LIMITS.horizontal` - Horizontal zoom constraints

### Animation Durations
- `ANIMATION_DURATIONS.fast/normal/slow` - Predefined animation timings

### Performance
- `PERFORMANCE.scrollThrottle` - Scroll event throttling
- `PERFORMANCE.virtualizationBuffer` - Virtual scroll buffer size
