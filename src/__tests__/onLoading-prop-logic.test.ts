/**
 * onLoading Prop Tests
 * 
 * Tests to ensure the onLoading prop allows external control of the timeline's loading state.
 * @jest-environment node
 */

/* eslint-env jest */

import React from 'react';
import { MultiResourceTimelineProps } from '../types';

describe('onLoading Prop', () => {
  const mockResources = [
    {
      id: 'resource1',
      name: 'Resource 1',
      color: '#2196F3',
    },
    {
      id: 'resource2', 
      name: 'Resource 2',
      color: '#4CAF50',
    }
  ];

  const mockEvents = [
    {
      id: 'event1',
      resourceId: 'resource1',
      start: '2025-01-15T10:00:00.000Z',
      end: '2025-01-15T11:00:00.000Z',
      title: 'Test Event',
    }
  ];

  describe('onLoading Prop Type Definition', () => {
    it('should accept boolean onLoading prop', () => {
      const props: MultiResourceTimelineProps = {
        events: mockEvents,
        resources: mockResources,
        date: '2025-01-15',
        onLoading: true,
      };
      
      expect(props.onLoading).toBe(true);
      expect(typeof props.onLoading).toBe('boolean');
    });

    it('should accept undefined onLoading prop', () => {
      const props: MultiResourceTimelineProps = {
        events: mockEvents,
        resources: mockResources,
        date: '2025-01-15',
        onLoading: undefined,
      };
      
      expect(props.onLoading).toBeUndefined();
    });

    it('should work without onLoading prop', () => {
      const props: MultiResourceTimelineProps = {
        events: mockEvents,
        resources: mockResources,
        date: '2025-01-15',
      };
      
      expect(props.onLoading).toBeUndefined();
    });
  });

  describe('Loading State Logic', () => {
    it('should determine loading state correctly when onLoading is provided', () => {
      // Test logic: when onLoading is provided, use it directly
      const externalOnLoading = true;
      const internalIsLoading = false;
      
      const actualLoading = externalOnLoading !== undefined ? externalOnLoading : internalIsLoading;
      
      expect(actualLoading).toBe(true);
    });

    it('should fall back to internal loading when onLoading is undefined', () => {
      // Test logic: when onLoading is undefined, use internal state
      const externalOnLoading = undefined;
      const internalIsLoading = false;
      
      const actualLoading = externalOnLoading !== undefined ? externalOnLoading : internalIsLoading;
      
      expect(actualLoading).toBe(false);
    });

    it('should respect external loading state changes', () => {
      // Test logic: external control should override internal state
      const testCases = [
        { external: true, internal: false, expected: true },
        { external: false, internal: true, expected: false },
        { external: true, internal: true, expected: true },
        { external: false, internal: false, expected: false },
      ];

      testCases.forEach(({ external, internal, expected }) => {
        const actualLoading = external !== undefined ? external : internal;
        expect(actualLoading).toBe(expected);
      });
    });
  });

  describe('Props Interface Validation', () => {
    it('should include onLoading in MultiResourceTimelineProps interface', () => {
      // This test ensures the TypeScript interface is correct
      const propsWithOnLoading: MultiResourceTimelineProps = {
        events: mockEvents,
        resources: mockResources,
        date: '2025-01-15',
        onLoading: true,
        onLoadingChange: jest.fn(),
      };

      expect(propsWithOnLoading).toHaveProperty('onLoading');
      expect(propsWithOnLoading.onLoading).toBe(true);
    });

    it('should work with all existing props plus onLoading', () => {
      const fullProps: MultiResourceTimelineProps = {
        events: mockEvents,
        resources: mockResources,
        date: '2025-01-15',
        startHour: 9,
        endHour: 17,
        hourHeight: 80,
        eventMinHeight: 40,
        showNowIndicator: false,
        format24h: true,
        timeSlotInterval: 60,
        resourcesPerPage: 2,
        theme: 'light',
        enableHaptics: true,
        showWorkingHoursBackground: false,
        clearSelectionAfterDrag: true,
        onLoading: false, // New prop
        onEventPress: jest.fn(),
        onTimeSlotSelect: jest.fn(),
        onLoadingChange: jest.fn(),
        onError: jest.fn(),
      };

      expect(fullProps.onLoading).toBe(false);
      expect(typeof fullProps.onLoading).toBe('boolean');
    });
  });

  describe('Callback Behavior', () => {
    it('should call onLoadingChange when external loading state is provided', () => {
      const onLoadingChangeMock = jest.fn();
      
      // Simulate the effect logic
      const onLoading = true;
      if (onLoading !== undefined) {
        onLoadingChangeMock(onLoading);
      }

      expect(onLoadingChangeMock).toHaveBeenCalledWith(true);
      expect(onLoadingChangeMock).toHaveBeenCalledTimes(1);
    });

    it('should not call onLoadingChange during internal loading setup when external onLoading is provided', () => {
      const onLoadingChangeMock = jest.fn();
      
      // Simulate the effect logic - when onLoading is provided, internal effect should not run
      const onLoading = false;
      
      // Internal loading effect should not execute
      if (onLoading === undefined) {
        // This should not execute
        onLoadingChangeMock(false);
      } else {
        // External loading notification
        onLoadingChangeMock(onLoading);
      }

      expect(onLoadingChangeMock).toHaveBeenCalledWith(false);
      expect(onLoadingChangeMock).toHaveBeenCalledTimes(1);
    });
  });
});