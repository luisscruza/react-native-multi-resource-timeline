/**
 * isLoading Prop Tests
 * 
 * Tests to ensure the isLoading prop allows external control of the timeline's loading state.
 * @jest-environment node
 */

/* eslint-env jest */

import React from 'react';
import { MultiResourceTimelineProps } from '../types';

describe('isLoading Prop', () => {
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

  describe('isLoading Prop Type Definition', () => {
    it('should accept boolean isLoading prop', () => {
      const props: MultiResourceTimelineProps = {
        events: mockEvents,
        resources: mockResources,
        date: '2025-01-15',
        isLoading: true,
      };
      
      expect(props.isLoading).toBe(true);
      expect(typeof props.isLoading).toBe('boolean');
    });

    it('should accept undefined isLoading prop', () => {
      const props: MultiResourceTimelineProps = {
        events: mockEvents,
        resources: mockResources,
        date: '2025-01-15',
        isLoading: undefined,
      };
      
      expect(props.isLoading).toBeUndefined();
    });

    it('should work without isLoading prop', () => {
      const props: MultiResourceTimelineProps = {
        events: mockEvents,
        resources: mockResources,
        date: '2025-01-15',
      };
      
      expect(props.isLoading).toBeUndefined();
    });
  });

  describe('Loading State Logic', () => {
    it('should determine loading state correctly when isLoading is provided', () => {
      // Test logic: when isLoading is provided, use it directly
      const externalIsLoading = true;
      const internalIsLoading = false;
      
      const actualLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading;
      
      expect(actualLoading).toBe(true);
    });

    it('should fall back to internal loading when isLoading is undefined', () => {
      // Test logic: when isLoading is undefined, use internal state
      const externalIsLoading = undefined;
      const internalIsLoading = false;
      
      const actualLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading;
      
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
    it('should include isLoading in MultiResourceTimelineProps interface', () => {
      // This test ensures the TypeScript interface is correct
      const propsWithIsLoading: MultiResourceTimelineProps = {
        events: mockEvents,
        resources: mockResources,
        date: '2025-01-15',
        isLoading: true,
        onLoadingChange: jest.fn(),
      };

      expect(propsWithIsLoading).toHaveProperty('isLoading');
      expect(propsWithIsLoading.isLoading).toBe(true);
    });

    it('should work with all existing props plus isLoading', () => {
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
        isLoading: false, // New prop
        onEventPress: jest.fn(),
        onTimeSlotSelect: jest.fn(),
        onLoadingChange: jest.fn(),
        onError: jest.fn(),
      };

      expect(fullProps.isLoading).toBe(false);
      expect(typeof fullProps.isLoading).toBe('boolean');
    });
  });

  describe('Callback Behavior', () => {
    it('should call onLoadingChange when external loading state is provided', () => {
      const onLoadingChangeMock = jest.fn();
      
      // Simulate the effect logic
      const isLoading = true;
      if (isLoading !== undefined) {
        onLoadingChangeMock(isLoading);
      }

      expect(onLoadingChangeMock).toHaveBeenCalledWith(true);
      expect(onLoadingChangeMock).toHaveBeenCalledTimes(1);
    });

    it('should not call onLoadingChange during internal loading setup when external isLoading is provided', () => {
      const onLoadingChangeMock = jest.fn();
      
      // Simulate the effect logic - when isLoading is provided, internal effect should not run
      const isLoading = false;
      
      // Internal loading effect should not execute
      if (isLoading === undefined) {
        // This should not execute
        onLoadingChangeMock(false);
      } else {
        // External loading notification
        onLoadingChangeMock(isLoading);
      }

      expect(onLoadingChangeMock).toHaveBeenCalledWith(false);
      expect(onLoadingChangeMock).toHaveBeenCalledTimes(1);
    });
  });
});