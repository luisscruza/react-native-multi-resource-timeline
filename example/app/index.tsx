import { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
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
  {
    id: 'room1',
    name: 'Room A',
    color: '#FF9800',
    workingHours: {
      '2025-07-15': ['07:00-19:00'],
    }
  }
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
  {
    id: 'event3',
    resourceId: 'doctor2',
    start: '2025-07-15 09:00:00',
    end: '2025-07-15 10:30:00',
    title: 'Bob Wilson',
    service: 'Physical Therapy',
    client: 'Bob Wilson'
  }
];

export default function HomeScreen() {
  const [selectedDate] = useState('2025-07-15');

  const handleEventPress = (event: any) => {
    console.log('Event pressed:', event);
  };

  const handleTimeSlotSelect = (resourceId: string, startSlot: number, endSlot: number) => {
    console.log('Time slot selected:', resourceId, startSlot, endSlot);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.timeline}>
        <MultiResourceTimeline
          resources={resources}
          events={events}
          date={selectedDate}
          startHour={7}
          endHour={19}
          hourHeight={80}
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
  timeline: {
    flex: 1,
    margin: 10,
  },
});
