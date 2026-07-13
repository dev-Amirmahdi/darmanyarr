export type Specialty = {
  id: string;
  slug: string;
  name: string;
  icon: string; // emoji fallback
  color: string; // tailwind bg utility
};

export type Clinic = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  rating: number;
};

export type WorkHours = {
  // Iranian weekday index (Sat=0 .. Fri=6). null means off.
  [k: number]: { start: string; end: string } | null;
};

export type Doctor = {
  id: string;
  name: string;
  gender: "male" | "female";
  specialtyId: string;
  clinicId: string;
  city: string;
  bio: string;
  education: string[];
  certificates: string[];
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  visitFee: number;
  onlineFee: number;
  supportsOnline: boolean;
  isOnline: boolean;
  avatarSeed: string;
  workHours: WorkHours;
  slotMinutes: number;
  address: string;
};

export type Review = {
  id: string;
  doctorId: string;
  author: string;
  rating: number;
  comment: string;
  date: string; // ISO
};

export type Article = {
  id: string;
  title: string;
  category: "تغذیه" | "سلامت روان" | "بیماری‌ها" | "بارداری" | "ورزش" | "کودکان";
  excerpt: string;
  content: string;
  cover: string;
  minutes: number;
  date: string;
};

export type Appointment = {
  id: string;
  doctorId: string;
  patientId: string; // account email for authenticated users, phone for guest bookings
  type: "in-person" | "online";
  dateKey: string; // Jalali yyyy-mm-dd
  time: string; // HH:MM
  patient: {
    firstName: string;
    lastName: string;
    nationalId: string;
    phone: string;
    age: number;
    gender: "male" | "female";
    notes?: string;
  };
  status: "confirmed" | "completed" | "cancelled";
  createdAt: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
  kind: "success" | "info" | "warning" | "reminder";
};

export type DoctorNotification = NotificationItem & {
  doctorId: string;
};

export type ChatMessage = {
  id: string;
  from: "me" | "doctor";
  text: string;
  at: string;
  read: boolean;
};

export type AppUser = {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  nationalId?: string;
  age?: number;
  gender?: "male" | "female";
};

export type DoctorSession = {
  doctorId: string;
  name: string;
};

export type WalletTransaction = {
  id: string;
  userEmail: string;
  type: "deposit" | "withdraw" | "refund";
  title: string;
  description?: string;
  amount: number;
  createdAt: string;
};