import React from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { createTimelineStyles } from '../styles/timelineStyles';
import { TimelineTheme } from '../types';

interface SkeletonLoaderProps {
  theme: TimelineTheme;
  resourceCount?: number;
  timeSlotCount?: number;
  eventCount?: number;
}

const { width } = Dimensions.get('window');

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  theme,
  resourceCount = 4,
  timeSlotCount = 20,
  eventCount = 8,
}) => {
  const styles = createTimelineStyles(theme);

  // Shimmer animation
  const shimmerStyle = useAnimatedStyle(() => {
    return {
      opacity: withRepeat(
        withSequence(
          withTiming(0.3, { duration: 1000, easing: Easing.ease }),
          withTiming(0.7, { duration: 1000, easing: Easing.ease })
        ),
        -1,
        true
      ),
    };
  });

  // Staggered animation for different elements
  const createStaggeredStyle = (delay: number) =>
    useAnimatedStyle(() => {
      return {
        opacity: withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(0.3, { duration: 800, easing: Easing.ease }),
              withTiming(0.8, { duration: 800, easing: Easing.ease })
            ),
            -1,
            true
          )
        ),
      };
    });

  const SkeletonBox = ({ 
    width: boxWidth, 
    height, 
    style, 
    delay = 0 
  }: { 
    width: number; 
    height: number; 
    style?: any; 
    delay?: number;
  }) => (
    <Animated.View
      style={[
        {
          width: boxWidth,
          height,
          backgroundColor: theme.colors.border,
          borderRadius: 6,
        },
        style,
        createStaggeredStyle(delay),
      ]}
    />
  );

  return (
    <View style={styles.container} testID="skeleton-loader">
      {/* Header skeleton */}
      <View style={styles.headerRow}>
        <View style={styles.timeHeaderSpace}>
          <SkeletonBox width={50} height={20} style={{ alignSelf: 'center' }} />
        </View>
        
        <View style={{ flexDirection: 'row', flex: 1 }}>
          {Array.from({ length: resourceCount }).map((_, index) => (
            <View key={index} style={[styles.resourceHeader, { flex: 1 }]}>
              <SkeletonBox 
                width={40} 
                height={40} 
                style={{ borderRadius: 20, marginBottom: 8 }} 
                delay={index * 100}
              />
              <SkeletonBox 
                width={60} 
                height={12} 
                delay={index * 100 + 50}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Timeline content skeleton */}
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Time column skeleton */}
        <View style={styles.timeColumn}>
          {Array.from({ length: timeSlotCount }).map((_, index) => (
            <View
              key={index}
              style={{
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 8,
              }}
            >
              {index % 2 === 0 && (
                <SkeletonBox 
                  width={35} 
                  height={10} 
                  delay={index * 50}
                />
              )}
            </View>
          ))}
        </View>

        {/* Resource columns skeleton */}
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {Array.from({ length: resourceCount }).map((_, resourceIndex) => (
            <View key={resourceIndex} style={{ flex: 1, position: 'relative' }}>
              {/* Time slots background */}
              {Array.from({ length: timeSlotCount }).map((_, slotIndex) => (
                <View
                  key={slotIndex}
                  style={{
                    height: 40,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                    opacity: 0.3,
                  }}
                />
              ))}

              {/* Event skeletons */}
              {Array.from({ length: Math.floor(eventCount / resourceCount) }).map((_, eventIndex) => {
                const randomHeight = 60 + (eventIndex * 20);
                const randomTop = (eventIndex * 120) + (resourceIndex * 30);
                
                return (
                  <SkeletonBox
                    key={eventIndex}
                    width={0} // Will be set by position absolute
                    height={randomHeight}
                    style={{
                      position: 'absolute',
                      top: randomTop,
                      left: 4,
                      right: 4,
                      borderRadius: 8,
                    }}
                    delay={resourceIndex * 200 + eventIndex * 150}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* Loading overlay */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            height: 40,
            backgroundColor: theme.colors.surface,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 16,
            ...theme.colors.shadows,
          },
          shimmerStyle,
        ]}
      >
        <SkeletonBox width={100} height={16} delay={500} />
      </Animated.View>
    </View>
  );
};

export default SkeletonLoader;
