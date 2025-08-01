import React from 'react';
import { Text, View } from 'react-native';
import { Resource, TimelineTheme, ResourceHeaderRenderer } from '../types';
import { lightTheme } from '../theme';

describe('Custom Resource Header', () => {
  const mockResource: Resource = {
    id: 'doctor1',
    name: 'Dr. Smith',
    color: '#2196F3',
    avatar: 'https://example.com/avatar.jpg',
  };

  const mockTheme: TimelineTheme = lightTheme;

  describe('ResourceHeaderRenderer type', () => {
    it('should accept a custom resource header renderer function', () => {
      const customRenderer: ResourceHeaderRenderer = ({ resource, index, width, theme }) => {
        return React.createElement(View, {}, [
          React.createElement(Text, { key: 'name' }, `Custom: ${resource.name}`),
          React.createElement(Text, { key: 'index' }, `Index: ${index}`),
        ]);
      };

      // Test that the renderer can be called with the expected props
      const result = customRenderer({
        resource: mockResource,
        index: 0,
        width: 120,
        theme: mockTheme,
      });

      expect(result).toBeDefined();
      expect(React.isValidElement(result)).toBe(true);
    });

    it('should allow access to all resource properties', () => {
      const customRenderer: ResourceHeaderRenderer = ({ resource }) => {
        // Verify all expected resource properties are accessible
        expect(resource.id).toBe('doctor1');
        expect(resource.name).toBe('Dr. Smith');
        expect(resource.color).toBe('#2196F3');
        expect(resource.avatar).toBe('https://example.com/avatar.jpg');

        return React.createElement(Text, {}, resource.name);
      };

      customRenderer({
        resource: mockResource,
        index: 0,
        width: 120,
        theme: mockTheme,
      });
    });

    it('should provide theme object for styling', () => {
      const customRenderer: ResourceHeaderRenderer = ({ theme }) => {
        // Verify theme object structure
        expect(theme.colors).toBeDefined();
        expect(theme.colors.background).toBeDefined();
        expect(theme.colors.text.primary).toBeDefined();
        expect(theme.spacing).toBeDefined();
        expect(theme.typography).toBeDefined();

        return React.createElement(Text, {}, 'Themed Header');
      };

      customRenderer({
        resource: mockResource,
        index: 0,
        width: 120,
        theme: mockTheme,
      });
    });

    it('should provide width and index parameters', () => {
      const customRenderer: ResourceHeaderRenderer = ({ index, width }) => {
        expect(typeof index).toBe('number');
        expect(typeof width).toBe('number');
        expect(index).toBeGreaterThanOrEqual(0);
        expect(width).toBeGreaterThan(0);

        return React.createElement(Text, {}, `${index}-${width}`);
      };

      customRenderer({
        resource: mockResource,
        index: 2,
        width: 150,
        theme: mockTheme,
      });
    });
  });

  describe('Type compatibility', () => {
    it('should be compatible with React component patterns', () => {
      // Test arrow function syntax
      const arrowRenderer: ResourceHeaderRenderer = ({ resource }) => 
        React.createElement(Text, {}, resource.name);

      // Test function declaration syntax
      const functionRenderer: ResourceHeaderRenderer = function({ resource }) {
        return React.createElement(View, {}, 
          React.createElement(Text, {}, resource.name)
        );
      };

      expect(arrowRenderer).toBeDefined();
      expect(functionRenderer).toBeDefined();
    });
  });
});