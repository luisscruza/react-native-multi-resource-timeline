/**
 * Single tap selection configuration tests
 * @jest-environment node
 */

/* eslint-env jest */

import { MultiResourceTimelineProps } from '../types';

describe('Single Tap Selection Configuration', () => {
  it('should have enableSingleTapSelection prop available in the interface', () => {
    const props: MultiResourceTimelineProps = {
      events: [],
      resources: [],
      date: '2025-01-01',
      enableSingleTapSelection: true,
    };
    
    expect(props.enableSingleTapSelection).toBe(true);
  });

  it('should allow enableSingleTapSelection to be undefined (default behavior)', () => {
    const props: MultiResourceTimelineProps = {
      events: [],
      resources: [],
      date: '2025-01-01',
    };
    
    expect(props.enableSingleTapSelection).toBeUndefined();
  });

  it('should allow enableSingleTapSelection to be false', () => {
    const props: MultiResourceTimelineProps = {
      events: [],
      resources: [],
      date: '2025-01-01',
      enableSingleTapSelection: false,
    };
    
    expect(props.enableSingleTapSelection).toBe(false);
  });

  it('should work with both enableSingleTapSelection and onTimeSlotSelect', () => {
    const mockOnTimeSlotSelect = jest.fn();
    const props: MultiResourceTimelineProps = {
      events: [],
      resources: [],
      date: '2025-01-01',
      enableSingleTapSelection: true,
      onTimeSlotSelect: mockOnTimeSlotSelect,
    };
    
    expect(props.enableSingleTapSelection).toBe(true);
    expect(props.onTimeSlotSelect).toBe(mockOnTimeSlotSelect);
  });

  it('should maintain backward compatibility with existing props', () => {
    const props: MultiResourceTimelineProps = {
      events: [],
      resources: [],
      date: '2025-01-01',
      startHour: 8,
      endHour: 18,
      hourHeight: 80,
      eventMinHeight: 40,
      showNowIndicator: true,
      format24h: true,
      timeSlotInterval: 30,
      resourcesPerPage: 3,
      theme: 'light',
      enableHaptics: true,
      showWorkingHoursBackground: true,
      clearSelectionAfterDrag: true,
      enableSingleTapSelection: true,
      onTimeSlotSelect: jest.fn(),
      onEventPress: jest.fn(),
      onLoadingChange: jest.fn(),
      onError: jest.fn(),
    };
    
    expect(props).toBeDefined();
    expect(props.enableSingleTapSelection).toBe(true);
    expect(typeof props.onTimeSlotSelect).toBe('function');
  });
});