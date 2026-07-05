import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Page = 'home' | 'calendar' | 'tasks' | 'analytics';

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

export default function BalanceHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [page, setPage] = useState<Page>('home');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [mood, setMood] = useState(5);
  const [sleeping, setSleeping] = useState(false);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const openTasks = tasks.filter((task) => !task.done).length;
  const moodState = moodCopy[mood];

  const toggleTask = (index: number) => {
    setTasks((current) => current.map((task, taskIndex) => taskIndex === index ? { ...task, done: !task.done } : task));
  };

  const addTask = () => {
    setTasks((current) => [{ title: 'New focus block', meta: 'Today, 25 min', done: false }, ...current]);
    setPage('tasks');
  };

  const planTomorrow = () => {
    setTasks((current) => [{ title: 'Lab report review', meta: 'Tomorrow, 25 min', done: false }, ...current]);
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
            <Text selectable style={styles.signInCopy}>Sign in to lock in your schedule, mood, and flight mode.</Text>
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
            <Text selectable style={styles.kicker}>Thursday, Jul 2</Text>
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
            <SectionTitle title="Calendar" meta="July" />
            <View style={styles.weekStrip}>
              {['Mon 29', 'Tue 30', 'Wed 1', 'Thu 2', 'Fri 3'].map((day) => (
                <Pressable key={day} style={[styles.weekDay, day === 'Wed 1' && styles.selectedWeekDay]}>
                  <Text style={[styles.weekDayText, day === 'Wed 1' && styles.selectedWeekDayText]}>{day.split(' ')[0]}</Text>
                  <Text style={[styles.weekDateText, day === 'Wed 1' && styles.selectedWeekDayText]}>{day.split(' ')[1]}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.panel}><View style={styles.panelHead}><View><Text style={styles.kicker}>Next focus</Text><Text style={styles.panelTitle}>Calculus review</Text></View><Text style={styles.panelStrong}>09:00</Text></View><Text style={styles.muted}>Problem set, lecture notes, and quiz corrections.</Text></View>
            <ScheduleCard title="English Lit" subtitle="17:00, Room 105" color="orange" />
            <ScheduleCard title="Biology 101" subtitle="13:00, Lab 3" color="green" />
          </View>
        ) : null}

        {page === 'tasks' ? (
          <View>
            <SectionTitle title="Tasks" meta={openTasks + ' open'} />
            <View style={styles.timeline}>
              {tasks.map((task, index) => (
                <Pressable key={task.title + index} onPress={() => toggleTask(index)} style={[styles.taskRow, task.done && styles.taskDone]}>
                  <View style={[styles.checkbox, task.done && styles.checkboxDone]} />
                  <View><Text selectable style={styles.taskTitle}>{task.title}</Text><Text selectable style={styles.muted}>{task.meta}</Text></View>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {page === 'analytics' ? (
          <View>
            <SectionTitle title="Analytics" meta="This week" />
            <View style={styles.metricGrid}>
              <Metric label="Focus" value="12.5h" />
              <Metric label="Tasks" value="86%" />
              <Metric label="Sleep" value="7.1h" />
              <Metric label="Mood" value="6.8" />
            </View>
            <View style={styles.panel}><Text style={styles.kicker}>Pattern</Text><Text style={styles.panelTitle}>Better mornings</Text><Text style={styles.muted}>Focus blocks before lunch are completed most often.</Text></View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.bottomNav}>
        <NavButton label="Home" active={page === 'home'} onPress={() => setPage('home')} />
        <NavButton label="Calendar" active={page === 'calendar'} onPress={() => setPage('calendar')} />
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
            <Text selectable style={styles.muted}>Your balance page is paused. Continue into flight mode when you are ready.</Text>
            <Pressable onPress={() => router.push('/flight')} style={styles.endSleepButton}>
              <Text style={styles.endSleepText}>Continue</Text>
            </Pressable>
            <Pressable onPress={() => setHandoffOpen(false)} style={styles.secondaryAction}>
              <Text style={styles.secondaryText}>Stay Here</Text>
            </Pressable>
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

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text selectable style={styles.metricValue}>{value}</Text></View>;
}

function NavButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.navButton, active && styles.activeNavButton]}><Text style={[styles.navText, active && styles.activeNavText]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#eef4f7' },
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
  panel: { backgroundColor: '#ffffff', borderColor: '#e4e9f1', borderRadius: 8, borderWidth: 1, padding: 18, boxShadow: '0 14px 34px rgba(40,55,85,0.12)' },
  panelHead: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  panelTitle: { color: '#152033', fontSize: 21, fontWeight: '900' },
  panelStrong: { color: '#152033', fontSize: 20, fontWeight: '900' },
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
  smartPanel: { alignItems: 'center', backgroundColor: '#6753dd', borderRadius: 8, flexDirection: 'row', gap: 14, marginTop: 18, padding: 16 },
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
  taskRow: { alignItems: 'center', backgroundColor: '#ffffff', borderColor: '#e4e9f1', borderRadius: 8, borderWidth: 1, flexDirection: 'row', gap: 12, padding: 14 },
  taskDone: { opacity: 0.55 },
  checkbox: { borderColor: '#768399', borderRadius: 5, borderWidth: 2, height: 20, width: 20 },
  checkboxDone: { backgroundColor: '#45a86e', borderColor: '#45a86e' },
  taskTitle: { color: '#152033', fontSize: 16, fontWeight: '900' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
  metric: { backgroundColor: '#ffffff', borderColor: '#e4e9f1', borderRadius: 8, borderWidth: 1, padding: 18, width: '48%' },
  metricLabel: { color: '#768399', fontWeight: '800' },
  metricValue: { color: '#152033', fontSize: 28, fontWeight: '900', marginTop: 8 },
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
});
