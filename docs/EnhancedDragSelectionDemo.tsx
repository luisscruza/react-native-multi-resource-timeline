/**
 * Enhanced Drag Selection UX Demo
 * 
 * This demo shows the new enhanced drag selection features:
 * 1. Merged selection highlight without gaps between slots
 * 2. Auto-clear selection after drag completion (default behavior)
 * 3. Optional programmatic control for retaining selection
 */

import React, { useRef, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MultiResourceTimeline, MultiResourceTimelineRef } from 'react-native-multi-resource-timeline';

const resources = [
  { id: 'doctor1', name: 'Dr. Smith', color: '#2196F3' },
  { id: 'doctor2', name: 'Dr. Johnson', color: '#4CAF50' },
];

const events = [
  {
    id: 'event1',
    resourceId: 'doctor1',
    start: '2025-07-15 10:00:00',
    end: '2025-07-15 11:00:00',
    title: 'John Doe',
  },
];

export default function EnhancedDragSelectionDemo() {
  const timelineRef = useRef<MultiResourceTimelineRef>(null);
  const [clearAfterDrag, setClearAfterDrag] = useState(true);
  const [selectedDate] = useState('2025-07-15');

  const handleTimeSlotSelect = (resourceId: string, startSlot: number, endSlot: number) => {
    console.log('✅ Time slot selected:', { resourceId, startSlot, endSlot });
    
    // Visual selection will auto-clear if clearAfterDrag=true (default)
    // or remain visible if clearAfterDrag=false
  };

  const handleClearSelection = () => {
    // Programmatically clear selection
    timelineRef.current?.clearDragSelection();
    console.log('🧹 Selection cleared programmatically');
  };

  const toggleClearAfterDrag = () => {
    setClearAfterDrag(!clearAfterDrag);
    console.log('⚙️ Clear after drag:', !clearAfterDrag);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Enhanced Drag Selection UX</Text>
        <Text style={styles.subtitle}>
          • Drag to select multiple time slots{'\n'}
          • Merged highlight without gaps{'\n'}
          • Auto-clear after selection (configurable)
        </Text>
        
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, clearAfterDrag ? styles.activeButton : styles.inactiveButton]}
            onPress={toggleClearAfterDrag}
          >
            <Text style={styles.buttonText}>
              Auto-clear: {clearAfterDrag ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={handleClearSelection}
          >
            <Text style={styles.buttonText}>Clear Selection</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.timeline}>
        <MultiResourceTimeline
          ref={timelineRef}
          resources={resources}
          events={events}
          date={selectedDate}
          startHour={8}
          endHour={18}
          hourHeight={60}
          theme="light"
          clearSelectionAfterDrag={clearAfterDrag} // New prop!
          onTimeSlotSelect={handleTimeSlotSelect}
          showWorkingHoursBackground={true}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  activeButton: {
    backgroundColor: '#4CAF50',
  },
  inactiveButton: {
    backgroundColor: '#ccc',
  },
  clearButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timeline: {
    flex: 1,
    margin: 16,
  },
});

/**
 * Usage Examples:
 * 
 * // Default behavior (auto-clear after drag)
 * <MultiResourceTimeline
 *   resources={resources}
 *   events={events}
 *   date="2025-07-15"
 *   onTimeSlotSelect={handleTimeSlotSelect}
 * />
 * 
 * // Keep selection visible after drag
 * <MultiResourceTimeline
 *   resources={resources}
 *   events={events}
 *   date="2025-07-15"
 *   clearSelectionAfterDrag={false}
 *   onTimeSlotSelect={handleTimeSlotSelect}
 * />
 * 
 * // Programmatic control
 * const timelineRef = useRef<MultiResourceTimelineRef>(null);
 * 
 * const clearSelection = () => {
 *   timelineRef.current?.clearDragSelection();
 * };
 */