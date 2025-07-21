# Enhanced Time Slots Selection

This feature allows users to select portions of time slots with configurable granularity, enabling more precise time selection while maintaining clean visual time slot display.

## Overview

The timeline component now supports two independent time interval configurations:

1. **`timeSlotInterval`** - Controls the visual display of time slots (e.g., 60 minutes shows hourly slots)
2. **`selectionGranularity`** - Controls the precision of drag selection (e.g., 15 minutes allows quarter-hour selections)

## Usage

```tsx
import { MultiResourceTimeline } from 'react-native-multi-resource-timeline';

<MultiResourceTimeline
  timeSlotInterval={60}        // Show hourly time slots visually
  selectionGranularity={15}    // Allow selection in 15-minute increments
  // ... other props
/>
```

## Example Scenarios

### Scenario 1: Hourly Display with 15-minute Selection
```tsx
<MultiResourceTimeline
  timeSlotInterval={60}
  selectionGranularity={15}
  startHour={9}
  endHour={17}
  // ...
/>
```

**Result**: 
- Visual display shows: 9:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00
- Selection can be: 9:15-9:45, 10:30-11:15, etc.

### Scenario 2: 30-minute Display with 5-minute Selection
```tsx
<MultiResourceTimeline
  timeSlotInterval={30}
  selectionGranularity={5}
  startHour={8}
  endHour={18}
  // ...
/>
```

**Result**:
- Visual display shows: 8:00, 8:30, 9:00, 9:30, 10:00, etc.
- Selection can be: 8:05-8:25, 9:35-10:10, etc.

### Scenario 3: 2-hour Display with 30-minute Selection
```tsx
<MultiResourceTimeline
  timeSlotInterval={120}
  selectionGranularity={30}
  startHour={6}
  endHour={22}
  // ...
/>
```

**Result**:
- Visual display shows: 6:00, 8:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00
- Selection can be: 6:30-7:30, 8:00-9:00, etc.

## Backward Compatibility

If `selectionGranularity` is not provided, the component falls back to using `timeSlotInterval` for both display and selection, maintaining full backward compatibility.

```tsx
<MultiResourceTimeline
  timeSlotInterval={60}
  // selectionGranularity not provided - uses timeSlotInterval (60min) for both
  // ...
/>
```

## Performance Optimizations

The implementation includes several performance optimizations:

1. **Separate Calculation Paths**: Display slots and selection slots are calculated independently to minimize re-renders
2. **Memoization**: All calculations are memoized to prevent unnecessary recalculations
3. **Efficient Updates**: Only components affected by selection changes are re-rendered
4. **Optimized Gesture Handling**: Drag calculations use worklets for smooth performance

## API Reference

### New Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectionGranularity` | `number` | `undefined` | Time interval in minutes for drag selection precision. Falls back to `timeSlotInterval` if not provided. |

### Selection Callback

The `onTimeSlotSelect` callback receives slot indices based on the selection granularity:

```tsx
const handleTimeSlotSelect = (resourceId: string, startSlot: number, endSlot: number) => {
  // Calculate actual time based on selection granularity
  const startHour = 8; // Your timeline start hour
  const granularity = 15; // Your selection granularity in minutes
  
  const startMinutes = startHour * 60 + startSlot * granularity;
  const endMinutes = startHour * 60 + (endSlot + 1) * granularity;
  
  const startTime = `${Math.floor(startMinutes / 60)}:${(startMinutes % 60).toString().padStart(2, '0')}`;
  const endTime = `${Math.floor(endMinutes / 60)}:${(endMinutes % 60).toString().padStart(2, '0')}`;
  
  console.log(`Selected: ${startTime} - ${endTime}`);
};
```

## Implementation Details

### Key Files Modified

1. **`types/index.ts`** - Added `selectionGranularity` prop
2. **`hooks/useTimelineCalculations.ts`** - Added selection slot calculations
3. **`hooks/useTimelineGestures.ts`** - Updated gesture handling for granular selection
4. **`components/DragSelectionOverlay.tsx`** - Updated overlay positioning
5. **`components/ResourceColumn.tsx`** - Updated to pass selection height
6. **`MultiResourceTimeline.tsx`** - Integrated all changes

### Test Coverage

The feature includes comprehensive test coverage:

- **Basic functionality tests** for various granularity configurations
- **Integration tests** for real-world scenarios
- **Performance tests** for large time ranges
- **Edge case tests** for boundary conditions

## Migration Guide

### For Existing Users

No changes required - the component remains fully backward compatible.

### For New Features

Simply add the `selectionGranularity` prop to enable fine-grained selection:

```tsx
// Before
<MultiResourceTimeline
  timeSlotInterval={60}
  // ... other props
/>

// After (with enhanced selection)
<MultiResourceTimeline
  timeSlotInterval={60}
  selectionGranularity={15}  // <- Add this line
  // ... other props
/>
```

## Examples

See `example/app/granularity-demo.tsx` for a complete working example with interactive granularity controls.