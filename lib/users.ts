import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const DATA_DIR = "/tmp/myai-data";
const USERS_FILE = path.join(DATA_DIR, "users.json");

export async function getUsers(): Promise<Record<string, any>> {
  try {
    const data = await readFile(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function saveUsers(users: Record<string, any>): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function getUserByEmail(email: string): Promise<any | null> {
  const users = await getUsers();
  return users[email] || null;
}

export async function updateUserCredits(email: string, credits: number): Promise<void> {
  const users = await getUsers();
  if (users[email]) {
    users[email].credits = credits;
    users[email].updatedAt = new Date().toISOString();
    await saveUsers(users);
  }
}