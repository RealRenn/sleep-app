import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TakeoffScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const screenWidth = Math.min(width - 32, 430);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView bounces={false} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top + 14, 34), paddingBottom: insets.bottom + 24 }]}>
        <View style={[styles.phoneFrame, { width: screenWidth }]}> 
          <View pointerEvents="none" style={styles.greenWash} />
          <View style={styles.centerContent}>
            <Text style={styles.planeIcon}>✈</Text>
            <View style={styles.runwayLine} />
            <Text selectable style={styles.message}>{'Cabin doors closed,\nReady for takeoff.'}</Text>
            <Pressable style={styles.goButton}>
              <Text style={styles.goText}>GO</Text>
            </Pressable>
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
  message: { color: '#ffffff', fontSize: 29, fontWeight: '800', lineHeight: 39, marginTop: 190, textAlign: 'left', width: '84%' },
  goButton: { alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 32, height: 64, justifyContent: 'center', marginTop: 86, width: 112 },
  goText: { color: '#050505', fontSize: 23, fontWeight: '700' },
});
