import AsyncStorage from "@react-native-async-storage/async-storage";

const BEST_SCORE_KEY = "@blockmerge/best_score";

export async function loadBestScore(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(BEST_SCORE_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export async function saveBestScore(score: number): Promise<void> {
  try {
    await AsyncStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch {
    // Non-fatal: best score just won't persist this session.
  }
}
