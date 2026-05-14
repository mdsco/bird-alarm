# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Does

Bird Alarm is a React Native mobile app that wakes users up with a daily bird video. Users set a daily alarm time; at that time a notification fires and opens a full-screen video of a new bird species. Videos are pre-downloaded overnight via a background task. Watched birds accumulate in a library.

## Commands

### Frontend (Expo)

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS simulator
npm run web        # Run in browser
```

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` before running.

### Backend (AWS Lambda)

```bash
cd backend/functions/daily-video
npm install
npm run build      # Compile TypeScript → dist/

# Deploy (from backend/)
sam deploy --guided
```

No lint or test commands are configured.

## Architecture

### Frontend

**Expo Router** (file-based routing) with two tabs and a modal-style video player:

- [app/(tabs)/index.tsx](app/(tabs)/index.tsx) — Alarm screen: set time, see today's bird card, trigger download
- [app/(tabs)/library.tsx](app/(tabs)/library.tsx) — History of all watched birds
- [app/video-player.tsx](app/video-player.tsx) — Full-screen video playback, opened by notification tap
- [app/_layout.tsx](app/_layout.tsx) — Root layout; registers background task, handles notification taps → navigation

**Hooks** own all async state:
- [hooks/useDailyVideo.ts](hooks/useDailyVideo.ts) — Fetches from API (once per day), caches metadata in AsyncStorage, triggers video download
- [hooks/useAlarm.ts](hooks/useAlarm.ts) — Persists and schedules alarm via expo-notifications
- [hooks/useDeviceId.ts](hooks/useDeviceId.ts) — Generates UUID on first launch, stores in SecureStore (persists across iOS reinstalls)

**Services** are stateless utilities called by hooks:
- [services/api.ts](services/api.ts) — Single `GET /daily-video?device_id=<uuid>` call
- [services/alarm.ts](services/alarm.ts) — expo-notifications scheduling wrapper
- [services/storage.ts](services/storage.ts) — AsyncStorage/SecureStore read/write
- [services/downloader.ts](services/downloader.ts) — Downloads video to `FileSystem.cacheDirectory/bird-alarm/videos/`

**Background task** ([tasks/backgroundDownload.ts](tasks/backgroundDownload.ts)) runs overnight to pre-download the daily video. **It must be imported at the top of [app/_layout.tsx](app/_layout.tsx) before any React render** so TaskManager registers it when the JS bundle loads in headless mode.

### Backend

Single Lambda function behind API Gateway (HTTP API):

```
GET /daily-video?device_id=<uuid>
→ Load manifest.json from S3 (in-memory cache, 5 min TTL)
→ Query DynamoDB for device's watch history
→ Return next unseen video (wraps around if all seen)
→ Record assignment in DynamoDB
```

Response: `{ videoId, videoUrl, thumbnailUrl, species, description }`  
`videoUrl` and `thumbnailUrl` point to CloudFront, not S3 directly.

Infrastructure: Lambda + API Gateway + DynamoDB (one item per device) + S3 (manifest + videos) + CloudFront (CDN). Defined in [backend/template.yaml](backend/template.yaml) (SAM/CloudFormation).

### State Persistence

| Data | Storage |
|------|---------|
| Device ID | SecureStore (Keychain/Keystore) |
| Alarm time & enabled | AsyncStorage |
| Today's video metadata | AsyncStorage |
| Last fetch date (daily gate) | AsyncStorage |
| Watched bird library | AsyncStorage |

Storage keys are defined in [constants/storage-keys.ts](constants/storage-keys.ts).

## Key Constraints

- **TypeScript strict mode** is enabled across both frontend and backend.
- **Expo new architecture** (`newArchEnabled: true`) is enabled — avoid libraries incompatible with it.
- The daily video fetch is idempotent: same video is returned if the API is called multiple times on the same calendar day.
- The `@/*` path alias maps to the project root (configured in [tsconfig.json](tsconfig.json)).
