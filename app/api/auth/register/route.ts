import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const DATA_DIR = "/tmp/myai-data";
const USERS_FILE = path.join(DATA_DIR, "users.json");

async function getUsers() {
  try {
    const { readFile } = await import("fs/promises");
    const data = await readFile(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveUsers(users: any) {
  await mkdir(DATA_DIR, { recursive: true });
  const { writeFile } = await import("fs/promises");
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const users = await getUsers();

    if (users[email]) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users[email] = {
      email,
      password: hashedPassword,
      credits: 10,
      createdAt: new Date().toISOString(),
    };

    await saveUsers(users);

    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET || "myai-secret-key-change-in-production",
      { expiresIn: "30d" }
    );

    const response = NextResponse.json({ success: true });
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
