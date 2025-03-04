// src/lib/storage.ts
import {open, writeTextFile, readTextFile, BaseDirectory, mkdir } from '@tauri-apps/plugin-fs';
import type { Vision } from './types';
import { appDataDir, join } from '@tauri-apps/api/path';

/*interface AppData {
  goals: Goal[];
  reviews: WeeklyReview[];
}*/

const fileName = "12weeksdata.json";


async function getStorageFolderPath(): Promise<string> {
  try {
    const configContent = await readTextFile('config.json', { baseDir: BaseDirectory.AppData });
    //console.log("storage folder: ", configContent);
    const config = JSON.parse(configContent);
    //console.log("config ",config);
    const storagePath:string = config.customStorageLocation;
    //console.log("path; ",storagePath, " - filename: ",fileName);
    

    return storagePath || await appDataDir();
  } catch (e) {
    console.log('error: ',e);
    return await appDataDir(); // Default to AppData if config doesn’t exist
  }
}


export async function saveData(data: Vision): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  //console.log('Attempting to save to $APPDATA/app_data.json:', data);
  //console.log("dir: ",BaseDirectory.AppData);
  
  try {
    const folderLocation = await getStorageFolderPath();
    await mkdir(folderLocation, {
      recursive: true,
    });
    
    //await writeTextFile(fileName, json, { baseDir: BaseDirectory.AppData});
    await writeTextFile(folderLocation+'/'+fileName, json);
    //console.log('Successfully saved to $APPDATA/app_data.json');
  } catch (e) {
    //console.error('Save error:', e);
    throw e;
  }
}

export async function loadData(): Promise<Vision> {
  try {
    
    //console.log('Attempting to read from $APPDATA/app_data.json');
    //const json = await readTextFile(fileName, { baseDir: BaseDirectory.AppData });
    const filePath = await getStorageFolderPath()+'/'+fileName;
    //console.log("reading: ",filePath);
    const jsoncontent = await readTextFile(filePath);
    //console.log('read: ',jsoncontent);
    //console.log('Successfully read from $APPDATA/app_data.json');
    return JSON.parse(jsoncontent) as Vision;
  } catch (e) {
    //console.warn('Load error, returning default:', e);
    return { vision: '', created:'', updated:'', goals:[] };
  }
}