import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MultiResourceTimeline } from 'react-native-multi-resource-timeline';

// Example data
const resources = [
  {
    id: 'doctor1',
    name: 'Dr. Smith',
    color: '#2196F3',
    workingHours: {
      '2025-07-15': ['09:00-12:00', '14:00-18:00'],
    }
  },
  {
    id: 'doctor2', 
    name: 'Dr. Johnson',
    color: '#4CAF50',
    workingHours: {
      '2025-07-15': ['08:00-16:00'],
    }
  },
];

const events = [
  {
    id: 'event1',
    resourceId: 'doctor1',
    start: '2025-07-15 10:00:00',
    end: '2025-07-15 11:00:00',
    title: 'John Doe',
    service: 'General Consultation',
    client: 'John Doe'
  },
  {
    id: 'event2',
    resourceId: 'doctor1',
    start: '2025-07-15 14:30:00',
    end: '2025-07-15 15:30:00',
    title: 'Jane Smith',
    service: 'Follow-up',
    client: 'Jane Smith'
  },
];

export default function GranularityDemoScreen() {
  const [selectedDate] = useState('2025-07-15');
  const [selectionGranularity, setSelectionGranularity] = useState(15);
  const [lastSelection, setLastSelection] = useState<string>('');

  const handleEventPress = (event: any) => {
    console.log('Event pressed:', event);
  };

  const handleTimeSlotSelect = (resourceId: string, startSlot: number, endSlot: number) => {
    console.log('Time slot selected:', resourceId, startSlot, endSlot);
    
    // Calculate actual time based on selection granularity
    const startHour = 8; // Assuming timeline starts at 8 AM
    const startMinutes = startHour * 60 + startSlot * selectionGranularity;
    const endMinutes = startHour * 60 + (endSlot + 1) * selectionGranularity;
    
    const startTime = `${Math.floor(startMinutes / 60)}:${(startMinutes % 60).toString().padStart(2, '0')}`;
    const endTime = `${Math.floor(endMinutes / 60)}:${(endMinutes % 60).toString().padStart(2, '0')}`;
    
    setLastSelection(`${resourceId}: ${startTime} - ${endTime}`);
  };

  const granularityOptions = [
    { value: 5, label: '5 min' },
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 60, label: '60 min' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Selection Granularity Demo</Text>
        <Text style={styles.subtitle}>
          Slot size: 60 min | Selection granularity: {selectionGranularity} min
        </Text>
        <View style={styles.controls}>
          <Text style={styles.controlLabel}>Selection Granularity:</Text>
          <View style={styles.buttonGroup}>
            {granularityOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.granularityButton,
                  selectionGranularity === option.value && styles.activeButton
                ]}
                onPress={() => setSelectionGranularity(option.value)}
              >
                <Text style={[
                  styles.buttonText,
                  selectionGranularity === option.value && styles.activeButtonText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {lastSelection ? (
          <Text style={styles.selection}>Last selection: {lastSelection}</Text>
        ) : (
          <Text style={styles.selection}>Long press and drag to select time slots</Text>
        )}
      </View>
      <View style={styles.timeline}>
        <MultiResourceTimeline
          resources={resources}
          events={events}
          date={selectedDate}
          startHour={8}
          endHour={18}
          hourHeight={80}
          timeSlotInterval={60}
          selectionGranularity={selectionGranularity}
          showNowIndicator={true}
          showWorkingHoursBackground={true}
          enableHaptics={true}
          theme="light"
          onEventPress={handleEventPress}
          onTimeSlotSelect={handleTimeSlotSelect}
          workingHoursStyle={{
            workingBackground: 'rgba(76, 175, 80, 0.1)',
            nonWorkingBackground: 'rgba(158, 158, 158, 0.05)'
          }}
          dragSelectionOverlayStyle={{
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            borderColor: '#2196F3',
            borderWidth: 3,
            borderRadius: 8
          }}
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  controls: {
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  granularityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activeButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
  },
  activeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  selection: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  timeline: {
    flex: 1,
    margin: 10,
  },
});