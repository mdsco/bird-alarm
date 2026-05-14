import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDeviceId } from '../../hooks/useDeviceId';
import { useDailyVideo } from '../../hooks/useDailyVideo';
import { useAlarm } from '../../hooks/useAlarm';
import { BirdCard } from '../../components/BirdCard';
import { AlarmTimePicker } from '../../components/AlarmTimePicker';
import { AlarmTime } from '../../constants/types';
import { formatAlarmTime } from '../../services/alarm';

export default function HomeScreen() {
  const router = useRouter();
  const { deviceId, isLoading: isLoadingDevice } = useDeviceId();
  const { video, isLoading: isLoadingVideo, isDownloading, downloadProgress, error, triggerDownload } =
    useDailyVideo(deviceId);
  const { alarmTime, alarmEnabled, isLoading: isLoadingAlarm, setAlarm, toggleAlarm } = useAlarm(
    video?.species,
  );

  const isLoading = isLoadingDevice || isLoadingVideo || isLoadingAlarm;

  const handleSetAlarm = async (time: AlarmTime) => {
    try {
      await setAlarm(time);
    } catch (err) {
      Alert.alert('Permission Required', err instanceof Error ? err.message : 'Failed to set alarm');
    }
  };

  const handleToggleAlarm = async () => {
    try {
      await toggleAlarm();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to toggle alarm');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1a6dbb" size="large" />
        <Text style={styles.loadingText}>Loading your daily bird...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Could not load today's bird</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorHint}>Make sure EXPO_PUBLIC_API_URL is set in your .env file.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Good morning</Text>
      <Text style={styles.subtitle}>Your bird alarm awaits</Text>

      {/* Alarm toggle + current time display */}
      <View style={styles.alarmCard}>
        <View style={styles.alarmHeader}>
          <View>
            <Text style={styles.alarmLabel}>Daily Alarm</Text>
            {alarmTime ? (
              <Text style={styles.alarmTime}>{formatAlarmTime(alarmTime)}</Text>
            ) : (
              <Text style={styles.alarmTimePlaceholder}>Not set</Text>
            )}
          </View>
          <Switch
            value={alarmEnabled}
            onValueChange={handleToggleAlarm}
            trackColor={{ false: '#1e3a5f', true: '#1a6dbb' }}
            thumbColor="#ffffff"
            disabled={!alarmTime}
          />
        </View>

        <AlarmTimePicker currentTime={alarmTime} onSave={handleSetAlarm} />
      </View>

      {/* Today's bird card */}
      {video ? (
        <BirdCard
          video={video}
          isDownloading={isDownloading}
          downloadProgress={downloadProgress}
          onDownload={triggerDownload}
          onPlay={() => router.push('/video-player')}
        />
      ) : (
        <View style={styles.noVideoCard}>
          <Text style={styles.noVideoText}>No video available yet. Check back soon!</Text>
        </View>
      )}

      <Text style={styles.footerNote}>
        Videos download automatically overnight. Tap "Download Video" if you want it now.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  loadingText: {
    color: '#8ab4d4',
    fontSize: 16,
    marginTop: 12,
  },
  errorEmoji: {
    fontSize: 48,
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    color: '#e07070',
    fontSize: 14,
    textAlign: 'center',
  },
  errorHint: {
    color: '#4a7aa0',
    fontSize: 12,
    textAlign: 'center',
  },
  greeting: {
    color: '#8ab4d4',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 2,
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  alarmCard: {
    backgroundColor: '#1e3a5f',
    borderRadius: 20,
    padding: 20,
    marginBottom: 8,
  },
  alarmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  alarmLabel: {
    color: '#8ab4d4',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  alarmTime: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  alarmTimePlaceholder: {
    color: '#4a7aa0',
    fontSize: 22,
    fontWeight: '300',
  },
  noVideoCard: {
    backgroundColor: '#1e3a5f',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginVertical: 12,
  },
  noVideoText: {
    color: '#8ab4d4',
    fontSize: 16,
    textAlign: 'center',
  },
  footerNote: {
    color: '#4a7aa0',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
