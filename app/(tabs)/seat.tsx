import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const focusOptions = [{ label: 'Sleep', tone: '#72b8c2' }];
const seatRows = ['01', '02', '03', '04', '05'];
const seatColumns = ['A', 'C', 'D', 'F'];

export default function SeatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ cityCode?: string; cityName?: string; duration?: string; distance?: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [isChoosingSeat, setIsChoosingSeat] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const cabinWidth = Math.min(width - 32, 430);
  const seatWidth = Math.max(52, Math.min(72, cabinWidth * 0.18));

  const chooseFocus = () => {
    setIsChoosingSeat(true);
    setSelectedSeat(null);
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
          { paddingTop: Math.max(insets.top + 14, 34), paddingBottom: insets.bottom + 28 },
        ]}>
        <View style={[styles.phoneFrame, { width: cabinWidth }]}> 
          <View style={styles.topBar}>
            <Text selectable style={styles.timeText}>2:49</Text>
            <View style={styles.dynamicIsland} />
            <Text selectable style={styles.batteryText}>11%</Text>
          </View>

          <Pressable style={styles.backButton} onPress={() => setIsChoosingSeat(false)}>
            <Text style={styles.backIcon}>{'‹'}</Text>
          </Pressable>

          <View pointerEvents="none" style={[styles.noseGlow, isChoosingSeat && styles.noseGlowRaised]} />
          <View pointerEvents="none" style={[styles.windowBand, isChoosingSeat && styles.windowBandRaised]}>
            <View style={styles.windowLeft} />
            <View style={styles.windowGap} />
            <View style={styles.windowRight} />
          </View>

          {!isChoosingSeat ? (
            <View style={styles.focusCard}>
              <Text selectable style={styles.seatLabel}>Flight: SFO to {params.cityCode ?? 'ABQ'}</Text>
              <Text selectable style={styles.question}>What do you want to focus?</Text>
              <View style={styles.chipWrap}>
                {focusOptions.map((option) => (
                  <Pressable
                    key={option.label}
                    onPress={chooseFocus}
                    style={[styles.focusChip, { backgroundColor: option.tone + '55' }]}>
                    <View style={[styles.chipMark, { backgroundColor: option.tone }]} />
                    <Text style={styles.chipText}>{option.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.seatHeader}>
              {seatColumns.map((column) => (
                <Text selectable key={column} style={styles.columnLabel}>
                  {column}
                </Text>
              ))}
            </View>
          )}

          <View style={[styles.seatMap, isChoosingSeat && styles.seatMapChoosing]}>
            {seatRows.map((row) => (
              <View key={row} style={styles.seatRow}>
                <View style={styles.seatPair}>
                  {seatColumns.slice(0, 2).map((column) => {
                    const seatId = row + column;
                    const isSelected = selectedSeat === seatId;
                    return (
                      <Pressable
                        key={seatId}
                        accessibilityRole="button"
                        accessibilityLabel={seatId}
                        onPress={() => setSelectedSeat(seatId)}
                        style={[styles.seat, { width: seatWidth }, isSelected && styles.selectedSeat]}>
                        {isSelected ? <Text style={styles.selectedSeatIcon}>ϟ</Text> : null}
                      </Pressable>
                    );
                  })}
                </View>
                <Text selectable style={styles.rowNumber}>{row}</Text>
                <View style={styles.seatPair}>
                  {seatColumns.slice(2).map((column) => {
                    const seatId = row + column;
                    const isSelected = selectedSeat === seatId;
                    return (
                      <Pressable
                        key={seatId}
                        accessibilityRole="button"
                        accessibilityLabel={seatId}
                        onPress={() => setSelectedSeat(seatId)}
                        style={[styles.seat, { width: seatWidth }, isSelected && styles.selectedSeat]}>
                        {isSelected ? <Text style={styles.selectedSeatIcon}>ϟ</Text> : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          {selectedSeat ? (
            <Pressable
              style={styles.confirmButton}
              onPress={() => router.push({
                pathname: '/ticket',
                params: {
                  cityCode: params.cityCode ?? 'ABQ',
                  cityName: params.cityName ?? 'Albuquerque',
                  duration: params.duration ?? '2h 3m',
                  distance: params.distance ?? '896 mi',
                  seat: selectedSeat,
                },
              })}>
              <Text style={styles.confirmText}>Confirm</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    alignItems: 'center',
    minHeight: '100%',
    paddingHorizontal: 16,
  },
  phoneFrame: {
    minHeight: 820,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#17171b',
    backgroundColor: '#111115',
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 34,
    paddingTop: 20,
  },
  timeText: {
    color: '#f4f4f6',
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  dynamicIsland: {
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 26,
    height: 44,
    justifyContent: 'center',
    width: 168,
  },
  batteryText: {
    backgroundColor: '#2a2a2f',
    borderRadius: 7,
    color: '#ececf0',
    fontSize: 13,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#2a2a2f',
    borderColor: '#3b3b42',
    borderRadius: 28,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    left: 24,
    position: 'absolute',
    top: 92,
    width: 56,
    zIndex: 4,
  },
  backIcon: {
    color: '#ffffff',
    fontSize: 44,
    fontWeight: '300',
    lineHeight: 48,
    marginTop: -3,
  },
  noseGlow: {
    alignSelf: 'center',
    backgroundColor: '#18181d',
    borderColor: '#323239',
    borderRadius: 260,
    borderWidth: 1,
    height: 560,
    marginTop: 48,
    opacity: 0.92,
    width: '86%',
  },
  noseGlowRaised: {
    marginTop: 48,
  },
  windowBand: {
    alignSelf: 'center',
    flexDirection: 'row',
    height: 86,
    justifyContent: 'center',
    position: 'absolute',
    top: 196,
    width: '68%',
  },
  windowBandRaised: {
    top: 196,
  },
  windowLeft: {
    backgroundColor: '#2d2d33',
    borderTopLeftRadius: 160,
    flex: 1,
    transform: [{ skewY: '-12deg' }],
  },
  windowGap: {
    width: 24,
  },
  windowRight: {
    backgroundColor: '#2d2d33',
    borderTopRightRadius: 160,
    flex: 1,
    transform: [{ skewY: '12deg' }],
  },
  focusCard: {
    alignSelf: 'center',
    backgroundColor: 'rgba(90, 90, 98, 0.78)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    marginTop: -238,
    padding: 18,
    width: '90%',
    zIndex: 3,
  },
  seatLabel: {
    color: '#d6d6dc',
    fontSize: 18,
    fontWeight: '500',
  },
  question: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 4,
  },
  focusChip: {
    alignItems: 'center',
    borderColor: 'rgba(255, 255, 255, 0.11)',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 14,
  },
  chipMark: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  chipText: {
    color: '#f4f5f6',
    fontSize: 17,
    fontWeight: '700',
  },
  seatHeader: {
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -74,
    paddingHorizontal: 58,
    width: '86%',
    zIndex: 3,
  },
  columnLabel: {
    color: '#dcdce2',
    fontSize: 23,
    fontWeight: '500',
    minWidth: 42,
    textAlign: 'center',
  },
  seatMap: {
    gap: 28,
    marginTop: 42,
    paddingBottom: 28,
    paddingHorizontal: 26,
  },
  seatMapChoosing: {
    marginTop: 28,
  },
  seatRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seatPair: {
    flexDirection: 'row',
    gap: 14,
  },
  seat: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#2b2b30',
    borderColor: '#25252a',
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: 'center',
  },
  selectedSeat: {
    backgroundColor: '#a6eef0',
    borderColor: '#c5ffff',
  },
  selectedSeatIcon: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 48,
  },
  rowNumber: {
    color: '#dadbe2',
    fontSize: 28,
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
    minWidth: 48,
    textAlign: 'center',
  },
  confirmButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 36,
    bottom: 44,
    height: 72,
    justifyContent: 'center',
    position: 'absolute',
    width: '88%',
    zIndex: 5,
  },
  confirmText: {
    color: '#111111',
    fontSize: 22,
    fontWeight: '600',
  },
});
