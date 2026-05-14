import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import { AlarmTime } from '../constants/types';

interface AlarmTimePickerProps {
  currentTime: AlarmTime | null;
  onSave: (time: AlarmTime) => void;
}

export function AlarmTimePicker({ currentTime, onSave }: AlarmTimePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(currentTime?.hour ?? 7);
  const [selectedMinute, setSelectedMinute] = useState(currentTime?.minute ?? 0);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const formatHour = (h: number) => {
    const period = h < 12 ? 'AM' : 'PM';
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${display} ${period}`;
  };

  const handleSave = () => {
    onSave({ hour: selectedHour, minute: selectedMinute });
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setModalVisible(true)}>
        <Text style={styles.label}>Set Alarm Time</Text>
        {currentTime && (
          <Text style={styles.currentTime}>{formatHour(currentTime.hour)} : {String(currentTime.minute).padStart(2, '0')}</Text>
        )}
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Pick Alarm Time</Text>
            <View style={styles.pickerRow}>
              {/* Hour picker */}
              <View style={styles.column}>
                <Text style={styles.columnLabel}>Hour</Text>
                <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                  {hours.map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.item, selectedHour === h && styles.selectedItem]}
                      onPress={() => setSelectedHour(h)}
                    >
                      <Text style={[styles.itemText, selectedHour === h && styles.selectedText]}>
                        {formatHour(h)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Minute picker */}
              <View style={styles.column}>
                <Text style={styles.columnLabel}>Minute</Text>
                <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                  {minutes.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.item, selectedMinute === m && styles.selectedItem]}
                      onPress={() => setSelectedMinute(m)}
                    >
                      <Text style={[styles.itemText, selectedMinute === m && styles.selectedText]}>
                        {String(m).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Set Alarm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: '#1e3a5f',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    color: '#8ab4d4',
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  currentTime: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0f2744',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  sheetTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    color: '#8ab4d4',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  scroll: {
    height: 200,
    width: '100%',
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginVertical: 2,
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: '#1a6dbb',
  },
  itemText: {
    color: '#8ab4d4',
    fontSize: 16,
  },
  selectedText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1a6dbb',
    alignItems: 'center',
  },
  cancelText: {
    color: '#8ab4d4',
    fontSize: 16,
    fontWeight: '500',
  },
  saveBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#1a6dbb',
    alignItems: 'center',
  },
  saveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
