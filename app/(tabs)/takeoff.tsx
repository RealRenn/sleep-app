import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SESSION_SECONDS = 25 * 60;

export default function TakeoffScreen() {
  const params = useLocalSearchParams<{ cityCode?: string; seat?: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const screenWidth = Math.min(width - 32, 430);
  const [isLocked, setIsLocked] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS);
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');
  const cityCode = params.cityCode ?? 'ABQ';
  const seat = params.seat ?? '01A';

  useEffect(() => {
    if (!isLocked || secondsLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, secondsLeft]);

  const resetSession = () => {
    setIsLocked(false);
    setSecondsLeft(SESSION_SECONDS);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView
        bounces={false}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top + 14, 34), paddingBottom: insets.bottom + 24 },
        ]}>
        <View style={[styles.phoneFrame, { width: screenWidth }]}>
          <View pointerEvents="none" style={styles.greenWash} />
          <View style={styles.centerContent}>
            <Text style={styles.planeIcon}>{'>'}</Text>
            <View style={styles.runwayLine} />

            {!isLocked ? (
              <>
                <Text selectable style={styles.message}>{'Cabin doors closed,\nReady for takeoff.'}</Text>
                <Text selectable style={styles.tripLine}>SFO to {cityCode} - Seat {seat}</Text>
                <Pressable style={styles.goButton} onPress={() => setIsLocked(true)}>
                  <Text style={styles.goText}>GO</Text>
                </Pressable>
              </>
            ) : (
              <View style={styles.lockPanel}>
                <Text selectable style={styles.lockKicker}>Flight mode active</Text>
                <Text selectable style={styles.timerText}>{minutes}:{seconds}</Text>
                <Text selectable style={styles.lockCopy}>SFO to {cityCode} - Seat {seat}</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${(secondsLeft / SESSION_SECONDS) * 100}%` }]} />
                </View>
                <Pressable style={styles.exitButton} onPress={resetSession}>
                  <Text style={styles.exitText}>Reset</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
  scrollContent: { alignItems: 'center', minHeight: '100%', paddingHorizontal: 16 },
  phoneFrame: { backgroundColor: '#030504', minHeight: 820, overflow: 'hidden', position: 'relative' },
  greenWash: { backgroundColor: '#103d37', height: 380, left: -40, opacity: 0.72, position: 'absolute', right: -40, top: 0 },
  centerContent: { alignItems: 'center', minHeight: 790, paddingHorizontal: 34, paddingTop: 265 },
  planeIcon: { color: '#ffffff', fontSize: 42, fontWeight: '900', lineHeight: 46, transform: [{ rotate: '-11deg' }] },
  runwayLine: { backgroundColor: '#ffffff', borderRadius: 2, height: 4, marginTop: 4, width: 48 },
  message: { color: '#ffffff', fontSize: 29, fontWeight: '800', lineHeight: 39, marginTop: 170, textAlign: 'left', width: '84%' },
  tripLine: { color: '#cddbd8', fontSize: 16, fontWeight: '700', marginTop: 18, width: '84%' },
  goButton: { alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 32, height: 64, justifyContent: 'center', marginTop: 62, width: 112 },
  goText: { color: '#050505', fontSize: 23, fontWeight: '700' },
  lockPanel: { alignItems: 'center', gap: 14, marginTop: 136, width: '88%' },
  lockKicker: { color: '#cddbd8', fontSize: 15, fontWeight: '800', textTransform: 'uppercase' },
  timerText: { color: '#ffffff', fontSize: 72, fontVariant: ['tabular-nums'], fontWeight: '900', lineHeight: 78 },
  lockCopy: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  progressTrack: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 8, height: 10, marginTop: 18, overflow: 'hidden', width: '100%' },
  progressFill: { backgroundColor: '#ffffff', borderRadius: 8, height: '100%' },
  exitButton: { alignItems: 'center', borderColor: 'rgba(255,255,255,0.24)', borderRadius: 24, borderWidth: 1, height: 48, justifyContent: 'center', marginTop: 36, width: 118 },
  exitText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
});
