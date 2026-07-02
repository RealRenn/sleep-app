import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type City = {
  code: string;
  name: string;
  time: string;
  distance: string;
  top: number;
  left: number;
};

const cities: City[] = [
  { code: 'YXC', name: 'Cranbrook', time: '2h 3m', distance: '901 mi', top: 248, left: 106 },
  { code: 'ABQ', name: 'Albuquerque', time: '2h 3m', distance: '896 mi', top: 322, left: 286 },
  { code: 'ALS', name: 'Alamosa', time: '2h 4m', distance: '843 mi', top: 276, left: 340 },
  { code: 'COD', name: 'Cody', time: '1h 57m', distance: '738 mi', top: 210, left: 318 },
  { code: 'BIL', name: 'Billings', time: '2h 0m', distance: '809 mi', top: 182, left: 328 },
  { code: 'SVC', name: 'Silver City', time: '2h 8m', distance: '942 mi', top: 392, left: 350 },
  { code: 'HMO', name: 'Hermosillo', time: '2h 12m', distance: '955 mi', top: 474, left: 322 },
];

export default function FlightPickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [selectedCity, setSelectedCity] = useState<City>(cities[1]);
  const screenWidth = Math.min(width - 32, 430);

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
          <View style={styles.mapGrid}>
            {Array.from({ length: 9 }).map((_, index) => (
              <View key={'v' + index} style={[styles.gridLineVertical, { left: index * 54 - 28 }]} />
            ))}
            {Array.from({ length: 13 }).map((_, index) => (
              <View key={'h' + index} style={[styles.gridLineHorizontal, { top: index * 58 - 20 }]} />
            ))}
          </View>

          <View style={styles.topBar}>
            <Text selectable style={styles.timeText}>2:49</Text>
            <View style={styles.dynamicIsland} />
            <Text selectable style={styles.batteryText}>10%</Text>
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.circleButton}>
              <Text style={styles.backIcon}>{'<'}</Text>
            </Pressable>
            <View style={styles.rightActions}>
              <Pressable style={styles.circleButton}>
                <Text style={styles.alertIcon}>!</Text>
              </Pressable>
              <Pressable style={styles.circleButton}>
                <Text style={styles.searchIcon}>⌕</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.mapBody}>
            <View style={styles.flightPath} />
            <View style={styles.currentPin} />
            <View style={styles.stateShape} />
            {cities.map((city) => {
              const isSelected = city.code === selectedCity.code;
              return (
                <Pressable
                  key={city.code}
                  onPress={() => setSelectedCity(city)}
                  style={[
                    styles.mapTag,
                    { top: city.top, left: Math.min(city.left, screenWidth - 118) },
                    isSelected && styles.selectedMapTag,
                  ]}>
                  <Text style={[styles.mapTagText, isSelected && styles.selectedMapTagText]}>
                    {'✈ ' + city.code}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.timelineWrap}>
            <Text selectable style={styles.legalText}>Legal</Text>
            <View style={styles.timelineTicks}>
              {Array.from({ length: 31 }).map((_, index) => (
                <View
                  key={index}
                  style={[styles.tick, index % 10 === 0 && styles.majorTick, index === 15 && styles.centerTick]}
                />
              ))}
            </View>
            <View style={styles.timeLabels}>
              <Text selectable style={styles.timeLabel}>1h 50m</Text>
              <Text selectable style={styles.timeLabel}>2h 0m</Text>
              <Text selectable style={styles.timeLabel}>2h 10m</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cityCards}
            style={styles.cityCardsScroll}>
            {cities.map((city) => {
              const isSelected = city.code === selectedCity.code;
              return (
                <Pressable
                  key={city.code}
                  onPress={() => setSelectedCity(city)}
                  style={[styles.cityCard, isSelected && styles.selectedCityCard]}>
                  <View style={[styles.cityBadge, isSelected && styles.selectedCityBadge]}>
                    <Text style={[styles.cityBadgeText, isSelected && styles.selectedCityBadgeText]}>
                      {'✈ ' + city.code}
                    </Text>
                  </View>
                  <Text selectable style={[styles.cityName, isSelected && styles.selectedCityName]}>
                    {city.name}
                  </Text>
                  <Text selectable style={[styles.cityTime, isSelected && styles.selectedCityTime]}>
                    {city.time}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            style={styles.bookButton}
            onPress={() => router.push({
              pathname: '/seat',
              params: {
                cityCode: selectedCity.code,
                cityName: selectedCity.name,
                duration: selectedCity.time,
                distance: selectedCity.distance,
              },
            })}>
            <Text style={styles.bookText}>Book My Flight</Text>
          </Pressable>
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
    backgroundColor: '#525256',
    minHeight: 820,
    overflow: 'hidden',
    position: 'relative',
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.34,
  },
  gridLineVertical: {
    backgroundColor: '#27272b',
    height: 980,
    position: 'absolute',
    top: -80,
    transform: [{ rotate: '10deg' }],
    width: 1,
  },
  gridLineHorizontal: {
    backgroundColor: '#29292d',
    height: 1,
    left: -80,
    position: 'absolute',
    transform: [{ rotate: '10deg' }],
    width: 620,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 34,
    paddingTop: 20,
  },
  timeText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  dynamicIsland: {
    backgroundColor: '#000000',
    borderRadius: 26,
    height: 44,
    width: 176,
  },
  batteryText: {
    backgroundColor: '#2a2a2f',
    borderRadius: 7,
    color: '#eeeeee',
    fontSize: 13,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 42,
    zIndex: 4,
  },
  rightActions: {
    flexDirection: 'row',
    gap: 16,
  },
  circleButton: {
    alignItems: 'center',
    backgroundColor: '#2b2b30',
    borderRadius: 34,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  backIcon: {
    color: '#ffffff',
    fontSize: 35,
    fontWeight: '300',
    lineHeight: 40,
  },
  alertIcon: {
    borderColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    height: 28,
    lineHeight: 26,
    textAlign: 'center',
    width: 28,
  },
  searchIcon: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: '300',
    lineHeight: 42,
    marginTop: -4,
  },
  mapBody: {
    height: 530,
    marginTop: 8,
    position: 'relative',
  },
  stateShape: {
    backgroundColor: '#17171b',
    borderBottomLeftRadius: 120,
    borderBottomRightRadius: 80,
    height: 430,
    left: 82,
    opacity: 0.96,
    position: 'absolute',
    top: 120,
    transform: [{ skewX: '-4deg' }],
    width: 236,
  },
  currentPin: {
    backgroundColor: '#000000',
    borderColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 5,
    height: 30,
    left: 206,
    position: 'absolute',
    top: 284,
    width: 30,
    zIndex: 3,
  },
  flightPath: {
    backgroundColor: '#ffffff',
    height: 2,
    left: 230,
    opacity: 0.9,
    position: 'absolute',
    top: 298,
    transform: [{ rotate: '10deg' }],
    width: 92,
    zIndex: 2,
  },
  mapTag: {
    backgroundColor: 'rgba(16, 16, 17, 0.62)',
    borderColor: 'rgba(255, 218, 36, 0.54)',
    borderRadius: 9,
    borderWidth: 2,
    paddingHorizontal: 9,
    paddingVertical: 5,
    position: 'absolute',
    zIndex: 5,
  },
  selectedMapTag: {
    backgroundColor: '#050505',
    borderColor: '#ffdf2d',
    borderWidth: 3,
  },
  mapTagText: {
    color: 'rgba(255, 226, 62, 0.72)',
    fontSize: 16,
    fontWeight: '800',
  },
  selectedMapTagText: {
    color: '#ffdf2d',
  },
  timelineWrap: {
    marginTop: -4,
    paddingHorizontal: 28,
    zIndex: 4,
  },
  legalText: {
    color: '#dedee2',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  timelineTicks: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    height: 48,
    justifyContent: 'space-between',
    marginTop: 28,
  },
  tick: {
    backgroundColor: '#f0f0f2',
    borderRadius: 1,
    height: 13,
    opacity: 0.68,
    width: 2,
  },
  majorTick: {
    height: 35,
    opacity: 0.9,
  },
  centerTick: {
    height: 44,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeLabel: {
    color: '#efeff3',
    fontSize: 18,
    fontWeight: '600',
  },
  cityCardsScroll: {
    marginTop: 22,
    zIndex: 6,
  },
  cityCards: {
    gap: 18,
    paddingHorizontal: 42,
  },
  cityCard: {
    backgroundColor: '#060607',
    borderRadius: 22,
    gap: 8,
    height: 142,
    justifyContent: 'center',
    padding: 18,
    width: 126,
  },
  selectedCityCard: {
    backgroundColor: '#f8f8fb',
  },
  cityBadge: {
    alignSelf: 'flex-start',
    borderColor: '#ffdf2d',
    borderRadius: 8,
    borderWidth: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectedCityBadge: {
    backgroundColor: '#ffdf2d',
    borderColor: '#1a1a1a',
  },
  cityBadgeText: {
    color: '#ffdf2d',
    fontSize: 16,
    fontWeight: '900',
  },
  selectedCityBadgeText: {
    color: '#111111',
  },
  cityName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  selectedCityName: {
    color: '#111111',
  },
  cityTime: {
    color: '#c9c9ce',
    fontSize: 19,
    fontWeight: '500',
  },
  selectedCityTime: {
    color: '#68686f',
  },
  bookButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    marginTop: 36,
    width: '82%',
    zIndex: 7,
  },
  bookText: {
    color: '#111111',
    fontSize: 24,
    fontWeight: '600',
  },
});
