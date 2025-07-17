import React, { memo } from 'react';
import { Image, Text, View } from 'react-native';
import { createTimelineStyles } from '../styles/timelineStyles';
import { Resource, TimelineTheme } from '../types';

interface ResourceHeaderProps {
  resource: Resource;
  index: number;
  width: number;
  theme: TimelineTheme;
}

const ResourceHeader = memo<ResourceHeaderProps>(({ 
  resource, 
  index, 
  width, 
  theme 
}) => {
  const styles = createTimelineStyles(theme);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <View 
      style={[
        styles.resourceHeader, 
        { 
          width,
          backgroundColor: theme.colors.background,
          borderRightColor: theme.colors.border,
        }
      ]}
      accessibilityRole="header"
      accessibilityLabel={`Resource column for ${resource.name}`}
    >
      <View 
        style={[
          styles.avatarContainer, 
          { borderColor: resource.color }
        ]}
      >
        {resource.avatar ? (
          <View style={[styles.avatarPlaceholder, { backgroundColor: resource.color }]}>
              <Image
                source={{ uri: resource.avatar }} 
                style={styles.avatar}
                accessibilityLabel={`${resource.name} avatar`}
              />
          </View>
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: resource.color }]}>
            <Text style={styles.avatarText}>
              {getInitials(resource.name)}
            </Text>
          </View>
        )}
      </View>
      <Text 
        style={[styles.resourceName, { color: theme.colors.text.primary }]} 
        numberOfLines={2}
      >
        {resource.name}
      </Text>
    </View>
  );
});

ResourceHeader.displayName = 'ResourceHeader';

export default ResourceHeader;
