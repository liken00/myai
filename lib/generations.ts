import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const DATA_DIR = "/tmp/myai-data";
const GENERATIONS_FILE = path.join(DATA_DIR, "generations.json");

export interface Generation {
  url: string;
  prompt: string;
  timestamp: string;
}

export async function saveGeneration(
  email: string,
  generation: Omit<Generation, "timestamp">
): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });

  let generations: Record<string, Generation[]> = {};
  try {
    const data = await readFile(GENERATIONS_FILE, "utf-8");
    generations = JSON.parse(data);
  } catch {
    // File doesn't exist yet
  }

  if (!generations[email]) {
    generations[email] = [];
  }

  generations[email].unshift({
    ...generation,
    timestamp: new Date().toISOString(),
  });

  // Keep last 100 generations per user
  generations[email] = generations[email].slice(0, 100);

  await writeFile(GENERATIONS_FILE, JSON.stringify(generations, null, 2));
}

export async function getGenerations(email: string): Promise<Generation[]> {
  try {
    const data = await readFile(GENERATIONS_FILE, "utf-8");
    const generations: Record<string, Generation[]> = JSON.parse(data);
    return generations[email] || [];
  } catch {
    return [];
  }
}