# 🌿 ZenFlow: Productivity & Wellness Sanctuary

ZenFlow is a professional-grade, high-performance Personal Wellness Assistant (PWA) designed to harmonize deep work with mindful living. It transforms your productivity data into a living digital ecosystem.

## 🚀 Key Features

### 🏗️ Advanced Architecture
- **Professional Persistence**: All tasks, hydration logs, and timer settings are saved locally and persist across sessions.
- **Resilient Timer**: A timestamp-based Pomodoro engine that accurately resumes even after browser refreshes or closures.
- **IndexedDB Audio Storage**: Support for large user-uploaded custom soundscapes without hitting standard browser storage limits.
- **Service Worker v3**: A robust offline-first experience using Stale-While-Revalidate strategies for instant loading.

### 🧘 Wellness & Focus
- **Dynamic Living Garden**: A data-driven landscape that evolves in real-time.
  - **Trees**: Grow based on your completed tasks.
  - **Blooms**: Appear for every finished focus session.
  - **Pond**: Shimmers and fills based on your actual hydration intake.
- **Smart Weather Sync**: Real-time synchronization with your local weather conditions (rain in the world = rain in your garden).
- **Sound Sanctuary**: A multi-layered ambient mixer with built-in nature sounds and custom upload support.
- **Contextual Flow Pill**: A persistent control bar that follows you across the app during active sessions.

### ⚡ Power-User Features
- **Keyboard Navigation**:
  - `Space`: Toggle Focus Timer
  - `F`: Focus Mode
  - `T`: Task Soil
  - `W` / `H`: Hydration
  - `S`: Sound Sanctuary
  - `B`: Breath Studio
  - `Esc`: Return to Dashboard
- **Native Notifications**: Desktop alerts for session completions and breaks.
- **Garden Stats**: Detailed weekly analytics and "Bloom History" tracking.

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Storage**: localStorage + IndexedDB (Custom Logic)
- **API**: Open-Meteo (Weather), Custom Express/SQLite Backend (Optional)

## 📦 Installation & Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📜 License
Licensed under the Apache License, Version 2.0. See the [LICENSE](LICENSE) file for details.
