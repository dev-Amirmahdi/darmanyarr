// Repository layer — today reads/writes LocalStorage. Tomorrow: swap for API.
import { KEYS, storage } from "./storage";
import { ARTICLES_SEED, SPECIALTIES_SEED, buildClinics, buildDoctors, buildReviews } from "./seed";
import { parseJDateKey, toGregorian } from "./jalali";
import type {
  AppUser,
  Appointment,
  Article,
  ChatMessage,
  Clinic,
  Doctor,
  DoctorNotification,
  NotificationItem,
  Review,
  Specialty,
  WalletTransaction
} from "./types";

export function ensureSeeded(): void {
  if (storage.get<boolean>(KEYS.seeded, false)) return;
  const specialties = SPECIALTIES_SEED;
  const clinics = buildClinics();
  const doctors = buildDoctors(specialties, clinics);
  const reviews = buildReviews(doctors);
  storage.set(KEYS.specialties, specialties);
  storage.set(KEYS.clinics, clinics);
  storage.set(KEYS.doctors, doctors);
  storage.set(KEYS.reviews, reviews);
  storage.set(KEYS.articles, ARTICLES_SEED);
  storage.set(KEYS.seeded, true);
}

/* -------------------- Doctors -------------------- */
export const doctorsRepo = {
  list(): Doctor[] {
    ensureSeeded();
    return storage.get<Doctor[]>(KEYS.doctors, []);
  },
  byId(id: string): Doctor | undefined {
    return this.list().find((d) => d.id === id);
  },
  bySpecialty(specialtyId: string): Doctor[] {
    return this.list().filter((d) => d.specialtyId === specialtyId);
  },
  online(): Doctor[] {
    return this.list().filter((d) => d.supportsOnline);
  },
  top(limit = 6): Doctor[] {
    return [...this.list()].sort((a, b) => b.rating - a.rating).slice(0, limit);
  },
  popular(limit = 6): Doctor[] {
    return [...this.list()].sort((a, b) => b.reviewsCount - a.reviewsCount).slice(0, limit);
  },
  search(q: string): Doctor[] {
    const query = q.trim();
    if (!query) return this.list();
    return this.list().filter(
      (d) => d.name.includes(query) || d.city.includes(query) || d.bio.includes(query),
    );
  },
};

/* -------------------- Specialties -------------------- */
export const specialtiesRepo = {
  list(): Specialty[] {
    ensureSeeded();
    return storage.get<Specialty[]>(KEYS.specialties, []);
  },
  bySlug(slug: string): Specialty | undefined {
    return this.list().find((s) => s.slug === slug);
  },
  byId(id: string): Specialty | undefined {
    return this.list().find((s) => s.id === id);
  },
};

/* -------------------- Clinics -------------------- */
export const clinicsRepo = {
  list(): Clinic[] {
    ensureSeeded();
    return storage.get<Clinic[]>(KEYS.clinics, []);
  },
  byId(id: string): Clinic | undefined {
    return this.list().find((c) => c.id === id);
  },
};

/* -------------------- Reviews -------------------- */
export const reviewsRepo = {
  list(): Review[] {
    ensureSeeded();
    return storage.get<Review[]>(KEYS.reviews, []);
  },
  byDoctor(doctorId: string): Review[] {
    return this.list().filter((r) => r.doctorId === doctorId);
  },
  add(r: Review) {
    const all = this.list();
    all.unshift(r);
    storage.set(KEYS.reviews, all);
  },
};

/* -------------------- Articles -------------------- */
export const articlesRepo = {
  list(): Article[] {
    ensureSeeded();
    return storage.get<Article[]>(KEYS.articles, []);
  },
  byId(id: string): Article | undefined {
    return this.list().find((a) => a.id === id);
  },
};

/* -------------------- Appointments -------------------- */
export const appointmentsRepo = {
  list(): Appointment[] {
    return storage.get<Appointment[]>(KEYS.appointments, []);
  },
  byPatient(patientId: string): Appointment[] {
    return this.list().filter((a) => a.patientId === patientId);
  },
  byDoctor(doctorId: string): Appointment[] {
    return this.list().filter((a) => a.doctorId === doctorId);
  },
  bookedSlots(doctorId: string, dateKey: string): string[] {
    return this.list()
      .filter((a) => a.doctorId === doctorId && a.dateKey === dateKey && a.status !== "cancelled")
      .map((a) => a.time);
  },
  patientHasConflict(patientId: string, dateKey: string, time: string, ignoreId?: string): boolean {
    return this.list().some(
      (a) =>
        a.patientId === patientId &&
        a.dateKey === dateKey &&
        a.time === time &&
        a.status !== "cancelled" &&
        a.id !== ignoreId,
    );
  },
  refreshStatuses() {
  const all = this.list();

  let changed = false;

  const updated = all.map((item) => {
    if (item.status !== "confirmed") return item;

    const j = parseJDateKey(item.dateKey);
    const g = toGregorian(j);

    const appointmentDate = new Date(
      g.getFullYear(),
      g.getMonth(),
      g.getDate(),
      Number(item.time.split(":")[0]),
      Number(item.time.split(":")[1]),
    );

    if (appointmentDate < new Date()) {
      changed = true;

      return {
        ...item,
        status: "completed" as const,
      };
    }

    return item;
  });

  if (changed) {
      storage.set(KEYS.appointments, updated);
    }
  },
  create(a: Appointment): { ok: boolean; error?: string } {
    const all = this.list();
    if (
      all.some(
        (x) =>
          x.doctorId === a.doctorId &&
          x.dateKey === a.dateKey &&
          x.time === a.time &&
          x.status !== "cancelled",
      )
    ) {
      return { ok: false, error: "این ساعت قبلاً رزرو شده است." };
    }
    if (this.patientHasConflict(a.patientId, a.dateKey, a.time)) {
      return { ok: false, error: "شما در همین زمان نوبت دیگری دارید." };
    }
    const isNewPatient = !all.some((item) => item.doctorId === a.doctorId && item.patientId === a.patientId);
    all.unshift(a);
    storage.set(KEYS.appointments, all);
    notificationsRepo.add({
      id: `n-${a.id}`,
      title: "نوبت شما ثبت شد",
      body: `نوبت شما با ${a.dateKey} ساعت ${a.time} با موفقیت رزرو گردید.`,
      date: new Date().toISOString(),
      read: false,
      kind: "success",
    });
    doctorNotificationsRepo.add({
      id: `dn-${a.id}`,
      doctorId: a.doctorId,
      title: isNewPatient ? "بیمار جدید اضافه شد" : "نوبت جدید ثبت شد",
      body: isNewPatient
        ? `${a.patient.firstName} ${a.patient.lastName} برای اولین بار نوبت ثبت کرد.`
        : `${a.patient.firstName} ${a.patient.lastName} یک نوبت جدید ثبت کرد.`,
      date: new Date().toISOString(),
      read: false,
      kind: "success",
    });
    return { ok: true };
  },
  cancel(id: string): void {
    const appointment = this.list().find((a) => a.id === id);
    const all = this.list().map((a) => (a.id === id ? { ...a, status: "cancelled" as const } : a));
    storage.set(KEYS.appointments, all);
    notificationsRepo.add({
      id: `n-cx-${id}-${Date.now()}`,
      title: "نوبت لغو شد",
      body: "نوبت شما با موفقیت لغو شد.",
      date: new Date().toISOString(),
      read: false,
      kind: "warning",
    });
    if (appointment) {
      doctorNotificationsRepo.add({
        id: `dn-cx-${id}-${Date.now()}`,
        doctorId: appointment.doctorId,
        title: "نوبت لغو شد",
        body: `${appointment.patient.firstName} ${appointment.patient.lastName} نوبت خود را لغو کرد.`,
        date: new Date().toISOString(),
        read: false,
        kind: "warning",
      });
    }
  },
  update(
    id: string,
    patch: Partial<Pick<Appointment, "dateKey" | "time" | "type">>,
  ): { ok: boolean; error?: string } {
    const all = this.list();
    const current = all.find((a) => a.id === id);
    if (!current) return { ok: false, error: "نوبت یافت نشد." };
    const merged = { ...current, ...patch };
    const conflict = all.some(
      (x) =>
        x.id !== id &&
        x.doctorId === current.doctorId &&
        x.dateKey === merged.dateKey &&
        x.time === merged.time &&
        x.status !== "cancelled",
    );
    if (conflict) return { ok: false, error: "این ساعت قبلاً رزرو شده است." };
    if (appointmentsRepo.patientHasConflict(current.patientId, merged.dateKey, merged.time, id)) {
      return { ok: false, error: "شما در همین زمان نوبت دیگری دارید." };
    }
    storage.set(
      KEYS.appointments,
      all.map((a) => (a.id === id ? merged : a)),
    );
    return { ok: true };
  },
};

/* -------------------- Wallet -------------------- */
export const walletRepo = {
  list(): WalletTransaction[] {
    return storage.get<WalletTransaction[]>(
      KEYS.walletTransactions,
      [],
    );
  },

  byUser(email: string): WalletTransaction[] {
    return this.list()
      .filter((t) => t.userEmail === email)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      );
  },

  balance(email: string): number {
    return this.byUser(email).reduce((sum, item) => {
      switch (item.type) {
        case "deposit":
        case "refund":
          return sum + item.amount;

        case "withdraw":
          return sum - item.amount;

        default:
          return sum;
      }
    }, 0);
  },

  add(transaction: WalletTransaction) {
    storage.set(KEYS.walletTransactions, [
      transaction,
      ...this.list(),
    ]);
  },
};

/* -------------------- Notifications -------------------- */
export const notificationsRepo = {
  list(): NotificationItem[] {
    return storage.get<NotificationItem[]>(KEYS.notifications, []);
  },
  add(n: NotificationItem) {
    const all = this.list();
    all.unshift(n);
    storage.set(KEYS.notifications, all.slice(0, 100));
  },
  markAllRead() {
    storage.set(
      KEYS.notifications,
      this.list().map((n) => ({ ...n, read: true })),
    );
  },
};

export const doctorNotificationsRepo = {
  list(doctorId: string): DoctorNotification[] {
    return storage.get<DoctorNotification[]>(KEYS.doctorNotifications, []).filter((item) => item.doctorId === doctorId);
  },
  add(notification: DoctorNotification) {
    const all = storage.get<DoctorNotification[]>(KEYS.doctorNotifications, []);
    all.unshift(notification);
    storage.set(KEYS.doctorNotifications, all.slice(0, 200));
  },
  markAllRead(doctorId: string) {
    const all = storage.get<DoctorNotification[]>(KEYS.doctorNotifications, []);
    storage.set(KEYS.doctorNotifications, all.map((item) => item.doctorId === doctorId ? { ...item, read: true } : item));
  },
};

/* -------------------- Favorites -------------------- */
export const favoritesRepo = {
  list(): string[] {
    return storage.get<string[]>(KEYS.favorites, []);
  },
  toggle(doctorId: string): boolean {
    const all = this.list();
    const exists = all.includes(doctorId);
    const next = exists ? all.filter((x) => x !== doctorId) : [...all, doctorId];
    storage.set(KEYS.favorites, next);
    return !exists;
  },
  has(doctorId: string): boolean {
    return this.list().includes(doctorId);
  },
};

/* -------------------- Recent Doctors -------------------- */
export const recentDoctorsRepo = {
  list(): string[] {
    return storage.get<string[]>(KEYS.recentDoctors, []);
  },
  push(doctorId: string) {
    const all = this.list().filter((x) => x !== doctorId);
    all.unshift(doctorId);
    storage.set(KEYS.recentDoctors, all.slice(0, 10));
  },
};

/* -------------------- Auth (local users) -------------------- */
export const authRepo = {
  users(): AppUser[] {
    return storage.get<AppUser[]>(KEYS.users, []);
  },
  currentUser(): AppUser | null {
    return storage.get<AppUser | null>(KEYS.currentUser, null);
  },
  register(user: Pick<AppUser, "username" | "email" | "password">): {
    ok: boolean;
    error?: string;
    user?: AppUser;
  } {
    const username = user.username.trim();
    const email = user.email.trim().toLowerCase();
    const password = user.password;
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!username || !email || !password)
      return { ok: false, error: "لطفاً همه فیلدها را وارد کنید." };
    if (!emailIsValid) return { ok: false, error: "ایمیل واردشده معتبر نیست." };
    const users = this.users();
    if (users.some((item) => item.username.trim().toLowerCase() === username.toLowerCase()))
      return { ok: false, error: "این نام کاربری قبلاً ثبت شده است." };
    if (users.some((item) => item.email.trim().toLowerCase() === email))
      return { ok: false, error: "این ایمیل قبلاً ثبت شده است." };
    const newUser: AppUser = { username, email, password };
    storage.set(KEYS.users, [...users, newUser]);
    storage.set(KEYS.currentUser, newUser);
    return { ok: true, user: newUser };
  },
  login(identifier: string, password: string): { ok: boolean; error?: string; user?: AppUser } {
    const value = identifier.trim().toLowerCase();
    if (!value || !password)
      return { ok: false, error: "نام کاربری یا ایمیل و رمز عبور را وارد کنید." };
    const user = this.users().find(
      (item) =>
        (item.username.trim().toLowerCase() === value ||
          item.email.trim().toLowerCase() === value) &&
        item.password === password,
    );
    if (!user) return { ok: false, error: "نام کاربری یا ایمیل و رمز عبور صحیح نیست." };
    storage.set(KEYS.currentUser, user);
    return { ok: true, user };
  },
  updateCurrentUser(patch: Partial<AppUser>) {
    const user = this.currentUser();
    if (!user) return;
    const updated = { ...user, ...patch };
    storage.set(KEYS.currentUser, updated);
    storage.set(
      KEYS.users,
      this.users().map((item) =>
        item.username === user.username && item.email === user.email ? updated : item,
      ),
    );
  },
  signOutCurrentUser() {
    storage.remove(KEYS.currentUser);
  },
  doctor(): { doctorId: string; name: string } | null {
    return storage.get<{ doctorId: string; name: string } | null>(KEYS.authDoctor, null);
  },
  setDoctor(d: { doctorId: string; name: string }) {
    storage.set(KEYS.authDoctor, d);
  },
  signOutDoctor() {
    storage.remove(KEYS.authDoctor);
  },
};

/* -------------------- Chats -------------------- */
export const chatsRepo = {
  all(): Record<string, ChatMessage[]> {
    return storage.get<Record<string, ChatMessage[]>>(KEYS.chats, {});
  },
  get(doctorId: string): ChatMessage[] {
    return this.all()[doctorId] ?? [];
  },
  send(doctorId: string, msg: ChatMessage) {
    const map = this.all();
    map[doctorId] = [...(map[doctorId] ?? []), msg];
    storage.set(KEYS.chats, map);
  },
};


