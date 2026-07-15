import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loadRewardProgress, RewardProgress, TASK_HEALTH_REWARD } from '@/constants/rewards';

type RewardStop = {
  id: string;
  title: string;
  detail: string;
  hp: number;
  coin: number;
  top: number;
  left: number;
};

const rewardStops: RewardStop[] = [
  { id: 'task1', title: 'First task complete', detail: 'Finish any task in the Tasks tab.', hp: 120, coin: 18, top: 304, left: 70 },
  { id: 'task2', title: 'Build momentum', detail: 'Complete two focus blocks today.', hp: 240, coin: 36, top: 232, left: 226 },
  { id: 'task3', title: 'Quest checkpoint', detail: 'Three completed tasks unlock the next guide.', hp: 360, coin: 54, top: 164, left: 108 },
  { id: 'task4', title: 'Evening streak', detail: 'Keep the streak going before wind down.', hp: 480, coin: 72, top: 94, left: 254 },
  { id: 'task5', title: 'Chapter clear', detail: 'Reach the weekly HP goal.', hp: 560, coin: 90, top: 26, left: 142 },
];

const energy = 4;
const selectedWeek = 1;

export default function RewardMapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [rewardProgress, setRewardProgress] = useState<RewardProgress>(() => loadRewardProgress());
  const [selectedStop, setSelectedStop] = useState<RewardStop>(rewardStops[1]);

  const chapterLeft = Math.max(0, rewardProgress.chapterGoal - rewardProgress.totalHealth);
  const progressPercent = useMemo(
    () => Math.min(100, Math.round((rewardProgress.totalHealth / rewardProgress.chapterGoal) * 100)),
    [rewardProgress.chapterGoal, rewardProgress.totalHealth],
  );

  useEffect(() => {
    const refreshProgress = () => setRewardProgress(loadRewardProgress());
    refreshProgress();

    if (typeof window === 'undefined') {
      return undefined;
    }

    window.addEventListener('focus', refreshProgress);

    return () => window.removeEventListener('focus', refreshProgress);
  }, []);

  const startChallenge = () => {
    router.push({
      pathname: '/seat',
      params: {
        cityCode: 'REST',
        cityName: 'Sleep Quest',
        duration: '25 min',
        distance: `${selectedStop.hp} HP`,
      },
    });
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
          { paddingTop: Math.max(insets.top + 12, 30), paddingBottom: insets.bottom + 28 },
        ]}>
        <View style={styles.phoneFrame}>
          <View pointerEvents="none" style={styles.skyBeamOne} />
          <View pointerEvents="none" style={styles.skyBeamTwo} />
          <View pointerEvents="none" style={styles.moon} />

          <View style={styles.statusRow}>
            <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>{'<'}</Text>
            </Pressable>
            <View style={styles.chapterBadge}>
              <Text selectable style={styles.chapterText}>
                WEEK {selectedWeek}
              </Text>
            </View>
            <View style={styles.coinBadge}>
              <Text selectable style={styles.coinText}>
                {rewardProgress.coins}
              </Text>
            </View>
          </View>

          <View style={styles.questLabel}>
            <Text selectable style={styles.questLabelText}>
              Live Well With Better Sleep
            </Text>
          </View>

          <View style={styles.hpPanel}>
            <View style={styles.hpHeader}>
              <Text selectable style={styles.daysLeft}>
                7 days left
              </Text>
              <Text selectable style={styles.energyText}>
                {energy}/5 energy
              </Text>
            </View>
            <View style={styles.progressCircleOuter}>
              <View style={styles.progressCircleInner}>
                <Text selectable style={styles.hpValue}>
                  {rewardProgress.totalHealth.toLocaleString()}
                </Text>
                <Text selectable style={styles.hpUnit}>
                  health points
                </Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text selectable style={styles.chapterLeft}>
              Goal {rewardProgress.chapterGoal.toLocaleString()} HP - {chapterLeft.toLocaleString()} away
            </Text>
          </View>

          <View style={styles.cityLayer}>
            <View style={[styles.tower, styles.towerTall]} />
            <View style={[styles.tower, styles.towerThin]} />
            <View style={[styles.tower, styles.towerWide]} />
            <View style={[styles.tower, styles.towerSmall]} />
            <View style={styles.windowGrid}>
              {Array.from({ length: 18 }).map((_, index) => (
                <View key={index} style={styles.windowDot} />
              ))}
            </View>
          </View>

          <View style={styles.mapStage}>
            <View pointerEvents="none" style={styles.pathSegmentTop} />
            <View pointerEvents="none" style={styles.pathSegmentMid} />
            <View pointerEvents="none" style={styles.pathSegmentLower} />
            <View pointerEvents="none" style={styles.pathCurveOne} />
            <View pointerEvents="none" style={styles.pathCurveTwo} />

            {rewardStops.map((stop, index) => {
              const isSelected = selectedStop.id === stop.id;
              const isDone = rewardProgress.completedTasks > index;

              return (
                <Pressable
                  key={stop.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${stop.title}`}
                  onPress={() => setSelectedStop(stop)}
                  style={[styles.rewardNode, { top: stop.top, left: stop.left }, isSelected && styles.rewardNodeActive]}>
                  <Text selectable={false} style={[styles.rewardNodeText, isSelected && styles.rewardNodeTextActive]}>
                    {isDone ? 'Done' : `+${TASK_HEALTH_REWARD}`}
                  </Text>
                </Pressable>
              );
            })}

            <View pointerEvents="none" style={styles.mascot}>
              <View style={styles.mascotFace} />
            </View>
          </View>

          <View style={styles.rewardCard}>
            <View style={styles.rewardCardHeader}>
              <View>
                <Text selectable style={styles.kicker}>
                  Quest guide
                </Text>
                <Text selectable style={styles.rewardTitle}>
                  {selectedStop.title}
                </Text>
              </View>
              <View style={styles.rewardPill}>
              <Text selectable style={styles.rewardPillText}>
                  +{TASK_HEALTH_REWARD} HP
                </Text>
              </View>
            </View>
            <Text selectable style={styles.rewardDetail}>
              {selectedStop.detail}
            </Text>
            <View style={styles.rewardStats}>
              <View style={styles.rewardStat}>
                <Text selectable style={styles.statLabel}>
                  Tasks
                </Text>
                <Text selectable style={styles.statValue}>
                  {rewardProgress.completedTasks}
                </Text>
              </View>
              <View style={styles.rewardStat}>
                <Text selectable style={styles.statLabel}>
                  Progress
                </Text>
                <Text selectable style={styles.statValue}>
                  {progressPercent}%
                </Text>
              </View>
              <View style={styles.rewardStat}>
                <Text selectable style={styles.statLabel}>
                  Streak
                </Text>
                <Text selectable style={styles.statValue}>
                  3 days
                </Text>
              </View>
            </View>
          </View>

          <Pressable accessibilityRole="button" onPress={startChallenge} style={styles.startButton}>
            <Text style={styles.startButtonText}>Start Sleep Quest</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#090a18',
  },
  scrollContent: {
    alignItems: 'center',
    minHeight: '100%',
    paddingHorizontal: 14,
  },
  phoneFrame: {
    backgroundColor: '#827bb3',
    borderColor: '#17172b',
    borderRadius: 24,
    borderWidth: 1,
    maxWidth: 430,
    minHeight: 900,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  skyBeamOne: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    height: 520,
    left: -80,
    position: 'absolute',
    top: -120,
    transform: [{ rotate: '34deg' }],
    width: 126,
  },
  skyBeamTwo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 460,
    position: 'absolute',
    right: -42,
    top: -80,
    transform: [{ rotate: '-24deg' }],
    width: 96,
  },
  moon: {
    alignSelf: 'center',
    backgroundColor: '#fff7b5',
    borderRadius: 105,
    height: 210,
    opacity: 0.95,
    position: 'absolute',
    top: 46,
    width: 210,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    zIndex: 4,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(30, 29, 54, 0.68)',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  backText: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '300',
    lineHeight: 34,
  },
  chapterBadge: {
    backgroundColor: '#fffdf4',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  chapterText: {
    color: '#8b86a8',
    fontSize: 12,
    fontWeight: '900',
  },
  coinBadge: {
    alignItems: 'center',
    backgroundColor: '#ffe05a',
    borderColor: 'rgba(99, 72, 18, 0.24)',
    borderRadius: 24,
    borderWidth: 3,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  coinText: {
    color: '#6b4b13',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
  },
  questLabel: {
    alignSelf: 'center',
    backgroundColor: 'rgba(48, 45, 75, 0.78)',
    borderRadius: 999,
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    zIndex: 4,
  },
  questLabelText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  hpPanel: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(67, 127, 199, 0.72)',
    borderRadius: 160,
    gap: 10,
    marginTop: 12,
    padding: 26,
    width: 226,
    zIndex: 4,
  },
  hpHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  kicker: {
    color: '#9da1c3',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  hpValue: {
    color: '#ffffff',
    fontSize: 42,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
    lineHeight: 46,
  },
  hpUnit: {
    color: '#d8e5ff',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  energyText: {
    backgroundColor: '#5b4ce6',
    borderRadius: 999,
    color: '#ffffff',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  daysLeft: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  progressCircleOuter: {
    alignItems: 'center',
    backgroundColor: 'rgba(211, 234, 255, 0.42)',
    borderRadius: 86,
    height: 146,
    justifyContent: 'center',
    width: 146,
  },
  progressCircleInner: {
    alignItems: 'center',
    backgroundColor: '#3d80cc',
    borderRadius: 66,
    height: 112,
    justifyContent: 'center',
    width: 112,
  },
  progressTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.36)',
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: '#fff266',
    borderRadius: 999,
    height: '100%',
  },
  chapterLeft: {
    color: '#ffffff',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
    textAlign: 'center',
  },
  cityLayer: {
    height: 158,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 180,
    zIndex: 2,
  },
  tower: {
    backgroundColor: '#25446d',
    bottom: 0,
    position: 'absolute',
  },
  towerTall: {
    borderTopLeftRadius: 14,
    height: 118,
    left: 82,
    width: 40,
  },
  towerThin: {
    height: 88,
    left: 145,
    width: 25,
  },
  towerWide: {
    height: 72,
    right: 92,
    width: 58,
  },
  towerSmall: {
    height: 96,
    right: 42,
    width: 36,
  },
  windowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    left: 92,
    position: 'absolute',
    top: 62,
    width: 28,
  },
  windowDot: {
    backgroundColor: '#ffe777',
    height: 4,
    width: 4,
  },
  mapStage: {
    height: 374,
    marginTop: -22,
    position: 'relative',
    zIndex: 3,
  },
  pathSegmentTop: {
    backgroundColor: '#d7e7d9',
    borderRadius: 38,
    height: 68,
    left: 128,
    position: 'absolute',
    top: 58,
    transform: [{ rotate: '-18deg' }],
    width: 214,
  },
  pathSegmentMid: {
    backgroundColor: '#d7e7d9',
    borderRadius: 36,
    height: 68,
    left: 70,
    position: 'absolute',
    top: 188,
    transform: [{ rotate: '24deg' }],
    width: 240,
  },
  pathSegmentLower: {
    backgroundColor: '#d7e7d9',
    borderRadius: 38,
    height: 68,
    left: 44,
    position: 'absolute',
    top: 300,
    transform: [{ rotate: '-20deg' }],
    width: 274,
  },
  pathCurveOne: {
    backgroundColor: '#d7e7d9',
    borderRadius: 80,
    height: 120,
    left: 236,
    position: 'absolute',
    top: 120,
    width: 114,
  },
  pathCurveTwo: {
    backgroundColor: '#d7e7d9',
    borderRadius: 80,
    height: 118,
    left: 54,
    position: 'absolute',
    top: 244,
    width: 118,
  },
  rewardNode: {
    alignItems: 'center',
    backgroundColor: '#ffe46a',
    borderColor: '#c8a941',
    borderRadius: 28,
    borderWidth: 4,
    height: 58,
    justifyContent: 'center',
    position: 'absolute',
    width: 58,
    zIndex: 6,
  },
  rewardNodeActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ff55cf',
    transform: [{ scale: 1.08 }],
  },
  rewardNodeText: {
    color: '#715515',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
  },
  rewardNodeTextActive: {
    color: '#2a2147',
  },
  mascot: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    bottom: 22,
    height: 64,
    left: 116,
    position: 'absolute',
    width: 48,
    zIndex: 7,
  },
  mascotFace: {
    backgroundColor: '#ff879e',
    borderRadius: 4,
    height: 8,
    left: 20,
    position: 'absolute',
    top: 24,
    width: 8,
  },
  rewardCard: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 24,
    gap: 14,
    marginTop: -12,
    padding: 18,
    width: '88%',
    zIndex: 8,
  },
  rewardCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rewardTitle: {
    color: '#25233f',
    fontSize: 24,
    fontWeight: '900',
  },
  rewardPill: {
    backgroundColor: '#241f3d',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rewardPillText: {
    color: '#ffffff',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
  },
  rewardDetail: {
    color: '#60647b',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
  },
  rewardStats: {
    flexDirection: 'row',
    gap: 10,
  },
  rewardStat: {
    backgroundColor: '#f1f3fb',
    borderRadius: 14,
    flex: 1,
    gap: 4,
    padding: 10,
  },
  statLabel: {
    color: '#858aa1',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#25233f',
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
  },
  startButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 34,
    height: 68,
    justifyContent: 'center',
    marginTop: 20,
    width: '84%',
    zIndex: 9,
  },
  startButtonText: {
    color: '#25233f',
    fontSize: 19,
    fontWeight: '900',
  },
});
