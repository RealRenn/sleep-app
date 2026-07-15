export type RewardProgress = {
  totalHealth: number;
  coins: number;
  completedTasks: number;
  streakDays: number;
  chapterGoal: number;
  redeemedRewards: number;
};

export const REWARD_STORAGE_KEY = 'balance.rewardProgress';
export const TASK_HEALTH_REWARD = 120;
export const TASK_COIN_REWARD = 18;

export const REDEEM_REWARDS = [
  { id: 'calm-badge', title: 'Calm Badge', detail: 'Unlock a badge for staying on track.', cost: 120 },
  { id: 'rest-pass', title: 'Rest Pass', detail: 'Trade points for a short guilt-free reset.', cost: 240 },
  { id: 'bonus-guide', title: 'Bonus Guide', detail: 'Open an extra sleep quest guide.', cost: 360 },
] as const;

export const defaultRewardProgress: RewardProgress = {
  totalHealth: 0,
  coins: 0,
  completedTasks: 0,
  streakDays: 1,
  chapterGoal: 560,
  redeemedRewards: 0,
};

const getStorage = () => {
  if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) {
    return null;
  }

  return globalThis.localStorage;
};

export const loadRewardProgress = (): RewardProgress => {
  const storage = getStorage();

  if (!storage) {
    return defaultRewardProgress;
  }

  try {
    const savedProgress = storage.getItem(REWARD_STORAGE_KEY);

    if (!savedProgress) {
      return defaultRewardProgress;
    }

    return { ...defaultRewardProgress, ...JSON.parse(savedProgress) };
  } catch {
    return defaultRewardProgress;
  }
};

export const saveRewardProgress = (progress: RewardProgress) => {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(REWARD_STORAGE_KEY, JSON.stringify(progress));
};

export const awardTaskReward = (currentProgress = loadRewardProgress()): RewardProgress => {
  const nextProgress = {
    ...currentProgress,
    totalHealth: currentProgress.totalHealth + TASK_HEALTH_REWARD,
    coins: currentProgress.coins + TASK_COIN_REWARD,
    completedTasks: currentProgress.completedTasks + 1,
  };

  saveRewardProgress(nextProgress);

  return nextProgress;
};

export const redeemReward = (
  rewardId: string,
  currentProgress = loadRewardProgress(),
): RewardProgress => {
  const reward = REDEEM_REWARDS.find((item) => item.id === rewardId);

  if (!reward || currentProgress.totalHealth < reward.cost) {
    return currentProgress;
  }

  const nextProgress = {
    ...currentProgress,
    totalHealth: currentProgress.totalHealth - reward.cost,
    redeemedRewards: currentProgress.redeemedRewards + 1,
  };

  saveRewardProgress(nextProgress);

  return nextProgress;
};
