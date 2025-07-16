# Performance Improvements

This document outlines the performance optimizations implemented to improve rendering performance when working with multiple resource columns (6+ employees).

## Key Optimizations

### 1. ResourceColumn Animated Styles Optimization
**Problem**: Previously, each ResourceColumn created animated styles for every time slot (e.g., 6 columns × 96 time slots = 576 animated styles per render).

**Solution**: 
- Replaced per-slot animated style creation with a shared state approach
- Uses `useSharedValue` and a single `getSlotAnimatedStyle` function
- Reduces memory usage and improves render performance

### 2. Improved Component Memoization
**Problem**: ResourceColumn components were re-rendering unnecessarily due to inefficient dependency tracking.

**Solution**:
- Added custom `arePropsEqual` comparison function for `React.memo`
- Deep comparison of resource events and selection state
- Prevents unnecessary re-renders when props haven't meaningfully changed

### 3. Optimized Virtual Scrolling Thresholds
**Problem**: Virtual scrolling was only enabled with 100+ events, causing performance issues with fewer events but many columns.

**Solution**:
- Lowered threshold to 50 events for general cases
- Enables virtual scrolling with 20+ events when there are 4+ columns
- Specifically addresses the 6-employee scenario

### 4. Enhanced Event Filtering
**Problem**: Event filtering was happening on every render without proper optimization.

**Solution**:
- Better memoization of resource-specific event filtering
- Reduced unnecessary computations during renders

### 5. Memory Leak Prevention
**Problem**: Potential memory leaks from uncleared timers and excessive animated value updates.

**Solution**:
- Added proper cleanup in useEffect hooks with mounted flags
- Debounced state updates to prevent excessive re-renders
- Batched animated value updates with frame-based delays

### 6. Gesture Performance Optimization
**Problem**: Zoom gestures were triggering excessive worklet calls, causing performance degradation.

**Solution**:
- Added throttling to zoom updates (~30fps instead of unlimited)
- Reduced JavaScript bridge calls during gesture handling
- Optimized pinch gesture direction detection

## Performance Metrics

These optimizations specifically target the reported issue of "Working with 6 employees (6 column) feels slow in the iOS simulator".

### Before Optimization
- 6 columns × 96 time slots × 2 style types = 1,152+ animated styles per render
- Frequent unnecessary re-renders of all columns
- Virtual scrolling not activated for typical multi-column scenarios

### After Optimization
- Shared animated state with minimal style objects
- Intelligent memoization preventing unnecessary re-renders  
- Virtual scrolling activated for 6-column scenarios with 20+ events
- Throttled gesture handling reducing JavaScript bridge calls
- Memory leak prevention with proper cleanup patterns
- Reduced memory allocations and improved scroll performance

## Usage

The optimizations are automatic and don't require any API changes. The component will automatically:

- Enable virtual scrolling for scenarios with multiple columns and moderate event counts
- Use optimized rendering for time slots and events
- Prevent unnecessary re-renders through improved memoization
- Throttle gesture updates to prevent performance degradation
- Automatically clean up resources to prevent memory leaks

## Testing

Performance optimizations are validated through automated tests in `src/__tests__/performance.test.ts` which verify:

- Virtual scrolling thresholds work correctly for multi-column scenarios
- Performance constants are configured appropriately
- 6-employee scenarios trigger optimized rendering paths