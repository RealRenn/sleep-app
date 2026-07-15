import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  awardTaskReward,
  loadRewardProgress,
  redeemReward,
  REDEEM_REWARDS,
  RewardProgress,
  TASK_HEALTH_REWARD,
} from '@/constants/rewards';

type Page = 'home' | 'calendar' | 'tasks' | 'analytics';
type GraphMetric = 'focus' | 'tasks' | 'sleep' | 'mood';

type WeeklyGraphConfig = {
  title: string;
  axis: string;
  unit: string;
  values: number[];
  min: number;
  max: number;
  ticks: number[];
};

const weeklyGraphs: Record<GraphMetric, WeeklyGraphConfig> = {
  focus: { title: 'Weekly focus trend', axis: 'FOCUS HOURS', unit: 'h', values: [8.4, 11.6, 9.8, 14.2, 12.5, 15.4, 14.3], min: 7, max: 16, ticks: [16, 14, 12, 10, 8, 7] },
  tasks: { title: 'Weekly tasks trend', axis: 'TASKS COMPLETED', unit: '', values: [2, 4, 3, 6, 5, 7, 5], min: 0, max: 8, ticks: [8, 6, 4, 2, 0] },
  sleep: { title: 'Weekly sleep trend', axis: 'SLEEP HOURS', unit: 'h', values: [7.2, 8.1, 6.8, 7.6, 7.1, 8.4, 7.8], min: 6, max: 9, ticks: [9, 8, 7, 6] },
  mood: { title: 'Weekly mood trend', axis: 'MOOD SCORE', unit: '/10', values: [5.4, 6.1, 5.8, 7.3, 6.8, 7.6, 6.8], min: 4, max: 10, ticks: [10, 8, 6, 4] },
};

type ScheduleItem = {
  time: string;
  title: string;
  place: string;
  type: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
};

type Task = {
  title: string;
  meta: string;
  done: boolean;
  rewarded?: boolean;
};

const schedule: ScheduleItem[] = [
  { time: '09:00', title: 'Calculus II', place: 'Hall B-201', type: 'Class', color: 'blue' },
  { time: '11:00', title: 'Problem Set 4', place: 'Library', type: 'Study', color: 'purple' },
  { time: '13:00', title: 'Biology 101', place: 'Lab 3', type: 'Class', color: 'green' },
  { time: '15:00', title: 'Lab Report', place: 'Library', type: 'Study', color: 'purple' },
  { time: '17:00', title: 'English Lit', place: 'Room 105', type: 'Class', color: 'orange' },
];

const initialTasks: Task[] = [
  { title: 'Review lab intro', meta: 'Today, 20 min', done: false },
  { title: 'Submit biology notes', meta: 'Tomorrow, 10 min', done: false },
  { title: 'Pack calculator', meta: 'Friday, 5 min', done: false },
];

const moodCopy: Record<number, { label: string; tip: string }> = {
  1: { label: 'Calm', tip: 'Keep this pace and protect your break after lunch.' },
  2: { label: 'Calm', tip: 'Keep this pace and protect your break after lunch.' },
  3: { label: 'Calm', tip: 'Keep this pace and protect your break after lunch.' },
  4: { label: 'Steady', tip: 'Take a 15 minute walk before the next study block.' },
  5: { label: 'Steady', tip: 'Take a 15 minute walk before the next study block.' },
  6: { label: 'Steady', tip: 'Take a 15 minute walk before the next study block.' },
  7: { label: 'Tense', tip: 'Move one task to tomorrow and start with the smallest step.' },
  8: { label: 'Tense', tip: 'Move one task to tomorrow and start with the smallest step.' },
  9: { label: 'Overloaded', tip: 'Clear the evening plan and choose rest first.' },
  10: { label: 'Overloaded', tip: 'Clear the evening plan and choose rest first.' },
};

const formatHeaderDate = (date: Date) => (
  date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
);

const formatMonth = (date: Date) => (
  date.toLocaleDateString('en-US', { month: 'long' })
);

const isSameDate = (first: Date, second: Date) => first.toDateString() === second.toDateString();

const getWeekDays = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  return Array.from({ length: 5 }).map((_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);

    return {
      key: day.toISOString(),
      label: day.toLocaleDateString('en-US', { weekday: 'short' }),
      date: day.getDate().toString(),
      fullDate: day,
      isToday: isSameDate(day, date),
    };
  });
};

export default function BalanceHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [today, setToday] = useState(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => new Date());
  const [nextFocusDone, setNextFocusDone] = useState(false);
  const [page, setPage] = useState<Page>('home');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [rewardProgress, setRewardProgress] = useState<RewardProgress>(() => loadRewardProgress());
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [mood, setMood] = useState(5);
  const [sleeping, setSleeping] = useState(false);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [selectedGraph, setSelectedGraph] = useState<GraphMetric | null>(null);
  const [redeemMessage, setRedeemMessage] = useState('');
  const openTasks = tasks.filter((task) => !task.done).length;
  const moodState = moodCopy[mood];
  const headerDate = formatHeaderDate(today).toUpperCase();
  const weekDays = getWeekDays(today);
  const selectedCalendarLabel = selectedCalendarDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const nextFocusProgress = nextFocusDone ? 100 : 45;
  const activeGraph = selectedGraph ? weeklyGraphs[selectedGraph] : null;

  useEffect(() => {
    const updateToday = () => setToday(new Date());
    const timer = setInterval(updateToday, 60 * 1000);
    setRewardProgress(loadRewardProgress());

    return () => clearInterval(timer);
  }, []);

  const toggleTask = (index: number) => {
    if (editingTaskIndex === index) {
      return;
    }

    const task = tasks[index];
    const shouldAward = task && !task.done && !task.rewarded;

    if (shouldAward) {
      setRewardProgress(awardTaskReward(rewardProgress));
    }

    setTasks((current) => current.map((currentTask, taskIndex) => taskIndex === index ? {
      ...currentTask,
      done: !currentTask.done,
      rewarded: currentTask.rewarded || shouldAward,
    } : currentTask));
  };

  const addTask = () => {
    setTasks((current) => [{ title: 'New focus block', meta: 'Today, 25 min', done: false, rewarded: false }, ...current]);
    setEditingTaskIndex(0);
    setPage('tasks');
  };

  const updateTask = (index: number, field: 'title' | 'meta', value: string) => {
    setTasks((current) => current.map((task, taskIndex) => taskIndex === index ? { ...task, [field]: value } : task));
  };

  const saveTask = () => {
    setEditingTaskIndex(null);
  };

  const deleteTask = (index: number) => {
    setTasks((current) => current.filter((_, taskIndex) => taskIndex !== index));
    setEditingTaskIndex((current) => {
      if (current === null) {
        return null;
      }

      if (current === index) {
        return null;
      }

      return current > index ? current - 1 : current;
    });
  };

  const planTomorrow = () => {
    setTasks((current) => [{ title: 'Lab report review', meta: 'Tomorrow, 25 min', done: false, rewarded: false }, ...current]);
  };

  const redeemPoints = (rewardId: string) => {
    const reward = REDEEM_REWARDS.find((item) => item.id === rewardId);

    if (!reward) {
      return;
    }

    if (rewardProgress.totalHealth < reward.cost) {
      setRedeemMessage(`Earn ${reward.cost - rewardProgress.totalHealth} more HP to redeem ${reward.title}.`);
      return;
    }

    setRewardProgress((currentProgress) => redeemReward(rewardId, currentProgress));
    setRedeemMessage(`${reward.title} redeemed.`);
  };

  const openCalendar = () => {
    const currentDate = new Date();
    setToday(currentDate);
    setSelectedCalendarDate(currentDate);
    setNextFocusDone(false);
    setPage('calendar');
  };

  if (!isSignedIn) {
    return (
      <View style={styles.signInRoot}>
        <StatusBar style="light" />
        <ScrollView
          bounces={false}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.signInContent, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 40 }]}>
          <View style={styles.signInHero}>
            <View style={styles.signInMark}>
              <Text style={styles.signInMarkText}>Zz</Text>
            </View>
            <Text selectable style={styles.signInTitle}>Balance</Text>
            <Text selectable style={styles.signInCopy}>Sign in to lock in your schedule, mood, and reward progress.</Text>
          </View>

          <View style={styles.signInCard}>
            <Text selectable style={styles.signInLabel}>Email</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="ren@example.com"
              placeholderTextColor="#8d97a8"
              style={styles.signInInput}
              value={email}
            />
            <Text selectable style={styles.signInLabel}>Password</Text>
            <TextInput
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#8d97a8"
              secureTextEntry
              style={styles.signInInput}
              value={password}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              onPress={() => setIsSignedIn(true)}
              style={styles.signInButton}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </Pressable>
            <Pressable onPress={() => setIsSignedIn(true)} style={styles.demoButton}>
              <Text style={styles.demoButtonText}>Continue as guest</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        bounces={false}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 120 }]}>
        <View style={styles.topbar}>
          <View style={styles.topbarText}>
            <Text selectable style={styles.kicker}>{headerDate}</Text>
            <Text selectable style={styles.title}>Good morning, Ren</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Start sleep session" onPress={() => setSleeping(true)} style={styles.sleepButton}>
            <Text style={styles.sleepButtonText}>Zz</Text>
          </Pressable>
        </View>

        {page === 'home' ? (
          <View>
            <View style={styles.panel}>
              <View style={styles.panelHead}>
                <View>
                  <Text selectable style={styles.kicker}>Last night</Text>
                  <Text selectable style={styles.panelTitle}>Sleep</Text>
                </View>
                <View style={styles.score}><Text style={styles.scoreText}>82</Text></View>
              </View>
              <View style={styles.sleepTotal}>
                <Text selectable style={styles.sleepTime}>7h 12m</Text>
                <Text selectable style={styles.muted}>23:15 to 06:30</Text>
              </View>
              <View style={styles.sleepChart}>
                {['deep', 'light', 'light', 'awake', 'deep', 'light', 'deep', 'light', 'awake', 'light'].map((stage, index) => (
                  <View key={index} style={[styles.stage, styles[stage as 'deep' | 'light' | 'awake'], { flex: index % 3 === 0 ? 1.2 : 0.8 }]} />
                ))}
              </View>
              <View style={styles.legend}>
                <Legend label="Deep" color="#6753dd" />
                <Legend label="Light" color="#9a88ed" />
                <Legend label="Awake" color="#ec9d93" />
              </View>
            </View>

            <SectionTitle title="Today" meta="5 blocks" />
            <View style={styles.timeline}>
              {schedule.map((item) => <ScheduleRow key={item.time + item.title} item={item} />)}
            </View>

            <View style={styles.smartPanel}>
              <View style={styles.smartText}>
                <Text selectable style={styles.smartKicker}>Smart reschedule</Text>
                <Text selectable style={styles.smartTitle}>All caught up</Text>
                <Text selectable style={styles.smartCopy}>No unfinished task needs moving.</Text>
              </View>
              <Pressable onPress={planTomorrow} style={styles.planButton}>
                <Text style={styles.planButtonText}>Plan</Text>
              </Pressable>
            </View>

            <MoodPanel mood={mood} setMood={setMood} moodState={moodState} onLock={() => setHandoffOpen(true)} />
          </View>
        ) : null}

        {page === 'calendar' ? (
          <View>
            <SectionTitle title="Calendar" meta={formatMonth(today)} />
            <View style={styles.weekStrip}>
              {weekDays.map((day) => (
                <Pressable
                  key={day.key}
                  onPress={() => {
                    setSelectedCalendarDate(day.fullDate);
                    setNextFocusDone(false);
                  }}
                  style={[styles.weekDay, isSameDate(day.fullDate, selectedCalendarDate) && styles.selectedWeekDay]}>
                  <Text style={[styles.weekDayText, isSameDate(day.fullDate, selectedCalendarDate) && styles.selectedWeekDayText]}>{day.label}</Text>
                  <Text style={[styles.weekDateText, isSameDate(day.fullDate, selectedCalendarDate) && styles.selectedWeekDayText]}>{day.date}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.panel}>
              <View style={styles.panelHead}>
                <View>
                  <Text selectable style={styles.kicker}>Next focus</Text>
                  <Text selectable style={styles.panelTitle}>Calculus review</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={nextFocusDone ? 'Mark next focus incomplete' : 'Mark next focus complete'}
                  onPress={() => setNextFocusDone((current) => !current)}
                  style={[styles.focusDoneButton, nextFocusDone && styles.focusDoneButtonActive]}>
                  <Text style={[styles.focusDoneText, nextFocusDone && styles.focusDoneTextActive]}>✓</Text>
                </Pressable>
              </View>
              <View style={styles.nextFocusBody}>
                <Text selectable style={styles.muted}>{selectedCalendarLabel}</Text>
                <Text selectable style={styles.muted}>09:00 - Problem set, lecture notes, and quiz corrections.</Text>
                <View style={styles.focusProgressHeader}>
                  <Text selectable style={styles.progressLabel}>{nextFocusDone ? 'Completed' : 'In progress'}</Text>
                  <Text selectable style={styles.progressLabel}>{nextFocusProgress}%</Text>
                </View>
                <View style={styles.focusProgressTrack}>
                  <View style={[styles.focusProgressFill, { width: `${nextFocusProgress}%` }]} />
                </View>
              </View>
            </View>
            <ScheduleCard title="English Lit" subtitle="17:00, Room 105" color="orange" />
            <ScheduleCard title="Biology 101" subtitle="13:00, Lab 3" color="green" />
          </View>
        ) : null}

        {page === 'tasks' ? (
          <View>
            <SectionTitle title="Tasks" meta={openTasks + ' open'} />
            <View style={styles.taskRewardBanner}>
              <View>
                <Text selectable style={styles.kicker}>Lumi-style rewards</Text>
                <Text selectable style={styles.taskRewardTitle}>{rewardProgress.totalHealth.toLocaleString()} HP earned</Text>
              </View>
              <Text selectable style={styles.taskRewardPill}>+{TASK_HEALTH_REWARD} HP/task</Text>
            </View>
            <View style={styles.timeline}>
              {tasks.map((task, index) => (
                editingTaskIndex === index ? (
                  <View key={'editing-' + index} style={styles.taskEditRow}>
                    <TextInput
                      autoFocus
                      onChangeText={(value) => updateTask(index, 'title', value)}
                      placeholder="Task name"
                      placeholderTextColor="#8d97a8"
                      style={styles.taskEditTitle}
                      value={task.title}
                    />
                    <TextInput
                      onChangeText={(value) => updateTask(index, 'meta', value)}
                      placeholder="Today, 25 min"
                      placeholderTextColor="#8d97a8"
                      style={styles.taskEditMeta}
                      value={task.meta}
                    />
                    <Pressable onPress={saveTask} style={styles.saveTaskButton}>
                      <Text style={styles.saveTaskText}>Save</Text>
                    </Pressable>
                    <Pressable onPress={() => deleteTask(index)} style={styles.deleteTaskWideButton}>
                      <Text style={styles.deleteTaskWideText}>Delete</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View key={task.title + index} style={[styles.taskRow, task.done && styles.taskDone]}>
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: task.done }}
                      onPress={() => toggleTask(index)}
                      style={[styles.checkbox, task.done && styles.checkboxDone]}
                    />
                    <View style={styles.taskTextBlock}>
                      <Text selectable style={styles.taskTitle}>{task.title}</Text>
                      <Text selectable style={styles.muted}>{task.meta}</Text>
                    </View>
                    <Pressable onPress={() => setEditingTaskIndex(index)} style={styles.editTaskButton}>
                      <Text style={styles.editTaskText}>Edit</Text>
                    </Pressable>
                    <Pressable onPress={() => deleteTask(index)} style={styles.deleteTaskButton}>
                      <Text style={styles.deleteTaskText}>Delete</Text>
                    </Pressable>
                  </View>
                )
              ))}
            </View>
          </View>
        ) : null}

        {page === 'analytics' ? (
          <View>
            <SectionTitle title="Stats" meta="This week" />
            <View style={styles.questHero}>
              <View style={styles.questGlowOne} /><View style={styles.questGlowTwo} />
              <View style={styles.questHeroTop}><View><Text selectable style={styles.questKicker}>SLEEP QUEST · CHAPTER 02</Text><Text selectable style={styles.questTitle}>Dreamland awaits</Text><Text selectable style={styles.questCopy}>Keep your rhythm steady to unlock your next reward.</Text></View><View style={styles.questMoon}><Text style={styles.questMoonText}>☾</Text></View></View>
              <View style={styles.questProgressHead}><Text selectable style={styles.questProgressText}>1,240 points to next reward</Text><Text selectable style={styles.questProgressText}>62%</Text></View>
              <View style={styles.questTrack}><View style={styles.questFill} /><View style={styles.questMarker}><Text style={styles.questMarkerText}>★</Text></View></View>
              <View style={styles.questStops}><Text selectable style={styles.questStopDone}>●</Text><Text selectable style={styles.questStopDone}>●</Text><Text selectable style={styles.questStopNext}>○</Text><Text selectable style={styles.questStopNext}>○</Text></View>
            </View>
            <View style={styles.statsRewardPanel}>
              <View style={styles.panelHead}>
                <View>
                  <Text selectable style={styles.kicker}>Your wellbeing stash</Text>
                  <Text selectable style={styles.panelTitle}>{rewardProgress.coins.toLocaleString()} glow coins</Text>
                </View>
                <View style={styles.statsHpBadge}>
                  <Text selectable style={styles.statsHpText}>✦ {rewardProgress.totalHealth.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.statsRewardGrid}>
                <View style={styles.statsMiniCard}>
                  <Text selectable style={styles.metricLabel}>Glow points</Text>
                  <Text selectable style={styles.metricValue}>{rewardProgress.totalHealth.toLocaleString()}</Text>
                </View>
                <View style={styles.statsMiniCard}>
                  <Text selectable style={styles.metricLabel}>Coins saved</Text>
                  <Text selectable style={styles.metricValue}>{rewardProgress.coins.toLocaleString()}</Text>
                </View>
                <View style={styles.statsMiniCard}>
                  <Text selectable style={styles.metricLabel}>Redeemed</Text>
                  <Text selectable style={styles.metricValue}>{rewardProgress.redeemedRewards}</Text>
                </View>
              </View>
            </View>

            <View style={styles.redeemPanel}>
              <View style={styles.panelHead}>
                <View><Text selectable style={styles.kicker}>Rewards shop</Text><Text selectable style={styles.panelTitle}>Pick a little treat</Text></View>
                <Text selectable style={styles.availablePoints}>✦ {rewardProgress.totalHealth.toLocaleString()}</Text>
              </View>
              <Text selectable style={styles.redeemIntro}>Healthy choices earn glow points. Spend them on something that makes your day brighter.</Text>
              <View style={styles.redeemList}>
                {REDEEM_REWARDS.map((reward, index) => {
                  const canRedeem = rewardProgress.totalHealth >= reward.cost;
                  const icons = ['☕', '♫', '✦'];

                  return (
                    <View key={reward.id} style={[styles.redeemRow, index === 1 && styles.redeemRowCoral, index === 2 && styles.redeemRowPurple]}>
                      <View style={[styles.rewardIcon, index === 1 && styles.rewardIconCoral, index === 2 && styles.rewardIconPurple]}><Text style={styles.rewardIconText}>{icons[index] ?? '✦'}</Text></View>
                      <View style={styles.redeemTextBlock}>
                        <Text selectable style={styles.redeemTitle}>{reward.title}</Text>
                        <Text selectable style={styles.muted}>{reward.detail}</Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        disabled={!canRedeem}
                        onPress={() => redeemPoints(reward.id)}
                        style={[styles.redeemButton, !canRedeem && styles.redeemButtonDisabled]}>
                        <Text style={[styles.redeemButtonText, !canRedeem && styles.redeemButtonTextDisabled]}>
                          {canRedeem ? `${reward.cost} HP` : 'Locked'}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
              {redeemMessage ? <Text selectable style={styles.redeemMessage}>{redeemMessage}</Text> : null}
            </View>

            <View style={styles.metricGrid}>
              <Metric label="Focus" value="12.5h" onPress={() => setSelectedGraph('focus')} />
              <Metric label="Tasks" value={rewardProgress.completedTasks.toString()} onPress={() => setSelectedGraph('tasks')} />
              <Metric label="Sleep" value="7.1h" onPress={() => setSelectedGraph('sleep')} />
              <Metric label="Mood" value="6.8" onPress={() => setSelectedGraph('mood')} />
            </View>
            <View style={styles.panel}><Text style={styles.kicker}>Pattern</Text><Text style={styles.panelTitle}>Better mornings</Text><Text style={styles.muted}>Focus blocks before lunch are completed most often.</Text></View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.bottomNav}>
        <NavButton label="Home" active={page === 'home'} onPress={() => setPage('home')} />
        <NavButton label="Calendar" active={page === 'calendar'} onPress={openCalendar} />
        <Pressable onPress={addTask} style={styles.addButton}><Text style={styles.addText}>+</Text></Pressable>
        <NavButton label="Tasks" active={page === 'tasks'} onPress={() => setPage('tasks')} />
        <NavButton label="Stats" active={page === 'analytics'} onPress={() => setPage('analytics')} />
      </View>

      {sleeping ? (
        <View style={styles.sleepOverlay}>
          <View style={styles.sleepModal}>
            <View style={styles.sleepMoon}><Text style={styles.sleepButtonText}>Zz</Text></View>
            <Text selectable style={styles.sleepTitle}>Sleep Session Active</Text>
            <Text selectable style={styles.muted}>Balance is paused until 06:30.</Text>
            <Pressable onPress={() => setSleeping(false)} style={styles.endSleepButton}>
              <Text style={styles.endSleepText}>End Session</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {handoffOpen ? (
        <View style={styles.sleepOverlay}>
          <View style={styles.sleepModal}>
            <View style={styles.sleepMoon}><Text style={styles.sleepButtonText}>Zz</Text></View>
            <Text selectable style={styles.sleepTitle}>Mood Locked</Text>
            <Text selectable style={styles.muted}>Your balance page is paused. Continue into reward mode when you are ready.</Text>
            <Pressable onPress={() => router.push('/flight')} style={styles.endSleepButton}>
              <Text style={styles.endSleepText}>Continue</Text>
            </Pressable>
            <Pressable onPress={() => setHandoffOpen(false)} style={styles.secondaryAction}>
              <Text style={styles.secondaryText}>Stay Here</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {activeGraph ? (
        <View style={styles.sleepOverlay}>
          <View style={styles.focusGraphModal}>
            <View style={styles.graphHeader}>
              <View>
                <Text selectable style={styles.kicker}>Weekly trend</Text>
                <Text selectable style={styles.sleepTitle}>{activeGraph.title}</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Close weekly trend graph" onPress={() => setSelectedGraph(null)} style={styles.closeGraphButton}>
                <Text style={styles.closeGraphText}>×</Text>
              </Pressable>
            </View>
            <View style={styles.trendCallout}><Text selectable style={styles.trendArrow}>↗</Text><Text selectable style={styles.trendCopy}>Weekly sample pattern</Text></View>
            <WeeklyTrendChart graph={activeGraph} />
            <View style={styles.focusGraphSummary}>
              <View><Text selectable style={styles.metricLabel}>Weekly total</Text><Text selectable style={styles.graphSummaryValue}>{activeGraph.values.reduce((total, value) => total + value, 0).toFixed(1)}{activeGraph.unit}</Text></View>
              <View><Text selectable style={styles.metricLabel}>Daily average</Text><Text selectable style={styles.graphSummaryValue}>{(activeGraph.values.reduce((total, value) => total + value, 0) / activeGraph.values.length).toFixed(1)}{activeGraph.unit}</Text></View>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function SectionTitle({ title, meta }: { title: string; meta: string }) {
  return <View style={styles.sectionTitle}><Text selectable style={styles.sectionHeading}>{title}</Text><Text selectable style={styles.sectionMeta}>{meta}</Text></View>;
}

function Legend({ label, color }: { label: string; color: string }) {
  return <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: color }]} /><Text style={styles.legendText}>{label}</Text></View>;
}

function ScheduleRow({ item }: { item: ScheduleItem }) {
  return <View style={styles.timelineRow}><Text selectable style={styles.timeText}>{item.time}</Text><ScheduleCard title={item.title} subtitle={item.type + ' - ' + item.place} color={item.color} tag={item.type} /></View>;
}

function ScheduleCard({ title, subtitle, color, tag }: { title: string; subtitle: string; color: ScheduleItem['color']; tag?: string }) {
  return <View style={styles.compactCard}><View style={[styles.dot, styles[color]]} /><View style={styles.cardText}><Text selectable style={styles.cardTitle}>{title}</Text><Text selectable style={styles.muted}>{subtitle}</Text></View>{tag ? <Text style={styles.tag}>{tag}</Text> : null}</View>;
}

function MoodPanel({ mood, setMood, moodState, onLock }: { mood: number; setMood: (value: number) => void; moodState: { label: string; tip: string }; onLock: () => void }) {
  return <View style={[styles.panel, styles.moodPanel]}><View style={styles.panelHead}><View><Text style={styles.kicker}>Stress and mood</Text><Text selectable style={styles.panelTitle}>{moodState.label}</Text></View><Text selectable style={styles.panelStrong}>{mood}/10</Text></View><View style={styles.faces}><Text>:)</Text><Text>:|</Text><Text>:/</Text><Text>:(</Text></View><View style={styles.moodSteps}>{Array.from({ length: 10 }).map((_, index) => <Pressable key={index} onPress={() => setMood(index + 1)} style={[styles.moodStep, mood >= index + 1 && styles.moodStepActive]} />)}</View><View style={styles.tipBox}><Text style={styles.tipTitle}>Wellness tip</Text><Text selectable style={styles.tipCopy}>{moodState.tip}</Text></View><Pressable onPress={onLock} style={styles.primaryAction}><Text style={styles.primaryText}>Lock Mood</Text></Pressable></View>;
}

function Metric({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  const content = <><Text style={styles.metricLabel}>{label}</Text><Text selectable style={styles.metricValue}>{value}</Text>{onPress ? <Text style={styles.metricHint}>View week</Text> : null}</>;
  return onPress ? <Pressable accessibilityRole="button" accessibilityLabel={`View weekly ${label.toLowerCase()} graph`} onPress={onPress} style={[styles.metric, styles.metricButton]}>{content}</Pressable> : <View style={styles.metric}>{content}</View>;
}

function WeeklyTrendChart({ graph }: { graph: WeeklyGraphConfig }) {
  const { values, min, max, ticks, unit, axis } = graph;
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [plotWidth, setPlotWidth] = useState(0);
  const chartHeight = 190;
  const points = values.map((value, index) => ({
    value,
    label: labels[index],
    x: plotWidth * index / (values.length - 1),
    y: chartHeight - ((value - min) / (max - min)) * chartHeight,
  }));
  const segments = points.slice(0, -1).map((point, index) => {
    const next = points[index + 1];
    const deltaX = next.x - point.x;
    const deltaY = next.y - point.y;

    return { left: point.x, top: point.y, width: Math.hypot(deltaX, deltaY), rotate: `${Math.atan2(deltaY, deltaX) * 180 / Math.PI}deg` };
  });

  return <View style={styles.classicGraph}>
    <Text selectable style={styles.axisTitle}>{axis}</Text>
    <View style={styles.graphBody}>
      <View style={styles.graphScale}>{ticks.map((tick) => <Text key={tick} selectable style={styles.graphScaleText}>{tick}{unit}</Text>)}</View>
      <View style={styles.graphRight}>
        <View onLayout={(event) => setPlotWidth(event.nativeEvent.layout.width)} style={styles.graphPlot}>
          {ticks.map((_, index) => <View key={index} style={[styles.graphGridLine, { top: `${(index / (ticks.length - 1)) * 100}%` }]} />)}
          {plotWidth > 0 ? segments.map((segment, index) => <View key={index} style={[styles.graphLine, { left: segment.left, top: segment.top, transform: [{ rotate: segment.rotate }], width: segment.width }]} />) : null}
          {plotWidth > 0 ? points.map((point) => <View key={point.label} style={[styles.graphPointColumn, { left: point.x, top: point.y }]}><Text selectable style={styles.graphValue}>{point.value}{unit}</Text><View style={styles.graphPoint} /></View>) : null}
        </View>
        <View style={styles.graphDaysRow}>{labels.map((label) => <Text key={label} selectable style={styles.graphDay}>{label}</Text>)}</View>
      </View>
    </View>
    <Text selectable style={styles.xAxisTitle}>DAYS</Text>
  </View>;
}

function NavButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.navButton, active && styles.activeNavButton]}><Text style={[styles.navText, active && styles.activeNavText]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#eef0ff' },
  signInRoot: { flex: 1, backgroundColor: '#0f1726' },
  signInContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 22 },
  signInHero: { alignItems: 'center', gap: 12, marginBottom: 28 },
  signInMark: { alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 8, height: 64, justifyContent: 'center', width: 64 },
  signInMarkText: { color: '#152033', fontSize: 20, fontWeight: '900' },
  signInTitle: { color: '#ffffff', fontSize: 42, fontWeight: '900', lineHeight: 46 },
  signInCopy: { color: '#b9c4d8', fontSize: 16, fontWeight: '700', lineHeight: 23, maxWidth: 300, textAlign: 'center' },
  signInCard: { backgroundColor: '#ffffff', borderRadius: 8, gap: 10, padding: 18, boxShadow: '0 18px 48px rgba(0,0,0,0.24)' },
  signInLabel: { color: '#152033', fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  signInInput: { backgroundColor: '#eef4f7', borderColor: '#dbe4ef', borderRadius: 8, borderWidth: 1, color: '#152033', fontSize: 16, fontWeight: '700', minHeight: 52, paddingHorizontal: 14 },
  signInButton: { alignItems: 'center', backgroundColor: '#152033', borderRadius: 8, minHeight: 52, justifyContent: 'center', marginTop: 8 },
  signInButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
  demoButton: { alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  demoButtonText: { color: '#6753dd', fontSize: 15, fontWeight: '900' },
  content: { paddingHorizontal: 16 },
  topbar: { alignItems: 'center', flexDirection: 'row', gap: 16, justifyContent: 'space-between', marginBottom: 22 },
  topbarText: { flex: 1 },
  kicker: { color: '#768399', fontSize: 13, fontWeight: '800', marginBottom: 5, textTransform: 'uppercase' },
  title: { color: '#152033', fontSize: 30, fontWeight: '900', lineHeight: 32 },
  sleepButton: { alignItems: 'center', backgroundColor: '#152033', borderRadius: 8, height: 48, justifyContent: 'center', width: 48 },
  sleepButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
  panel: { backgroundColor: '#ffffff', borderColor: '#e1e0f5', borderRadius: 20, borderWidth: 1, padding: 18, boxShadow: '0 14px 34px rgba(55,46,110,0.12)' },
  panelHead: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  panelTitle: { color: '#152033', fontSize: 21, fontWeight: '900' },
  panelStrong: { color: '#152033', fontSize: 20, fontWeight: '900' },
  nextFocusBody: { gap: 10, marginTop: 14 },
  focusDoneButton: { alignItems: 'center', backgroundColor: '#eef4f7', borderColor: '#dbe4ef', borderRadius: 8, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 },
  focusDoneButtonActive: { backgroundColor: '#45a86e', borderColor: '#45a86e' },
  focusDoneText: { color: '#768399', fontSize: 22, fontWeight: '900', lineHeight: 24 },
  focusDoneTextActive: { color: '#ffffff' },
  focusProgressHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  progressLabel: { color: '#657189', fontSize: 13, fontWeight: '900' },
  focusProgressTrack: { backgroundColor: '#e4e9f1', borderRadius: 8, height: 10, overflow: 'hidden' },
  focusProgressFill: { backgroundColor: '#6753dd', borderRadius: 8, height: '100%' },
  score: { alignItems: 'center', backgroundColor: '#45a86e', borderRadius: 8, height: 52, justifyContent: 'center', width: 52 },
  scoreText: { color: '#ffffff', fontSize: 22, fontWeight: '900' },
  sleepTotal: { gap: 4, marginBottom: 14, marginTop: 20 },
  sleepTime: { color: '#152033', fontSize: 42, fontWeight: '900', lineHeight: 44 },
  muted: { color: '#768399', fontSize: 14, fontWeight: '700' },
  sleepChart: { backgroundColor: '#f4f0ff', borderRadius: 8, flexDirection: 'row', gap: 4, height: 92, padding: 12 },
  stage: { borderRadius: 5 },
  deep: { backgroundColor: '#6753dd' },
  light: { backgroundColor: '#9a88ed' },
  awake: { backgroundColor: '#ec9d93' },
  legend: { flexDirection: 'row', gap: 12, marginTop: 14 },
  legendItem: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  legendDot: { borderRadius: 6, height: 11, width: 11 },
  legendText: { color: '#59667c', fontSize: 13, fontWeight: '800' },
  sectionTitle: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, marginTop: 24 },
  sectionHeading: { color: '#152033', fontSize: 21, fontWeight: '900' },
  sectionMeta: { color: '#768399', fontSize: 14, fontWeight: '800' },
  timeline: { gap: 12 },
  timelineRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  timeText: { color: '#657189', fontSize: 14, fontWeight: '900', width: 56 },
  compactCard: { alignItems: 'center', backgroundColor: '#ffffff', borderColor: '#e4e9f1', borderRadius: 8, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 12, minHeight: 76, padding: 14, boxShadow: '0 14px 34px rgba(40,55,85,0.12)' },
  dot: { borderRadius: 6, height: 12, width: 12 },
  blue: { backgroundColor: '#3378d8' },
  purple: { backgroundColor: '#6753dd' },
  green: { backgroundColor: '#45a86e' },
  orange: { backgroundColor: '#e2764b' },
  cardText: { flex: 1 },
  cardTitle: { color: '#152033', fontSize: 16, fontWeight: '900', marginBottom: 4 },
  tag: { backgroundColor: '#f0edff', borderRadius: 999, color: '#6753dd', fontSize: 11, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 5 },
  smartPanel: { alignItems: 'center', backgroundColor: '#6753dd', borderRadius: 20, flexDirection: 'row', gap: 14, marginTop: 18, padding: 16 },
  smartText: { flex: 1 },
  smartKicker: { color: 'rgba(255,255,255,0.78)', fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  smartTitle: { color: '#ffffff', fontSize: 21, fontWeight: '900' },
  smartCopy: { color: 'rgba(255,255,255,0.78)', fontSize: 14, fontWeight: '700', marginTop: 6 },
  planButton: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, minHeight: 44, justifyContent: 'center', minWidth: 70 },
  planButtonText: { color: '#ffffff', fontWeight: '900' },
  moodPanel: { marginTop: 18 },
  faces: { color: '#626f85', flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 4, marginBottom: 8, marginTop: 24 },
  moodSteps: { flexDirection: 'row', gap: 5, marginTop: 12 },
  moodStep: { backgroundColor: '#e4e9f1', borderRadius: 5, flex: 1, height: 10 },
  moodStepActive: { backgroundColor: '#df6689' },
  tipBox: { backgroundColor: '#fff7e9', borderColor: '#f2e1c2', borderRadius: 8, borderWidth: 1, marginBottom: 16, marginTop: 20, padding: 14 },
  tipTitle: { color: '#152033', fontSize: 16, fontWeight: '900', marginBottom: 5 },
  tipCopy: { color: '#5d6574', fontSize: 14, fontWeight: '700', lineHeight: 20 },
  primaryAction: { alignItems: 'center', backgroundColor: '#df6689', borderRadius: 8, minHeight: 48, justifyContent: 'center' },
  primaryText: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
  weekStrip: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  weekDay: { alignItems: 'center', backgroundColor: '#ffffff', borderColor: '#e4e9f1', borderRadius: 8, borderWidth: 1, flex: 1, minHeight: 74, justifyContent: 'center' },
  selectedWeekDay: { backgroundColor: '#6753dd' },
  weekDayText: { color: '#768399', fontSize: 13, fontWeight: '900' },
  weekDateText: { color: '#152033', fontSize: 18, fontWeight: '900', marginTop: 6 },
  selectedWeekDayText: { color: '#ffffff' },
  taskRewardBanner: { alignItems: 'center', backgroundColor: '#ffffff', borderColor: '#e4e9f1', borderRadius: 8, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, padding: 14, boxShadow: '0 14px 34px rgba(40,55,85,0.12)' },
  taskRewardTitle: { color: '#152033', fontSize: 18, fontWeight: '900' },
  taskRewardPill: { backgroundColor: '#f0edff', borderRadius: 999, color: '#6753dd', fontSize: 13, fontVariant: ['tabular-nums'], fontWeight: '900', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 7 },
  taskRow: { alignItems: 'center', backgroundColor: '#ffffff', borderColor: '#e4e9f1', borderRadius: 8, borderWidth: 1, flexDirection: 'row', gap: 12, padding: 14 },
  taskDone: { opacity: 0.55 },
  checkbox: { borderColor: '#768399', borderRadius: 5, borderWidth: 2, height: 20, width: 20 },
  checkboxDone: { backgroundColor: '#45a86e', borderColor: '#45a86e' },
  taskTextBlock: { flex: 1 },
  taskTitle: { color: '#152033', fontSize: 16, fontWeight: '900' },
  taskEditRow: { backgroundColor: '#ffffff', borderColor: '#6753dd', borderRadius: 8, borderWidth: 2, gap: 10, padding: 14 },
  taskEditTitle: { backgroundColor: '#eef4f7', borderColor: '#dbe4ef', borderRadius: 8, borderWidth: 1, color: '#152033', fontSize: 16, fontWeight: '900', minHeight: 48, paddingHorizontal: 12 },
  taskEditMeta: { backgroundColor: '#eef4f7', borderColor: '#dbe4ef', borderRadius: 8, borderWidth: 1, color: '#657189', fontSize: 14, fontWeight: '800', minHeight: 46, paddingHorizontal: 12 },
  saveTaskButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#152033', borderRadius: 8, minHeight: 42, justifyContent: 'center', paddingHorizontal: 18 },
  saveTaskText: { color: '#ffffff', fontSize: 14, fontWeight: '900' },
  editTaskButton: { alignItems: 'center', borderColor: '#e4e9f1', borderRadius: 8, borderWidth: 1, minHeight: 38, justifyContent: 'center', paddingHorizontal: 12 },
  editTaskText: { color: '#657189', fontSize: 13, fontWeight: '900' },
  deleteTaskButton: { alignItems: 'center', borderColor: '#ffd8df', borderRadius: 8, borderWidth: 1, minHeight: 38, justifyContent: 'center', paddingHorizontal: 12 },
  deleteTaskText: { color: '#df6689', fontSize: 13, fontWeight: '900' },
  deleteTaskWideButton: { alignItems: 'center', alignSelf: 'flex-start', borderColor: '#ffd8df', borderRadius: 8, borderWidth: 1, minHeight: 42, justifyContent: 'center', paddingHorizontal: 18 },
  deleteTaskWideText: { color: '#df6689', fontSize: 14, fontWeight: '900' },
  questHero: { backgroundColor: '#17234a', borderRadius: 24, marginBottom: 14, overflow: 'hidden', padding: 20 },
  questGlowOne: { backgroundColor: '#7b61ff', borderRadius: 110, height: 220, opacity: 0.68, position: 'absolute', right: -82, top: -94, width: 220 },
  questGlowTwo: { backgroundColor: '#ff7a91', borderRadius: 80, bottom: -58, height: 150, left: -64, opacity: 0.52, position: 'absolute', width: 150 },
  questHeroTop: { alignItems: 'flex-start', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  questKicker: { color: '#c8c1ff', fontSize: 11, fontWeight: '900', letterSpacing: 0.7 },
  questTitle: { color: '#ffffff', fontSize: 27, fontWeight: '900', marginTop: 6 },
  questCopy: { color: '#d9e0ff', fontSize: 13, fontWeight: '700', lineHeight: 19, marginTop: 6, maxWidth: '80%' },
  questMoon: { alignItems: 'center', backgroundColor: '#fff2a8', borderRadius: 34, height: 62, justifyContent: 'center', width: 62 },
  questMoonText: { color: '#644ed4', fontSize: 36, fontWeight: '900', marginTop: -4 },
  questProgressHead: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  questProgressText: { color: '#ffffff', fontSize: 12, fontVariant: ['tabular-nums'], fontWeight: '900' },
  questTrack: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 10, height: 11, marginTop: 8, overflow: 'visible' },
  questFill: { backgroundColor: '#fff2a8', borderRadius: 10, height: '100%', width: '62%' },
  questMarker: { alignItems: 'center', backgroundColor: '#ff7a91', borderColor: '#ffffff', borderRadius: 13, borderWidth: 2, height: 26, justifyContent: 'center', left: '58%', position: 'absolute', top: -8, width: 26 },
  questMarkerText: { color: '#ffffff', fontSize: 12 },
  questStops: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  questStopDone: { color: '#fff2a8', fontSize: 14 },
  questStopNext: { color: '#bdb6ed', fontSize: 14 },
  statsRewardPanel: { backgroundColor: '#ffffff', borderColor: '#e1e0f5', borderRadius: 20, borderWidth: 1, gap: 14, marginBottom: 14, padding: 18, boxShadow: '0 14px 34px rgba(64,51,120,0.12)' },
  statsHpBadge: { alignItems: 'center', backgroundColor: '#ff7a91', borderRadius: 16, minHeight: 44, justifyContent: 'center', paddingHorizontal: 14 },
  statsHpText: { color: '#ffffff', fontSize: 15, fontVariant: ['tabular-nums'], fontWeight: '900' },
  statsRewardGrid: { flexDirection: 'row', gap: 10 },
  statsMiniCard: { backgroundColor: '#f5f2ff', borderColor: '#e1dcff', borderRadius: 14, borderWidth: 1, flex: 1, gap: 6, padding: 12 },
  redeemPanel: { backgroundColor: '#ffffff', borderColor: '#e1e0f5', borderRadius: 20, borderWidth: 1, gap: 14, marginBottom: 14, padding: 18, boxShadow: '0 14px 34px rgba(64,51,120,0.12)' },
  availablePoints: { backgroundColor: '#fff2a8', borderRadius: 999, color: '#6348c9', fontSize: 12, fontVariant: ['tabular-nums'], fontWeight: '900', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 7 },
  redeemIntro: { color: '#657189', fontSize: 14, fontWeight: '700', lineHeight: 20 },
  redeemList: { gap: 10 },
  redeemRow: { alignItems: 'center', backgroundColor: '#eef8ff', borderColor: '#d5eafa', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 12, padding: 12 },
  redeemRowCoral: { backgroundColor: '#fff0f3', borderColor: '#ffd6df' },
  redeemRowPurple: { backgroundColor: '#f3efff', borderColor: '#dfd5ff' },
  rewardIcon: { alignItems: 'center', backgroundColor: '#4ba8db', borderRadius: 16, height: 46, justifyContent: 'center', width: 46 },
  rewardIconCoral: { backgroundColor: '#ff7a91' },
  rewardIconPurple: { backgroundColor: '#7b61ff' },
  rewardIconText: { color: '#ffffff', fontSize: 21 },
  redeemTextBlock: { flex: 1 },
  redeemTitle: { color: '#152033', fontSize: 16, fontWeight: '900', marginBottom: 4 },
  redeemButton: { alignItems: 'center', backgroundColor: '#17234a', borderRadius: 14, minHeight: 42, justifyContent: 'center', minWidth: 82, paddingHorizontal: 12 },
  redeemButtonDisabled: { backgroundColor: '#e4e9f1' },
  redeemButtonText: { color: '#ffffff', fontSize: 13, fontVariant: ['tabular-nums'], fontWeight: '900' },
  redeemButtonTextDisabled: { color: '#768399' },
  redeemMessage: { color: '#45a86e', fontSize: 14, fontWeight: '900' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
  metric: { backgroundColor: '#ffffff', borderColor: '#e4e9f1', borderRadius: 8, borderWidth: 1, padding: 18, width: '48%' },
  metricButton: { alignItems: 'flex-start' },
  metricLabel: { color: '#768399', fontWeight: '800' },
  metricValue: { color: '#152033', fontSize: 28, fontWeight: '900', marginTop: 8 },
  metricHint: { color: '#6753dd', fontSize: 12, fontWeight: '900', marginTop: 8 },
  bottomNav: { alignItems: 'center', alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.92)', borderColor: 'rgba(228,233,241,0.82)', borderRadius: 8, borderWidth: 1, bottom: 12, flexDirection: 'row', gap: 4, height: 74, justifyContent: 'space-between', padding: 8, position: 'absolute', width: '94%', boxShadow: '0 14px 40px rgba(34,47,71,0.18)' },
  navButton: { alignItems: 'center', borderRadius: 8, flex: 1, height: 48, justifyContent: 'center' },
  activeNavButton: { backgroundColor: '#6753dd' },
  navText: { color: '#768399', fontSize: 12, fontWeight: '900' },
  activeNavText: { color: '#ffffff' },
  addButton: { alignItems: 'center', backgroundColor: '#152033', borderRadius: 8, height: 54, justifyContent: 'center', width: 54 },
  addText: { color: '#ffffff', fontSize: 30, fontWeight: '800', lineHeight: 32 },
  sleepOverlay: { alignItems: 'center', backgroundColor: 'rgba(21,32,51,0.66)', bottom: 0, justifyContent: 'center', left: 0, padding: 24, position: 'absolute', right: 0, top: 0 },
  sleepModal: { alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 8, padding: 24, width: '88%' },
  sleepMoon: { alignItems: 'center', backgroundColor: '#152033', borderRadius: 8, height: 58, justifyContent: 'center', marginBottom: 14, width: 58 },
  sleepTitle: { color: '#152033', fontSize: 22, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  endSleepButton: { alignItems: 'center', backgroundColor: '#152033', borderRadius: 8, minHeight: 44, justifyContent: 'center', marginTop: 18, width: '100%' },
  endSleepText: { color: '#ffffff', fontWeight: '900' },
  secondaryAction: { alignItems: 'center', borderColor: '#e4e9f1', borderRadius: 8, borderWidth: 1, minHeight: 44, justifyContent: 'center', marginTop: 10, width: '100%' },
  secondaryText: { color: '#152033', fontWeight: '900' },
  focusGraphModal: { backgroundColor: '#ffffff', borderRadius: 8, gap: 10, padding: 22, width: '88%' },
  graphHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  closeGraphButton: { alignItems: 'center', backgroundColor: '#eef4f7', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  closeGraphText: { color: '#152033', fontSize: 27, fontWeight: '500', lineHeight: 30 },
  classicGraph: { alignItems: 'center', gap: 8, marginTop: 16 },
  axisTitle: { color: '#657189', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  graphBody: { alignSelf: 'stretch', flexDirection: 'row', gap: 8, height: 222 },
  graphScale: { height: 190, justifyContent: 'space-between', paddingBottom: 1, width: 25 },
  graphScaleText: { color: '#657189', fontSize: 10, fontVariant: ['tabular-nums'], fontWeight: '900', textAlign: 'right' },
  graphRight: { flex: 1 },
  graphPlot: { height: 190, position: 'relative' },
  graphGridLine: { backgroundColor: '#cbd5e1', height: 1.5, left: 0, position: 'absolute', right: 0 },
  graphLine: { backgroundColor: '#3378d8', height: 4, position: 'absolute', transformOrigin: 'left center' },
  graphPointColumn: { alignItems: 'center', marginLeft: -18, marginTop: -22, position: 'absolute', width: 36 },
  graphPoint: { backgroundColor: '#3378d8', borderColor: '#ffffff', borderRadius: 8, borderWidth: 2, height: 13, marginTop: 2, width: 13 },
  graphValue: { color: '#152033', fontSize: 10, fontVariant: ['tabular-nums'], fontWeight: '900', marginBottom: 1 },
  graphDaysRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingHorizontal: 1 },
  graphDay: { color: '#657189', fontSize: 10, fontWeight: '900', textAlign: 'center', width: 30 },
  xAxisTitle: { color: '#657189', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  focusGraphSummary: { backgroundColor: '#f4f0ff', borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', marginTop: 2, padding: 14 },
  graphSummaryValue: { color: '#152033', fontSize: 18, fontVariant: ['tabular-nums'], fontWeight: '900', marginTop: 4 },
  trendCallout: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  trendArrow: { color: '#45a86e', fontSize: 19, fontWeight: '900' },
  trendCopy: { color: '#45a86e', fontSize: 13, fontWeight: '900' },
});
