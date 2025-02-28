import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';

const twelveWeekPlan = {
  goals: [],
  currentWeek: 1,
  startDate: "2025-02-21",
  scorecard: {}
};

export async function savePlan(plan) {
  const path = `${await appDataDir()}/plan.json`;
  await writeTextFile(path, JSON.stringify(plan, null, 2));
  console.log(path);
}

export async function loadPlan() {
  const path = `${await appDataDir()}/plan.json`;
  try {
    const data = await readTextFile(path);
    return JSON.parse(data);
  } catch (e) {
    return twelveWeekPlan;
  }
}

export function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function isCompletedToday(tactic) {
  const today = getToday();
  return tactic.dailyCompletions && tactic.dailyCompletions[today] === true;
}