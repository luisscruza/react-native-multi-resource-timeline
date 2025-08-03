import React from 'react';
import { MultiResourceTimelineProps } from '../types';

describe('Backward Compatibility', () => {
  describe('renderResourceHeader prop', () => {
    it('should be optional in MultiResourceTimelineProps', () => {
      // This test ensures that renderResourceHeader is optional
      const propsWithoutCustomHeader: MultiResourceTimelineProps = {
        events: [],
        resources: [
          {
            id: 'test1',
            name: 'Test Resource',
            color: '#2196F3',
          }
        ],
        date: '2025-07-15',
        // renderResourceHeader is intentionally omitted to test it's optional
      };

      // If this compiles without errors, the prop is correctly optional
      expect(propsWithoutCustomHeader.renderResourceHeader).toBeUndefined();
    });

    it('should accept custom renderResourceHeader prop when provided', () => {
      const customRenderer = ({ resource }: any) => 
        React.createElement('div', {}, resource.name);

      const propsWithCustomHeader: MultiResourceTimelineProps = {
        events: [],
        resources: [
          {
            id: 'test1',
            name: 'Test Resource',
            color: '#2196F3',
          }
        ],
        date: '2025-07-15',
        renderResourceHeader: customRenderer,
      };

      expect(propsWithCustomHeader.renderResourceHeader).toBe(customRenderer);
    });

    it('should maintain all existing props when renderResourceHeader is added', () => {
      const customRenderer = ({ resource }: any) => 
        React.createElement('div', {}, resource.name);

      // Verify that all original props still work alongside the new prop
      const fullProps: MultiResourceTimelineProps = {
        events: [],
        resources: [
          {
            id: 'test1',
            name: 'Test Resource',
            color: '#2196F3',
          }
        ],
        date: '2025-07-15',
        startHour: 8,
        endHour: 18,
        hourHeight: 80,
        eventMinHeight: 40,
        showNowIndicator: true,
        format24h: true,
        timeSlotInterval: 60,
        resourcesPerPage: 3,
        theme: 'light',
        enableHaptics: true,
        showWorkingHoursBackground: true,
        clearSelectionAfterDrag: true,
        enableSingleTapSelection: false,
        isLoading: false,
        renderResourceHeader: customRenderer, // New prop
        onEventPress: () => {},
        onTimeSlotSelect: () => {},
        onLoadingChange: () => {},
        onError: () => {},
      };

      expect(fullProps.renderResourceHeader).toBe(customRenderer);
      expect(fullProps.startHour).toBe(8);
      expect(fullProps.theme).toBe('light');
      expect(fullProps.enableHaptics).toBe(true);
    });
  });
});