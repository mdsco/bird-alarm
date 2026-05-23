import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alarm, AmPm, DayOfWeek } from '../constants/types';
import { useAlarms } from '../hooks/useAlarms';
import { usePalette } from '../theme/ThemeContext';
import { FONTS } from '../theme/fonts';
import { TimePicker } from '../components/TimePicker';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

function defaultAlarm(): Alarm {
  return {
    id: `${Date.now()}`,
    hour: 7,
    minute: 0,
    ampm: 'AM',
    label: 'Wake up',
    repeat: [1, 2, 3, 4, 5],
    on: true,
  };
}

export default function EditAlarmScreen() {
  const router = useRouter();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { alarms, addAlarm, updateAlarm, deleteAlarm } = useAlarms();
  const { alarmId } = useLocalSearchParams<{ alarmId?: string }>();

  const existing = useMemo(
    () => (alarmId ? alarms.find((a) => a.id === alarmId) : undefined),
    [alarmId, alarms],
  );
  const isNew = !existing;

  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState<AmPm>('AM');
  const [label, setLabel] = useState('Wake up');
  const [repeat, setRepeat] = useState<DayOfWeek[]>([1, 2, 3, 4, 5]);

  // Hydrate state once the existing alarm has resolved from storage.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (hydrated) return;
    const source = existing ?? defaultAlarm();
    setHour(source.hour);
    setMinute(source.minute);
    setAmpm(source.ampm);
    setLabel(source.label);
    setRepeat(source.repeat);
    // If we're editing, wait until the alarm resolves; otherwise mark hydrated
    // immediately so the form is interactive.
    if (alarmId ? !!existing : true) setHydrated(true);
  }, [existing, alarmId, hydrated]);

  const toggleDay = (i: DayOfWeek) => {
    setRepeat((prev) =>
      prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i].sort((a, b) => a - b) as DayOfWeek[],
    );
  };

  const handleSave = async () => {
    const payload: Alarm = existing
      ? { ...existing, hour, minute, ampm, label, repeat }
      : { ...defaultAlarm(), hour, minute, ampm, label, repeat, on: true };
    try {
      if (existing) await updateAlarm(payload);
      else await addAlarm(payload);
      router.back();
    } catch (err) {
      Alert.alert('Save failed', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert('Delete this alarm?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteAlarm(existing.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <LinearGradient
        colors={palette.bgGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Text style={[styles.headerBtn, { color: palette.sub }]}>Cancel</Text>
            </Pressable>
            <Text
              style={[
                styles.headerTitle,
                { color: palette.sub, fontFamily: FONTS.monoMedium },
              ]}
            >
              {isNew ? 'New Alarm' : 'Edit Alarm'}
            </Text>
            <Pressable onPress={handleSave} hitSlop={10}>
              <Text
                style={[
                  styles.headerBtn,
                  { color: palette.accent, fontFamily: FONTS.bodyBold },
                ]}
              >
                Save
              </Text>
            </Pressable>
          </View>

          <TimePicker
            hour={hour}
            minute={minute}
            ampm={ampm}
            onChange={({ hour: h, minute: m, ampm: ap }) => {
              setHour(h);
              setMinute(m);
              setAmpm(ap);
            }}
          />

          <View style={styles.rows}>
            {/* Label */}
            <View style={[styles.row, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <Text style={[styles.rowTitle, { color: palette.sub }]}>LABEL</Text>
              <TextInput
                value={label}
                onChangeText={setLabel}
                placeholder="Wake up"
                placeholderTextColor={palette.sub}
                style={[styles.labelInput, { color: palette.text }]}
                returnKeyType="done"
              />
            </View>

            {/* Repeat */}
            <View
              style={[
                styles.rowStack,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <Text style={[styles.rowTitle, { color: palette.sub }]}>REPEAT</Text>
              <View style={styles.daysRow}>
                {DAY_LABELS.map((d, i) => {
                  const active = repeat.includes(i as DayOfWeek);
                  return (
                    <Pressable
                      key={i}
                      onPress={() => toggleDay(i as DayOfWeek)}
                      style={[
                        styles.dayBtn,
                        {
                          backgroundColor: active ? palette.accent : palette.surfaceSoft,
                          shadowColor: active ? palette.accent : 'transparent',
                          shadowOpacity: active ? 0.35 : 0,
                          shadowRadius: 6,
                          shadowOffset: { width: 0, height: 2 },
                          elevation: active ? 2 : 0,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayBtnText,
                          { color: active ? '#fff' : palette.sub },
                        ]}
                      >
                        {d}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {!isNew && (
              <Pressable onPress={handleDelete} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>Delete alarm</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, position: 'relative' },
  scrollContent: { paddingHorizontal: 18, gap: 4 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  headerBtn: { fontSize: 15, paddingHorizontal: 8, paddingVertical: 4, fontFamily: FONTS.body },
  headerTitle: { fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' },
  rows: { gap: 10, marginTop: 4, paddingHorizontal: 4 },
  row: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowStack: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
  },
  rowTitle: {
    fontFamily: FONTS.monoSemibold,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  labelInput: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 15,
    textAlign: 'right',
    paddingVertical: 0,
  },
  daysRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  dayBtn: {
    flex: 1,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBtnText: { fontFamily: FONTS.bodyBold, fontSize: 12 },
  deleteBtn: { marginTop: 6, padding: 12, alignItems: 'center' },
  deleteText: { color: '#C8463C', fontSize: 14, fontFamily: FONTS.bodySemibold },
});
