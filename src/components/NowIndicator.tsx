import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { createTimelineStyles } from '../styles/timelineStyles';
import { TimelineTheme } from '../types';

interface NowIndicatorProps {
  position: number;
  timeString: string;
  scrollViewWidth: number;
  theme: TimelineTheme;
}

const NowIndicator = memo<NowIndicatorProps>(({ 
  position, 
  timeString, 
  scrollViewWidth, 
  theme 
}) => {
  const styles = createTimelineStyles(theme);

  return (
    <View 
      style={[
        styles.nowIndicator,
        { top: position }
      ]}
      pointerEvents="none"
    >
      {/* Time label */}
      <View style={styles.nowIndicatorTimeContainer}>
        <Text style={styles.nowIndicatorTimeText}>
          {timeString}
        </Text>
      </View>

      {/* Dot */}
      <View style={styles.nowIndicatorDot} />

      {/* Line */}
      <View 
        style={[
          styles.nowIndicatorLine,
          { width: scrollViewWidth }
        ]} 
      />
    </View>
  );
});

NowIndicator.displayName = 'NowIndicator';

export default NowIndicator;
