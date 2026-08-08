# BlockMerge

A free, drag-and-drop grid puzzle game. Drop pieces onto the 8×8 board, clear full
rows/columns, chain combos for score. Built with Expo + React Native + TypeScript
so the same codebase ships to iOS App Store and Google Play.

## Project structure

```
blockmerge/
├── App.tsx                    # entry point
├── src/
│   ├── game/
│   │   ├── types.ts           # Grid, Piece, GameState types
│   │   ├── pieces.ts          # piece shape library + random generation
│   │   ├── logic.ts           # placement/clearing/scoring/game-over (pure, tested)
│   │   └── logic.test.ts      # 12 passing unit tests on the logic above
│   ├── components/
│   │   ├── GridBoard.tsx      # renders the playfield + drag preview
│   │   └── PieceTray.tsx      # draggable pieces (gesture-handler + reanimated)
│   ├── screens/
│   │   └── GameScreen.tsx     # wires board + tray + logic together
│   ├── utils/storage.ts       # AsyncStorage high-score persistence
│   └── theme/index.ts         # colors, spacing, piece palette
├── app.json                   # Expo app config (bundle IDs, icons, etc.)
├── eas.json                   # EAS Build profiles (dev/preview/production)
└── package.json
```

## Run it locally

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) to play on your phone instantly,
or press `i` / `a` in the terminal for a simulator/emulator.

Run the logic tests any time you change game rules:

```bash
npm test
```

## Before you ship: things YOU need to fill in

1. **App identity** — in `app.json`, replace:
   - `ios.bundleIdentifier` and `android.package` with your own reverse-DNS
     identifier (e.g. `com.yourname.blockmerge`). This must be unique across
     both stores and can't be changed later.
2. **Icons & splash** — drop real assets into `src/assets/` (1024×1024 icon,
   adaptive icon foreground for Android) and reference them in `app.json`.
3. **EAS project** — run `eas init` once (see below) to get a real
   `extra.eas.projectId` and paste it into `app.json`.
4. **Monetization (optional, since you want it free)** — the game is fully
   playable with zero payment. If you want ad-supported revenue later, add
   `react-native-google-mobile-ads` and drop a banner/interstitial into
   `GameScreen.tsx` between rounds — I didn't wire real ad unit IDs since
   those come from your own AdMob account.

## Publishing to the App Store & Play Store

This uses **EAS Build**, Expo's cloud build service — it produces real signed
binaries without you needing a Mac for the iOS build.

```bash
npm install -g eas-cli
eas login                 # your Expo account
eas init                  # links this project to an EAS project, fills projectId
```

### Android (Google Play)
1. Create a [Google Play Console](https://play.google.com/console) account
   ($25 one-time).
2. `eas build --platform android --profile production`
3. Download the `.aab` EAS gives you, or run `eas submit --platform android`
   to upload it straight to Play Console.
4. In Play Console: fill out the store listing (screenshots, description,
   content rating questionnaire, privacy policy URL), then submit for review.

### iOS (App Store)
1. Enroll in the [Apple Developer Program](https://developer.apple.com/programs/)
   ($99/year).
2. `eas build --platform ios --profile production` — EAS handles signing
   certificates for you interactively on first run.
3. `eas submit --platform ios` to upload the build to App Store Connect.
4. In App Store Connect: fill out the listing, screenshots (EAS can generate
   these too via `eas build:configure`), and submit for review.

Both reviews typically take 1–3 days. Google's is usually faster than Apple's.

## Design notes

- **Genre**: this is a "block puzzle" (Blockudoku / 1010!-style) game —
  proven, evergreen category, simple enough to build well rather than
  half-build something more ambitious.
- **Free to use**: no paywall, no required account, no forced ads. Fully
  playable offline.
- **Extensible**: `src/game/logic.ts` is pure and fully unit-tested, so you
  can safely add features (power-ups, daily challenges, themes) without
  breaking the core rules — just add tests alongside them.
