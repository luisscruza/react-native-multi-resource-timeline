// Basic event interface that extends what we need from TimelineEventProps
export interface TimelineEventProps {
  start: string;
  end: string;
  title: string;
}

// Event status enum
export enum EventStatus {
  CONFIRMED = 'confirmed',
  RESERVED = 'reserved',
  CANCELLED_BY_CLIENT = 'cancelled_by_client',
  CANCELLED_BY_BUSINESS = 'cancelled_by_business',
  COMPLETED = 'completed'
}

// Status color mapping
export const StatusColors = {
  [EventStatus.CONFIRMED]: '#4CAF50', // green
  [EventStatus.RESERVED]: '#2196F3', // blue
  [EventStatus.CANCELLED_BY_CLIENT]: '#F44336', // red
  [EventStatus.CANCELLED_BY_BUSINESS]: '#9C27B0', // purple
  [EventStatus.COMPLETED]: '#4CAF50', // green
};

// Multi-resource event interface (standalone, no external dependencies)
export interface MultiResourceEvent extends TimelineEventProps {
  id: string;
  resourceId: string;
  status?: EventStatus;
  client?: string;
  service?: string;
}

// Working hours type - stores time ranges per date
export interface WorkingHours {
  [date: string]: string[]; // e.g., "2025-07-15": ["09:00-13:00", "16:30-21:00"]
}

// Working hours style configuration
export interface WorkingHoursStyle {
  workingBackground?: string;
  nonWorkingBackground?: string;
  workingOpacity?: number;
  nonWorkingOpacity?: number;
}

// Timeline component types
export interface Resource {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  workingHours?: WorkingHours;
}

export interface TimeSlot {
  hours: number;
  minutes: number;
  index: number;
}

export interface EventPosition {
  top: number;
  height: number;
  leftOffset: string;
  rightOffset: string;
  eventWidth: string;
}

export interface DragSelection {
  resourceId: string;
  startSlot: number;
  endSlot: number;
}

export interface DragSelectionOverlayStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

export interface MultiResourceTimelineRef {
  clearSelection: () => void;
  clearDragSelection: () => void;
  scrollToTime: (hour: number) => void;
  scrollToResource: (resourceId: string) => void;
}

export interface MultiResourceTimelineProps {
  events: MultiResourceEvent[];
  resources: Resource[];
  date: string;
  startHour?: number;
  endHour?: number;
  hourHeight?: number;
  eventMinHeight?: number;
  showNowIndicator?: boolean;
  format24h?: boolean;
  timeSlotInterval?: number;
  resourcesPerPage?: number;
  theme?: 'light' | 'dark';
  enableHaptics?: boolean;
  showWorkingHoursBackground?: boolean;
  workingHoursStyle?: WorkingHoursStyle;
  clearSelectionAfterDrag?: boolean;
  dragSelectionOverlayStyle?: DragSelectionOverlayStyle;
  enableSingleTapSelection?: boolean;
  isLoading?: boolean;
  onEventPress?: (event: MultiResourceEvent) => void;
  onTimeSlotSelect?: (resourceId: string, startSlot: number, endSlot: number) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onError?: (error: Error) => void;
}

export interface TimelineTheme {
  colors: {
    background: string;
    surface: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
      accent: string;
    };
    selection: {
      background: string;
      border: string;
    };
    nowIndicator: string;
    workingHours: {
      working: string;
      nonWorking: string;
    };
    shadows: {
      color: string;
      opacity: number;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
    };
    lineHeight: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
    };
  };
  animation: {
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
    easing: {
      ease: any;
      spring: any;
    };
  };
}
