# Timeline Components Optimization

This document describes the optimizations made to `TimeColumn` and `ResourceColumn` components using `@shopify/flash-list` and React Native Reanimated shared values.

## Changes Made

### TimeColumn.tsx
- **FlashList Integration**: Replaced `.map()` with `FlashList` for virtualized rendering
- **Data Precomputation**: Time slot data is precomputed in `useMemo` to avoid recalculation
- **Stable Callbacks**: All FlashList callbacks (`renderItem`, `keyExtractor`, `getItemType`) are memoized with `useCallback`
- **O(1) Comparator**: Added efficient memo comparator that relies on referential equality
- **Style Memoization**: Timeline styles are memoized to prevent recreation

### ResourceColumn.tsx
- **FlashList for Slot Backgrounds**: Replaced absolutely positioned slot backgrounds with virtualized FlashList
- **Extracted Components**: Moved `SlotBackground` component outside render loop to prevent recreation
- **Shared Values Optimization**: Uses separate shared values for `baseOpacity`, `selectedSlot`, and `resourceSelected`
- **Efficient Animations**: Animations driven by shared values with proper timing and spring configurations
- **O(1) Comparator**: Simplified memo comparator that avoids filtering and deep comparisons
- **Memoized Theme Colors**: Theme colors extracted and memoized for stable references

## Parent Component Requirements

To achieve optimal performance, parent components must provide stable references:

### Required Stable References
```tsx
// ✅ Memoize these props:
const timeSlots = useMemo(() => generateTimeSlots(), [startHour, endHour, interval]);
const formatTimeSlot = useCallback((hours, minutes, format24h, showMinutes) => { /* ... */ }, []);
const theme = useMemo(() => createTheme(), [themeName]);
const events = useMemo(() => filterEvents(), [allEvents, filters]);

// ✅ For ResourceColumn, ideally pre-filter events per resource:
const eventsByResource = useMemo(() => {
  const map = new Map();
  events.forEach(event => {
    if (!map.has(event.resourceId)) map.set(event.resourceId, []);
    map.get(event.resourceId).push(event);
  });
  return map;
}, [events]);

// Then pass: events={eventsByResource.get(resource.id) || []}
```

### Fixed Height Requirement
- Ensure `slotHeight` is consistent and fixed for optimal virtualization
- If variable heights are needed in the future, remove FlashList optimizations

## Performance Benefits

1. **Memory Efficiency**: Virtualization reduces DOM nodes for large time ranges
2. **Animation Performance**: Shared values drive animations on the UI thread
3. **Render Optimization**: O(1) comparators prevent unnecessary re-renders
4. **Component Stability**: No component creation in render loops

## Testing

All existing tests pass, ensuring backward compatibility. The optimizations:
- Preserve accessibility labels and roles
- Maintain visual parity with previous implementation
- Keep all public props and behaviors intact
- Support smooth scrolling with 5-minute intervals over 24 hours (288 slots)