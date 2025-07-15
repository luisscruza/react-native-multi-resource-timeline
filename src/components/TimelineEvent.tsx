import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { StatusColors } from '../types';
import { createEventStyles } from '../styles/eventStyles';
import { MultiResourceEvent } from '../types';



interface TimelineEventProps {
  event: MultiResourceEvent;
  position: {
    top: number;
    height: number;
    leftOffset: string;
    rightOffset: string;
    eventWidth: string;
  };
  styling: {
    isVeryShortEvent: boolean;
    isShortEvent: boolean;
    actualHeight: number;
    isNarrowDueToOverlap: boolean;
    dynamicPadding: number;
  };
  date: string;
  onPress?: (event: MultiResourceEvent) => void;
  theme: any;
}

const TimelineEvent = memo<TimelineEventProps>(({
  event,
  position,
  styling,
  date,
  onPress,
  theme,
}) => {
  const { top, height, leftOffset, eventWidth } = position;
  const { 
    isVeryShortEvent, 
    isShortEvent, 
    actualHeight, 
    isNarrowDueToOverlap, 
    dynamicPadding 
  } = styling;

  const styles = createEventStyles(theme);
  const borderColor = event.status ? StatusColors[event.status] : theme.colors.border;

  // Font sizes based on event size and overlap
  const titleFontSize = isVeryShortEvent 
    ? (isNarrowDueToOverlap ? 11 : 12) 
    : (isNarrowDueToOverlap ? 12 : 14);
  const serviceFontSize = isVeryShortEvent 
    ? (isNarrowDueToOverlap ? 9 : 10) 
    : (isShortEvent ? (isNarrowDueToOverlap ? 10 : 11) : (isNarrowDueToOverlap ? 11 : 12));
  const timeFontSize = isVeryShortEvent 
    ? (isNarrowDueToOverlap ? 8 : 9) 
    : (isNarrowDueToOverlap ? 9 : 10);

  // Show/hide elements based on size
  const showService = actualHeight >= 45 && !isNarrowDueToOverlap;
  const showTimeAtTop = isShortEvent || isNarrowDueToOverlap;
  const showTimeAtBottom = !isShortEvent && actualHeight >= 70 && !isNarrowDueToOverlap;

  const eventAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(1, { damping: 20, stiffness: 100 }) }],
      opacity: withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }),
    };
  });

  const styleAdjustments: any = {
    top,
    height: actualHeight,
    backgroundColor: theme.colors.surface,
    borderColor: borderColor,
    padding: dynamicPadding,
  };

  if (isNarrowDueToOverlap) {
    styleAdjustments.left = leftOffset;
    styleAdjustments.width = eventWidth;
    styleAdjustments.right = undefined;
  }

  return (
    <Animated.View
      style={[
        styles.event,
        styleAdjustments,
        eventAnimatedStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${event.client} - ${event.service} from ${event.start.split(' ')[1]} to ${event.end.split(' ')[1]}`}
    >
      <TouchableOpacity 
        onPress={() => onPress?.(event)}
        style={styles.eventTouchable}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityHint="Double tap to view event details"
      >
        <View style={[styles.eventDot, { backgroundColor: borderColor }]} />
        
        {showTimeAtTop && (
          <Text 
            style={[styles.eventTimeTop, { fontSize: timeFontSize }]} 
            numberOfLines={1}
            accessibilityLabel={`Time: ${event.start.split(' ')[1]} to ${event.end.split(' ')[1]}`}
          >
            {event.start.split(' ')[1].substring(0, 5)} - {event.end.split(' ')[1].substring(0, 5)}
          </Text>
        )}
        
        <Text 
          style={[
            styles.eventTitle, 
            { 
              fontSize: titleFontSize,
              marginTop: showTimeAtTop ? 1 : 4,
              marginBottom: showService ? 2 : 4,
              lineHeight: titleFontSize + 2,
              color: theme.colors.text.primary,
            }
          ]} 
          numberOfLines={1}
          ellipsizeMode="tail"
          accessibilityLabel={`Client: ${event.client}`}
        >
          {event.client}
        </Text>
        
        {showService && (
          <Text 
            style={[
              styles.eventService, 
              { 
                fontSize: serviceFontSize,
                lineHeight: serviceFontSize + 2,
                marginBottom: showTimeAtBottom ? 2 : 4,
                color: theme.colors.text.secondary,
              }
            ]} 
            numberOfLines={1}
            ellipsizeMode="tail"
            accessibilityLabel={`Service: ${event.service}`}
          >
            {event.service}
          </Text>
        )}
        
        {(isVeryShortEvent || isNarrowDueToOverlap) && !showService && !showTimeAtTop && (
          <Text 
            style={[
              styles.eventService, 
              { 
                fontSize: timeFontSize,
                color: theme.colors.text.accent,
                lineHeight: timeFontSize + 2,
              }
            ]} 
            numberOfLines={1}
            accessibilityLabel={`Time: ${event.start.split(' ')[1]} to ${event.end.split(' ')[1]}`}
          >
            {event.start.split(' ')[1].substring(0, 5)}-{event.end.split(' ')[1].substring(0, 5)}
          </Text>
        )}
        
        {showTimeAtBottom && (
          <Text 
            style={[
              styles.eventTime, 
              { 
                fontSize: serviceFontSize,
                lineHeight: serviceFontSize + 2,
                color: theme.colors.text.accent,
              }
            ]}
            numberOfLines={1}
            accessibilityLabel={`Time: ${event.start.split(' ')[1]} to ${event.end.split(' ')[1]}`}
          >
            {event.start.split(' ')[1].substring(0, 5)} - {event.end.split(' ')[1].substring(0, 5)}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

TimelineEvent.displayName = 'TimelineEvent';

export default TimelineEvent;
