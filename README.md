# DarmanYar 🩺

A modern doctor appointment booking application built with **React**, **TanStack Router**, **TypeScript**, and **Tailwind CSS**. The project is currently frontend-only and uses LocalStorage to simulate backend functionality.

## ✨ Features

- 🔐 User Authentication (Login & Register)
- 👨‍⚕️ Browse Doctors by Specialty
- 🔍 Search Doctors
- 📅 Book In-Person & Online Appointments
- 📆 Jalali (Persian) Calendar Support
- ❤️ Favorite Doctors
- 💳 Wallet & Transaction History
- 🎁 Discounts Page
- 👤 User Profile & Edit Profile
- 📋 Appointment Management
  - Current Appointments
  - Completed Appointments
  - Cancelled Appointments
- 🔔 User & Doctor Notifications
- 🌙 Dark / Light Mode
- 📱 Fully Responsive Design
- 💾 LocalStorage Data Persistence

## 🛠 Tech Stack

- React
- TypeScript
- TanStack Router
- Vite
- Tailwind CSS
- shadcn/ui
- Lucide React

## 📂 Project Structure

```
src/
 ├── components/
 ├── lib/
 │    ├── repository.ts
 │    ├── storage.ts
 │    ├── types.ts
 │    └── seed.ts
 ├── routes/
 ├── styles/
 └── assets/
```

## 🚀 Getting Started

Clone the repository:

```bash
git clone <repository-url>
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## 📦 Data Storage

This project currently stores all application data in **LocalStorage**, including:

- Users
- Doctors
- Appointments
- Wallet Transactions
- Favorites
- Notifications

The repository layer is designed so it can easily be replaced with a real backend API in the future.

## 📌 Roadmap

- Online Payment Integration
- Wallet Top-up
- Discount Code System
- Backend API
- Admin Dashboard
- Push Notifications

## 📄 License

This project is created for educational and portfolio purposes.
