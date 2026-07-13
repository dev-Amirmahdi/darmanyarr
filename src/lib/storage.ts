// LocalStorage wrapper — SSR safe. All app data lives here (no backend).
const isBrowser = () => typeof window !== "undefined";

export const storage = {
  get<T>(key: string, fallback: T): T {
    if (!isBrowser()) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // quota exceeded — ignore
    }
  },
  remove(key: string): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(key);
  },
};

/** Storage keys used across the app (single source of truth). */
export const KEYS = {
  theme: "med.theme",
  onboardingSeen: "med.onboarding.v1",
  users: "users",
  currentUser: "currentUser",
  authDoctor: "med.auth.doctor",
  favorites: "med.favorites",
  recentDoctors: "med.recentDoctors",
  appointments: "med.appointments",
  walletTransactions: "med.wallet.transactions",
  notifications: "med.notifications",
  doctorNotifications: "med.doctorNotifications",
  seeded: "med.seeded.v1",
  doctors: "med.doctors",
  clinics: "med.clinics",
  specialties: "med.specialties",
  articles: "med.articles",
  reviews: "med.reviews",
  chats: "med.chats",
} as const;
