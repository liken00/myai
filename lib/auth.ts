import { readFile } from "fs/promises";
import path from "path";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const DATA_DIR = "/tmp/myai-data";
const USERS_FILE = path.join(DATA_DIR, "users.json");
const JWT_SECRET = process.env.JWT_SECRET || "myai-secret-key-change-in-production";

export interface UserPayload {
  email: string;
  iat: number;
  exp: number;
}

export async function getUserFromCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded.email;
  } catch {
    return null;
  }
}

export async function getUserCredits(email: string): Promise<number> {
  try {
    const data = await readFile(USERS_FILE, "utf-8");
    const users = JSON.parse(data);
    return users[email]?.credits ?? 0;
  } catch {
    return 0;
  }
}

export async function deductCredit(email: string): Promise<number> {
  const { readFile, writeFile, mkdir } = await import("fs/promises");
  await mkdir(DATA_DIR, { recursive: true });

  let users: Record<string, any> = {};
  try {
    const data = await readFile(USERS_FILE, "utf-8");
    users = JSON.parse(data);
  } catch {
    // File doesn't exist yet
  }

  const currentCredits = users[email]?.credits ?? 0;
  if (currentCredits <= 0) {
    throw new Error("No credits available");
  }

  users[email] = {
    ...users[email],
    credits: currentCredits - 1,
    updatedAt: new Date().toISOString(),
  };

  await writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  return users[email].credits;
}