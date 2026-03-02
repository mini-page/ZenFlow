# Trackify Architecture and Design Guide

This document explains the current Trackify codebase structure, feature model, design intent, and how the full-screen tracker pages relate to mini dashboard widgets.

## 1) Product Motive and UX Model

Trackify is designed as a client-side personal tracking app for health, wellness, and daily productivity. The app follows a two-layer interaction model:

- Layer A: Dashboard for quick check-ins and fast actions.
- Layer B: Dedicated full-screen pages for deeper interaction and historical context.

The product motive is convenience first:

- Dashboard gives "today status" and low-friction input.
- Full pages provide context, detail, planning, and extended data entry.

In practical terms, Trackify favors:

- Immediate feedback (toasts, visual progress indicators).
- Local-first privacy (browser `localStorage`, no required backend).
- Personalization (theme + dashboard card visibility settings).

## 2) Technology Stack

- Runtime: React + TypeScript
- Build: Vite
- Routing: React Router (`BrowserRouter` with `basename`)
- Styling: Tailwind CSS + shadcn/ui primitives
- Utilities: `clsx` + `tailwind-merge` via `cn()`
- Notifications: shadcn toast + Sonner
- Date logic: `date-fns`
- Charts/visuals: mostly custom UI blocks, with some chart-ready dependencies

## 3) App Boot and Runtime Flow

### Entry flow

1. `src/main.tsx` mounts `<App />`.
2. A GitHub Pages fallback reads `?path=...` and rewrites history for SPA routing.
3. `src/App.tsx` wraps app with:
- `QueryClientProvider`
- `TooltipProvider`
- shadcn Toaster + Sonner toaster
- `BrowserRouter` (`basename={import.meta.env.BASE_URL}`)

### Global initialization in `App.tsx`

On first load, app seeds `localStorage` defaults for:

- `theme`
- `userData` + `userGender`
- `dashboardItems` (visibility toggles for dashboard cards/widgets)

## 4) Project Structure

Top-level structure:

- `src/pages`: route-level full-screen pages
- `src/components/layout`: app layout shell
- `src/components/nav`: sidebar navigation
- `src/components/dashboard`: insight and quick-action cards
- `src/components/ui`: reusable UI widgets and mini trackers
- `src/components/settings`: settings sections
- `src/components/journal`: journal form/list feature components
- `src/components/cycle-tracker`: cycle tracker feature modules
- `src/components/profile`: profile forms/cards
- `src/hooks`: custom hooks (`use-mobile`, toast hook)
- `src/lib`: shared utility helpers

## 5) Route Map and Purpose

Configured in `src/App.tsx`:

- `/` -> `Index` (dashboard)
- `/water` -> water details page
- `/nutrition` -> nutrition details page
- `/exercise` -> exercise details page
- `/mood` -> mood details page
- `/goals` -> goals details page
- `/calendar` -> calendar page
- `/settings` -> settings hub
- `/sleep` -> sleep tracking page
- `/budget` -> budget tracker
- `/pomodoro` -> focus timer
- `/habits` -> habits tracking
- `/journal` -> journal system
- `/cycle-tracker` -> cycle tracker
- `*` -> not found page

## 6) Layout System

### Main shell (`MainLayout`)

Core responsibilities:

- Desktop left sidebar (`SidebarNav`)
- Top header (`Header`) with date/action/profile
- Scrollable content area
- Mobile adaptation (`useIsMobile`) with sheet-based menu (`MobileMenu`)

### Header behavior

- Reads and displays user name from `localStorage.userData`
- Subscribes to custom `user-profile-updated` event
- Contains notifications UI and user profile menu

## 7) Dashboard Architecture

### Dashboard page (`Index.tsx`)

Dashboard composition:

- Greeting/title section
- `DashboardActionableCards` (insight/quick-action card band)
- Grid of mini trackers:
  - `WaterTracker`
  - `CalorieTracker`
  - `ExerciseTracker`
  - `MoodTracker`
  - `DailyGoal`

Card/widget visibility is controlled by `dashboardItems` from `localStorage`.

### Insight/quick-action cards (`DashboardActionableCards.tsx`)

- Collects both:
  - "Insight cards" (health score, sleep quality, goals, etc.)
  - "Quick action cards" (water, budget, cycle)
- Filters by visibility flags
- Navigates users to route-level pages on action click
- Wrapped in collapsible "Insights" container

## 8) Full-Screen vs Mini Widgets

This is the core design pattern in Trackify.

### Pattern

- Mini widgets (dashboard): compact, fast, often local component state.
- Full-screen pages: same domain, larger context, more sections, richer content.

### Current domain pairs

- Water:
  - Mini: `ui/water-tracker.tsx`
  - Full: `pages/WaterPage.tsx` reuses `WaterTracker`
- Nutrition:
  - Mini: `ui/calorie-tracker.tsx`
  - Full: `pages/NutritionPage.tsx` reuses `CalorieTracker`
- Exercise:
  - Mini: `ui/exercise-tracker.tsx`
  - Full: `pages/ExercisePage.tsx` reuses `ExerciseTracker`
- Mood:
  - Mini: `ui/mood-tracker.tsx`
  - Full: `pages/MoodPage.tsx` reuses `MoodTracker`
- Goals:
  - Mini: `ui/daily-goal.tsx`
  - Full: `pages/GoalsPage.tsx` reuses `DailyGoal`

### Important implementation reality

Some mini widgets and full pages are currently not strongly shared in persistent state. Several widgets keep internal component state (e.g. calories, exercise log, mood selection), while route pages may also have their own local state and/or placeholder data.

Implication:

- UX is visually coherent.
- Data coherence across mini + full views is partial, not fully normalized.

## 9) Settings Subsystem

Settings entry: `pages/SettingsPage.tsx`

Tabbed sections:

- Profile (`UserProfileSettings`)
- Theme / Appearance (`AppearanceSettings`)
- Notifications (`NotificationSettings`)
- Data (`DataSettings`)
- About (`AboutUsSettings`)

### Appearance and dashboard customization

`AppearanceSettings` includes:

- Theme selection (`ThemeSelector`)
- UI preferences (`UIPreferences`)
- Dashboard visibility control (`DashboardItemsSelector`)

`DashboardItemsSelector` is the control point for which widgets/cards appear on `/`.

### Profile data propagation model

- Profile save writes `userData` + `userGender`
- Emits `user-profile-updated` custom DOM event
- Header/layout/profile menu subscribe and update display name reactively

## 10) Data Model and Persistence (LocalStorage)

Trackify is local-first. Primary keys observed:

- `theme`
- `userData`
- `userGender`
- `dashboardItems`
- `waterIntake`
- `calorieIntake`
- `exerciseMinutes`
- `habits`
- `journalEntries`
- `lastJournalPromptDate`
- `expenses`
- `currency`
- `monthlyBudget`
- `periods`
- `symptoms`
- `cycleLength`
- `reminders`
- `lastProfileSave`

Notes:

- Journal, habits, cycle, and budget have meaningful persistence.
- Some dashboard tracker values are initialized but not uniformly synced with full pages.
- Data reset option in `DataSettings` calls `localStorage.clear()`.

## 11) Feature Modules

### Journal

Files:

- `pages/JournalPage.tsx`
- `components/journal/JournalEntryForm.tsx`
- `components/journal/JournalEntryList.tsx`

Capabilities:

- Entry creation with validation (`zod` + `react-hook-form`)
- Mood + tag metadata
- Template insertion
- Search + filter (tags, moods, date)
- Calendar view + daily streak logic
- Grouped rendering by date

### Habits

Files:

- `pages/HabitsPage.tsx`
- `components/HabitTracker.tsx`

Capabilities:

- Create/edit/delete habits
- Category + frequency (`daily|weekly|monthly`)
- Completion marking by date
- Streak tracking + completion-rate logic
- Category filtering + weekly checkbox popover

### Cycle tracker

Files:

- `pages/CycleTrackerPage.tsx`
- `components/cycle-tracker/*`

Capabilities:

- Period logging
- Symptom logging with severity
- Next-period prediction from cycle length
- Tabs for calendar, insights, and logs
- Feature gated by `userGender === 'female'`

### Budget

File:

- `pages/BudgetPage.tsx`

Capabilities:

- Add/delete expenses
- Category assignment
- Currency selection
- Monthly budget tracking + progress

### Pomodoro

File:

- `pages/PomodoroPage.tsx`

Capabilities:

- Work/break timer
- Start/pause/reset
- Session completion counters
- Save/load/delete named presets

## 12) Navigation and Information Architecture

Navigation is grouped semantically in sidebar:

- Dashboard
- Health
- Well-being
- Productivity
- Preferences

This grouping mirrors the product motive:

- Health trackers
- Mindset tracking
- Execution/productivity tools

## 13) Design Patterns in UI

Consistent design language:

- Glass-like card surfaces (`glass-card`)
- Domain color coding (water, calories, mood, etc.)
- Pills, badges, icons to encode category/state
- Toasts for immediate user feedback
- Mobile-first fallback via `useIsMobile` and sheet menu

Common component pattern:

- "Header row + category pill"
- "Key metric"
- "Action controls"
- "Secondary details/history block"

## 14) Known Architectural Gaps (Current State)

These are not failures, just current maturity boundaries:

- Shared state between mini widgets and full pages is not centralized.
- Some pages include demo/static/randomized content blocks.
- Data schemas are repeated in multiple places (e.g. `DashboardItems` interface duplication).
- No backend sync/auth; all data is browser-local.

## 15) Suggested Evolution Path

If the goal is stronger production coherence, the next upgrades should be:

1. Introduce a single data layer for tracker domains (context/store/query-backed local adapter).
2. Reuse domain hooks across mini + full pages (e.g. `useWaterTracker`, `useMoodTracker`).
3. Consolidate duplicated type definitions into shared `types/`.
4. Replace placeholder/demo sections with persisted analytics.
5. Add migrations/versioning for `localStorage` data shape evolution.

---

This guide reflects the current code as implemented and is intended as a living architecture reference for future contributors.
