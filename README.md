> [!NOTE]  
> This package is currently in progress and the API might change. Please don't use this.


# React Native Multi-Resource Timeline

A customizableulti-resource timeline component for React Native based on React Native Calendars by Wix.

## Features

- 🗓️ **Multi-resource timeline view** - Display events across multiple resources (people, rooms, equipment)
- 👆 **Advanced gesture support** - Pinch to zoom, drag to select time slots, smooth scrolling
- 🎨 **Customizable themes** - Light and dark themes with full customization options
- ⏰ **Working hours support** - Visual distinction between working and non-working hours
- 📱 **Haptic feedback** - Enhanced user experience with optional haptic feedback
- 🔧 **TypeScript support** - Full TypeScript definitions included
- 🚀 **Performance optimized** - Virtual scrolling for large datasets

## Installation

```bash
npm install react-native-multi-resource-timeline
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install react-native-gesture-handler react-native-reanimated react-native-calendars
```

For Expo projects, also install:
```bash
expo install expo-haptics
```

### Setup

#### React Native CLI

Follow the installation guides for:
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/installation)
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation)

#### Expo

```bash
npx expo install react-native-gesture-handler react-native-reanimated expo-haptics
```

## Basic Usage

```tsx
import React from 'react';
import { MultiResourceTimeline } from 'react-native-multi-resource-timeline';

const App = () => {
  const resources = [
    {
      id: 'resource1',
      name: 'Dr. Smith',
      color: '#2196F3',
      avatar: 'https://example.com/avatar1.jpg'
    },
    {
      id: 'resource2', 
      name: 'Dr. Johnson',
      color: '#4CAF50',
      avatar: 'https://example.com/avatar2.jpg'
    }
  ];

  const events = [
    {
      id: 'event1',
      resourceId: 'resource1',
      start: '2025-07-15 10:00:00',
      end: '2025-07-15 11:00:00',
      title: 'Consultation',
      service: 'General Checkup',
      client: 'John Doe'
    }
  ];

  return (
    <MultiResourceTimeline
      resources={resources}
      events={events}
      date="2025-07-15"
      startHour={8}
      endHour={18}
      onEventPress={(event) => console.log('Event pressed:', event)}
      onTimeSlotSelect={(resourceId, startSlot, endSlot) => 
        console.log('Time slot selected:', resourceId, startSlot, endSlot)
      }
    />
  );
};

export default App;
```

## API Reference

### Props

#### MultiResourceTimelineProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `events` | `MultiResourceEvent[]` | **required** | Array of events to display |
| `resources` | `Resource[]` | **required** | Array of resources (columns) |
| `date` | `string` | **required** | Date in YYYY-MM-DD format |
| `startHour` | `number` | `0` | Timeline start hour (0-23) |
| `endHour` | `number` | `24` | Timeline end hour (1-24) |
| `hourHeight` | `number` | `80` | Height of each hour in pixels |
| `eventMinHeight` | `number` | `40` | Minimum height for events |
| `showNowIndicator` | `boolean` | `false` | Show current time indicator |
| `format24h` | `boolean` | `true` | Use 24-hour time format |
| `timeSlotInterval` | `number` | `60` | Time slot interval in minutes |
| `resourcesPerPage` | `number` | `2` | Number of resources visible at once |
| `theme` | `'light' \\| 'dark'` | `'light'` | Color theme |
| `enableHaptics` | `boolean` | `true` | Enable haptic feedback |
| `showWorkingHoursBackground` | `boolean` | `false` | Show working hours background |
| `workingHoursStyle` | `WorkingHoursStyle` | `undefined` | Working hours styling |
| `onEventPress` | `(event: MultiResourceEvent) => void` | `undefined` | Event press handler |
| `onTimeSlotSelect` | `(resourceId: string, startSlot: number, endSlot: number) => void` | `undefined` | Time slot selection handler |
| `onLoadingChange` | `(isLoading: boolean) => void` | `undefined` | Loading state change handler |
| `onError` | `(error: Error) => void` | `undefined` | Error handler |

### Types

#### Resource
```tsx
interface Resource {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  workingHours?: WorkingHours;
}
```

#### MultiResourceEvent
```tsx
interface MultiResourceEvent {
  id: string;
  resourceId: string;
  start: string; // ISO date string
  end: string;   // ISO date string
  title: string;
  service?: string;
  client?: string;
  status?: EventStatus;
}
```

#### WorkingHours
```tsx
interface WorkingHours {
  [date: string]: string[]; // e.g., "2025-07-15": ["09:00-13:00", "16:30-21:00"]
}
```

## Advanced Usage

### Working Hours

```tsx
const resourceWithWorkingHours = {
  id: 'doctor1',
  name: 'Dr. Smith',
  color: '#2196F3',
  workingHours: {
    '2025-07-15': ['09:00-12:00', '14:00-18:00'],
    '2025-07-16': ['08:00-16:00']
  }
};

<MultiResourceTimeline
  resources={[resourceWithWorkingHours]}
  events={events}
  date="2025-07-15"
  showWorkingHoursBackground={true}
  workingHoursStyle={{
    workingBackground: 'rgba(76, 175, 80, 0.1)',
    nonWorkingBackground: 'rgba(158, 158, 158, 0.1)'
  }}
/>
```

### Custom Theme

```tsx
import { getTheme } from 'react-native-multi-resource-timeline';

const customTheme = {
  ...getTheme('light'),
  colors: {
    ...getTheme('light').colors,
    primary: '#6200ee',
    surface: '#f5f5f5'
  }
};
```

### Ref Methods

```tsx
const timelineRef = useRef<MultiResourceTimelineRef>(null);

// Clear current selection
timelineRef.current?.clearSelection();

// Scroll to specific time
timelineRef.current?.scrollToTime(14); // 2 PM

// Scroll to specific resource
timelineRef.current?.scrollToResource('resource1');
```

## Customization

### Event Status Colors

```tsx
import { EventStatus, StatusColors } from 'react-native-multi-resource-timeline';

const event = {
  id: 'event1',
  resourceId: 'resource1',
  start: '2025-07-15 10:00:00',
  end: '2025-07-15 11:00:00',
  title: 'Consultation',
  status: EventStatus.CONFIRMED, // Will use green color
  client: 'John Doe'
};
```

### Custom Styles

The component uses a theme system that allows deep customization of colors, spacing, typography, and animations.

## Performance

For large datasets (100+ events), the component automatically enables virtual scrolling to maintain smooth performance.

## Accessibility

The component includes:
- Screen reader support
- Minimum touch target sizes (44pt)
- High contrast mode support
- Keyboard navigation support

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes.

## Support

- 📱 React Native: >= 0.60.0
- 🍎 iOS: >= 11.0  
- 🤖 Android: >= API 21
- 🌐 Web: Supported via react-native-web

For issues and feature requests, please visit our [GitHub repository](https://github.com/yourusername/react-native-multi-resource-timeline).
