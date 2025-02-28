// src/lib/storage.ts
import {open, writeTextFile, readTextFile, BaseDirectory, mkdir } from '@tauri-apps/plugin-fs';
import type { Vision } from './types';

/*interface AppData {
  goals: Goal[];
  reviews: WeeklyReview[];
}*/

const fileName = "12weeks.json";





export async function saveData(data: Vision): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  //console.log('Attempting to save to $APPDATA/app_data.json:', data);
  //console.log("dir: ",BaseDirectory.AppData);
  
  try {
    await mkdir("", {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    });

    await writeTextFile(fileName, json, { baseDir: BaseDirectory.AppData });
    console.log('Successfully saved to $APPDATA/app_data.json');
  } catch (e) {
    console.error('Save error:', e);
    throw e;
  }
}

export async function loadData(): Promise<Vision> {
  try {
    
    console.log('Attempting to read from $APPDATA/app_data.json');
    const json = await readTextFile(fileName, { baseDir: BaseDirectory.AppData });
    console.log('Successfully read from $APPDATA/app_data.json');
    return JSON.parse(json) as Vision;
  } catch (e) {
    console.warn('Load error, returning default:', e);
    return { vision: '', created:'', updated:'', goals:[] };
  }
}