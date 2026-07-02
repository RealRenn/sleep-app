import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const barcodeBars = [8, 3, 2, 7, 2, 3, 12, 4, 2, 9, 3, 6, 2, 12, 3, 2, 8, 4, 10, 2, 3, 7, 12, 2, 4, 9, 3, 2, 11, 5, 2, 7, 3, 12, 2, 4, 8];

export default function TicketScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ cityCode?: string; cityName?: string; duration?: string; distance?: string; seat?: string }>();
  const insets = useSafeAreaInsets();
  const [isTorn, setIsTorn] = useState(false);
  const { width } = useWindowDimensions();
  const screenWidth = Math.min(width - 32, 430);
  const cityCode = params.cityCode ?? 'ABQ';
  const cityName = params.cityName ?? 'Albuquerque';
  const duration = params.duration ?? '2h 3m';
  const distance = params.distance ?? '896 mi';
  const seat = params.seat ?? '01A';

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
          <View style={styles.topBar}>
            <Text selectable style={styles.timeText}>2:49</Text>
            <View style={styles.dynamicIsland}>
              <View style={styles.recordingDot} />
            </View>
            <Text selectable style={styles.batteryText}>11%</Text>
          </View>

          <Pressable style={styles.backButton}>
            <Text style={styles.backIcon}>{'‹'}</Text>
          </Pressable>

          <View style={[styles.mapArea, isTorn && styles.mapAreaTorn]}>
            <View style={styles.coastShape} />
            <View style={styles.routeLine} />
            <View style={[styles.airportTag, styles.sfoTag]}>
              <Text style={styles.airportTagText}>▰ SFO</Text>
            </View>
            <View style={[styles.airportTag, styles.abqTag]}>
              <Text style={styles.airportTagText}>{cityCode}</Text>
            </View>
            <Text selectable style={styles.legalText}>Legal</Text>
          </View>

          <View style={[styles.ticketCard, isTorn && styles.ticketCardTorn]}>
            <View pointerEvents="none" style={styles.worldDots}>
              {Array.from({ length: 120 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      left: 18 + (index % 20) * 18,
                      top: 28 + Math.floor(index / 20) * 22 + ((index % 5) * 2),
                      opacity: index % 7 === 0 ? 0.08 : 0.22,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.ticketHeader}>
              <View>
                <Text selectable style={styles.bigCode}>SFO</Text>
                <Text selectable style={styles.cityText}>San Francisco</Text>
              </View>
              <View style={styles.rightCodeBlock}>
                <Text selectable style={styles.bigCode}>{cityCode}</Text>
                <Text selectable style={styles.cityText}>{cityName}</Text>
              </View>
            </View>
            <Text selectable numberOfLines={1} style={styles.durationText}>{duration}</Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoBlock}>
                <Text selectable style={styles.infoLabel}>Seat</Text>
                <Text selectable style={styles.infoValue}>{seat}</Text>
              </View>
              <View style={styles.infoBlockRight}>
                <Text selectable style={styles.infoLabel}>Distance</Text>
                <Text selectable style={styles.infoValue}>{distance}</Text>
              </View>
              <View style={styles.infoBlock}>
                <Text selectable style={styles.infoLabel}>Boarding</Text>
                <Text selectable style={styles.infoValue}>Now</Text>
              </View>
              <View style={styles.infoBlockRight}>
                <Text selectable style={styles.infoLabel}>Date</Text>
                <Text selectable style={styles.infoValue}>2025/09/06</Text>
              </View>
            </View>

            <View style={styles.cutLine} />
            <View style={styles.notchLeft} />
            <View style={styles.notchRight} />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tear boarding pass"
              onPress={() => (isTorn
                ? router.push({
                    pathname: '/takeoff',
                    params: { cityCode, cityName, duration, distance, seat },
                  })
                : setIsTorn(true))}
              style={[styles.barcode, isTorn && styles.tornBarcode]}>
              {barcodeBars.map((height, index) => (
                <View key={index} style={[styles.bar, { height: 40 + (height % 4) * 4, width: index % 5 === 0 ? 8 : 3 }]} />
              ))}
            </Pressable>
          </View>

          {!isTorn ? (
            <Pressable style={styles.checkInButton} onPress={() => setIsTorn(true)}>
              <Text style={styles.checkInText}>Check in</Text>
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
    backgroundColor: '#424246',
    minHeight: 820,
    overflow: 'hidden',
    position: 'relative',
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 34,
    paddingTop: 20,
    zIndex: 5,
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
  recordingDot: {
    alignSelf: 'flex-start',
    backgroundColor: '#ff4c4c',
    borderRadius: 7,
    height: 14,
    marginLeft: 24,
    width: 14,
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
    zIndex: 6,
  },
  backIcon: {
    color: '#ffffff',
    fontSize: 44,
    fontWeight: '300',
    lineHeight: 48,
    marginTop: -3,
  },
  mapArea: {
    height: 310,
    position: 'relative',
  },
  mapAreaTorn: {
    height: 470,
  },
  coastShape: {
    backgroundColor: '#111115',
    borderBottomRightRadius: 95,
    height: 455,
    left: 0,
    opacity: 0.94,
    position: 'absolute',
    top: -94,
    transform: [{ skewX: '-9deg' }],
    width: 150,
  },
  routeLine: {
    backgroundColor: '#ffffff',
    height: 3,
    left: 108,
    position: 'absolute',
    top: 196,
    transform: [{ rotate: '12deg' }],
    width: 240,
    zIndex: 2,
  },
  airportTag: {
    backgroundColor: '#101010',
    borderColor: '#ffdf2d',
    borderRadius: 9,
    borderWidth: 3,
    paddingHorizontal: 10,
    paddingVertical: 7,
    position: 'absolute',
    zIndex: 3,
  },
  sfoTag: {
    left: 58,
    top: 174,
  },
  abqTag: {
    right: 48,
    top: 204,
  },
  airportTagText: {
    color: '#ffdf2d',
    fontSize: 18,
    fontWeight: '900',
  },
  legalText: {
    color: '#d8d8dc',
    fontSize: 14,
    fontWeight: '700',
    left: 56,
    position: 'absolute',
    textDecorationLine: 'underline',
    top: 260,
  },
  ticketCard: {
    alignSelf: 'center',
    backgroundColor: 'rgba(31, 31, 35, 0.92)',
    borderRadius: 16,
    marginTop: -6,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingTop: 22,
    position: 'relative',
    width: '88%',
  },
  ticketCardTorn: {
    marginTop: -88,
    transform: [{ rotate: '-1deg' }],
  },
  worldDots: {
    ...StyleSheet.absoluteFillObject,
  },
  dot: {
    backgroundColor: '#f2f2f2',
    borderRadius: 2,
    height: 3,
    position: 'absolute',
    width: 3,
  },
  ticketHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bigCode: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 0,
  },
  cityText: {
    color: '#c5c5ca',
    fontSize: 18,
    fontWeight: '500',
  },
  durationText: {
    alignSelf: 'center',
    color: '#d9d9df',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
    width: 88,
  },
  rightCodeBlock: {
    alignItems: 'flex-end',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 12,
    rowGap: 12,
  },
  infoBlock: {
    width: '50%',
  },
  infoBlockRight: {
    alignItems: 'flex-end',
    width: '50%',
  },
  infoLabel: {
    color: '#c8c8ce',
    fontSize: 18,
    fontWeight: '500',
  },
  infoValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    paddingTop: 4,
  },
  cutLine: {
    borderColor: '#080809',
    borderStyle: 'dashed',
    borderTopWidth: 2,
    marginTop: 16,
  },
  notchLeft: {
    backgroundColor: '#000000',
    borderRadius: 16,
    height: 32,
    left: -16,
    position: 'absolute',
    top: 250,
    width: 32,
  },
  notchRight: {
    backgroundColor: '#000000',
    borderRadius: 16,
    height: 32,
    position: 'absolute',
    right: -16,
    top: 250,
    width: 32,
  },
  barcode: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 4,
    height: 62,
    justifyContent: 'center',
    paddingBottom: 10,
    paddingTop: 10,
  },
  tornBarcode: {
    backgroundColor: '#1c1c20',
    borderRadius: 12,
    marginHorizontal: -8,
    marginTop: 20,
    transform: [{ rotate: '-9deg' }],
    zIndex: 10,
  },
  bar: {
    backgroundColor: '#ffffff',
  },
  checkInButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 36,
    bottom: 44,
    height: 72,
    justifyContent: 'center',
    position: 'absolute',
    width: '82%',
    zIndex: 8,
  },
  checkInText: {
    color: '#111111',
    fontSize: 22,
    fontWeight: '600',
  },
});
