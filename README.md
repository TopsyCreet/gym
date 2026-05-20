# Irongate Gym App

Irongate is a solo-leveling gym progress tracker built with React, TypeScript, Vite, Tailwind CSS, and Zustand.

## What it does

- Verifies gym check-ins using simulated geolocation
- Prevents multiple check-ins in a single day
- Assigns daily workout challenges with time-based completion requirements
- Requires timer completion and gym verification before a challenge can be marked complete
- Tracks achievements, milestones, and reward progress
- Lets users customize their weekly workout plan by editing each day

## Features

- **Daily check-in verification**: one check-in per day only
- **Challenge verification**: users must start a challenge, wait the required duration, then complete it at the gym
- **Achievements tab**: shows unlocked and locked milestone achievements
- **Gym plan tab**: edit each day of the week and save a custom workout plan
- **Progress tracking**: XP, streaks, check-ins, and weekly attendance charts

## Getting Started

### Install dependencies

```bash
npm install
```

### Run the app

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

## Project structure

- `src/pages` — main application pages, including Dashboard, Profile, Leaderboard, and authentication
- `src/components` — reusable UI components and feature cards
- `src/store` — Zustand state management for authentication and gym logic
- `src/data` — challenge, achievement, and workout plan definitions
- `src/utils` — helper utilities for geofencing, streaks, and XP calculations

## Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Framer Motion
- React Router

## Notes

The project currently uses a simulated gym location verification flow for demo purposes.
