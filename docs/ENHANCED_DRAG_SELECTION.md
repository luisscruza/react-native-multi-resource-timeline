# Enhanced Drag Selection UX

The React Native Multi Resource Timeline now features an enhanced drag selection user experience that addresses visual gaps between selected slots and provides better control over selection persistence.

## Features

### 1. Merged Selection Highlight

**Before**: Individual slots were highlighted with dotted borders, creating visual gaps between selected time slots.

**After**: Selected time slots are now highlighted with a seamless merged overlay that spans the entire selection range without gaps.

![Enhanced Selection](https://github.com/user-attachments/assets/07976b63-0df4-462b-b6fe-4f49f2b290ac)

### 2. Auto-Clear Selection

**Default Behavior**: Visual selection automatically clears after drag completion and the `onTimeSlotSelect` callback is triggered.

**Configurable**: Use the `clearSelectionAfterDrag` prop to control this behavior.

### 3. Programmatic Control

Access to manual selection clearing through the component ref.

## API Changes

### New Props

#### `clearSelectionAfterDrag?: boolean`

Controls whether the visual selection is automatically cleared after drag completion.

- **Default**: `true`
- **Type**: `boolean`
- **Usage**: 
  ```tsx
  <MultiResourceTimeline
    clearSelectionAfterDrag={false} // Keep selection visible
    // ... other props
  />
  ```

### New Ref Methods

#### `clearDragSelection(): void`

Programmatically clears the current drag selection.

```tsx
const timelineRef = useRef<MultiResourceTimelineRef>(null);

const handleClearSelection = () => {
  timelineRef.current?.clearDragSelection();
};
```

## Usage Examples

### Default Behavior (Auto-Clear)

```tsx
import { MultiResourceTimeline } from 'react-native-multi-resource-timeline';

function MyTimeline() {
  const handleTimeSlotSelect = (resourceId: string, startSlot: number, endSlot: number) => {
    console.log('Selected:', { resourceId, startSlot, endSlot });
    // Selection will auto-clear after this callback
  };

  return (
    <MultiResourceTimeline
      resources={resources}
      events={events}
      date="2025-07-15"
      onTimeSlotSelect={handleTimeSlotSelect}
      // clearSelectionAfterDrag={true} is the default
    />
  );
}
```

### Retain Selection with Manual Control

```tsx
import { useRef } from 'react';
import { MultiResourceTimeline, MultiResourceTimelineRef } from 'react-native-multi-resource-timeline';

function MyTimeline() {
  const timelineRef = useRef<MultiResourceTimelineRef>(null);

  const handleTimeSlotSelect = (resourceId: string, startSlot: number, endSlot: number) => {
    console.log('Selected:', { resourceId, startSlot, endSlot });
    // Selection remains visible for further user interaction
  };

  const handleClearSelection = () => {
    timelineRef.current?.clearDragSelection();
  };

  return (
    <>
      <MultiResourceTimeline
        ref={timelineRef}
        resources={resources}
        events={events}
        date="2025-07-15"
        clearSelectionAfterDrag={false} // Keep selection visible
        onTimeSlotSelect={handleTimeSlotSelect}
      />
      <Button title="Clear Selection" onPress={handleClearSelection} />
    </>
  );
}
```

## Migration Guide

### Backward Compatibility

All existing code will continue to work without changes. The new behavior is:

1. **Visual Improvement**: Automatic - no code changes needed
2. **Auto-Clear**: Default behavior - provides better UX without code changes
3. **Manual Control**: Optional - only needed for custom selection management

### Migrating from v1.0.x

If you were relying on selection persistence after drag completion:

```tsx
// v1.0.x behavior (selection persisted)
<MultiResourceTimeline onTimeSlotSelect={handleSelect} />

// v1.1.x equivalent
<MultiResourceTimeline 
  clearSelectionAfterDrag={false}
  onTimeSlotSelect={handleSelect} 
/>
```

## Implementation Details

### Visual Changes

- **DragSelectionOverlay**: New component that renders a single merged highlight
- **Smooth Animations**: Uses React Native Reanimated for optimal performance
- **Accessibility**: Maintains proper accessibility labels for screen readers

### Performance Optimizations

- **Reduced Re-renders**: Individual slots no longer need to track drag state
- **Efficient Updates**: Single overlay component instead of multiple slot updates
- **Memory Usage**: Lower memory footprint for large datasets

## Styling

The merged selection uses the existing theme colors:

```typescript
const selectionStyle = {
  backgroundColor: '#E8F5E8', // Light green background
  borderColor: '#4CAF50',     // Green border
  borderWidth: 2,
  borderRadius: 4,
};
```

These colors can be customized through the existing theme system.

## Troubleshooting

### Selection Not Clearing

If selection doesn't auto-clear:
1. Verify `clearSelectionAfterDrag` prop is not set to `false`
2. Check that `onTimeSlotSelect` callback is provided
3. Ensure React Native Reanimated is properly configured

### Manual Clearing Not Working

If `clearDragSelection()` doesn't work:
1. Verify the ref is properly attached to the component
2. Check that the ref is accessed after component mount
3. Ensure TypeScript types are up to date

### Visual Issues

If selection appears broken:
1. Update to React Native Reanimated v3.0.0+
2. Verify React Native Gesture Handler v2.0.0+
3. Check for any custom styling conflicts