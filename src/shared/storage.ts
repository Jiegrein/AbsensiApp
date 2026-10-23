import * as SecureStore from 'expo-secure-store';

// Key strings are part of the installed app's state; renaming one logs every existing phone out.
export const StorageKey = {
  workerId: 'workerPhoneId',
  logId: 'LogId',
  projectId: 'ProjectId',
} as const;

export type StorageKey = (typeof StorageKey)[keyof typeof StorageKey];

/** Returns '' when nothing is stored or the secure store is unavailable; callers treat '' as absent. */
export const readStored = async (key: StorageKey): Promise<string> => {
  try {
    return (await SecureStore.getItemAsync(key)) ?? '';
  } catch {
    return '';
  }
};

/** Best effort: a failed write is swallowed, as the original screens did. */
export const writeStored = async (key: StorageKey, value: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // ignored
  }
};
