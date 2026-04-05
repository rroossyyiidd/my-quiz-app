import type { TLoginPayload, TRegisterPayload, TStoredUser, TUser } from "./type";

const USERS_KEY = process.env.NEXT_PUBLIC_USERS_KEY || "quiz_app_users";
const CURRENT_USER_KEY = process.env.NEXT_PUBLIC_CURRENT_USER_KEY || "quiz_app_current_user";

function getStoredUsers(): TStoredUser[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveStoredUsers(users: TStoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function loginUser(payload: TLoginPayload): TUser {
  const users = getStoredUsers();
  const user = users.find(
    (u) => u.username === payload.username && u.password === payload.password
  );

  if (!user) {
    throw new Error("Invalid username or password");
  }

  const { password: _, ...safeUser } = user;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  return safeUser;
}

export function registerUser(payload: TRegisterPayload): TUser {
  const users = getStoredUsers();
  const exists = users.find((u) => u.username === payload.username);

  if (exists) {
    throw new Error("Username already exists");
  }

  const newUser: TStoredUser = {
    id: crypto.randomUUID(),
    name: payload.name,
    username: payload.username,
    password: payload.password,
    createdAt: new Date().toISOString(),
  };

  saveStoredUsers([...users, newUser]);

  const { password: _, ...safeUser } = newUser;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  return safeUser;
}

export function getCurrentUser(): TUser | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function logoutUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}
