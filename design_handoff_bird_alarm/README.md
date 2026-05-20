# Handoff: Lark — Nature-Themed Alarm App

## Overview

**Lark** is a mobile alarm app with a bird/nature visual identity. It has three screens:
1. **Alarm list** — greeting, next-chime countdown, list of alarm cards with day pills and toggles.
2. **Edit alarm** — a custom radial "sun-dial" time picker with a draggable bird-in-flight knob, plus label/repeat/mood/sound config.
3. **Ringing scene** — full-bleed animated sunrise (gradient sky, layered mountains, drifting clouds, gliding flock, falling feathers, swaying grass) with snooze + wake actions.

Four nature-inspired palettes named after birds: **Goldfinch** (sunrise warm — default), **Warbler** (meadow green), **Kingfisher** (teal/aqua), **Cardinal** (pink/hibiscus).

---

## About the Design Files

The files in `reference/` are **design references created in HTML/React/SVG** — prototypes showing the intended look, behavior, and interactions. They are **not production code** to copy directly.

Your task is to **recreate these designs inside your existing Expo / React Native codebase**, using its established patterns, libraries, and component conventions. Map the HTML/CSS/SVG to React Native primitives (see "React Native Translation Notes" below).

---

## Fidelity

**High-fidelity.** Colors, typography, spacing, radii, shadows, animations, and interactions are all final. Recreate pixel-perfectly using your codebase's libraries.

---

## Design Tokens

### Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Display (large times, greeting) | **Fraunces** | 400–500 | Variable serif. Letter-spacing `-0.02em` to `-0.04em`. Tabular figures preferred. |
| Body / UI | **Inter** | 400–700 | Default app font. |
| Caption / mono (labels, dates) | **JetBrains Mono** | 400–500 | All-caps with letter-spacing 1.5–3px for tiny labels. |

All three are available on Google Fonts. In Expo, use `expo-font` + `@expo-google-fonts/fraunces`, `@expo-google-fonts/inter`, `@expo-google-fonts/jetbrains-mono`.

**Type scale (pixel sizes used):**
- 110 — ringing-screen hero time
- 76  — picker hero time
- 44  — alarm card time
- 42  — alarm list greeting
- 22  — ringing-screen label
- 17  — status time
- 15  — body / button
- 14  — secondary body
- 13  — meta
- 12  — small button label / day pill
- 11  — mono badges
- 10  — micro badges

### Color Palettes

Each palette is an object with the same keys. The app swaps between them at runtime. Default is `goldfinch`.

```ts
type Palette = {
  name: string;
  bg: string;            // base background fill
  bgGradient: string;    // radial gradient string (translate to LinearGradient props)
  surface: string;       // cards, dials
  surfaceSoft: string;   // muted card / chip background
  text: string;          // primary text
  sub: string;           // secondary text
  border: string;        // 1px hairlines (often rgba of text)
  accent: string;        // primary action color
  accentSoft: string;    // accent tint (selected pill backgrounds)
  warm: string;          // gradient companion to accent
  pink: string;          // tertiary accent
  leaf: string;          // green accent
  sky: string;           // blue accent
  sun: string;           // dial knob mid color
  sunGlow: string;       // dial knob outer halo
};
```

**Goldfinch (default — sunrise warm)**
| Key | Value |
|---|---|
| bg | `#FFF1E2` |
| bgGradient | radial `#FFD9B8 0%` → `#FFE8D1 35%` → `#FFF1E2 70%` from top |
| surface | `#FFFFFF` |
| surfaceSoft | `#FFF8EE` |
| text | `#2A1A0E` |
| sub | `#7A5C45` |
| border | `rgba(42,26,14,0.08)` |
| accent | `#FF7A3D` |
| accentSoft | `#FFD5BD` |
| warm | `#FFB36B` |
| pink | `#FF9C8A` |
| leaf | `#7FA86E` |
| sky | `#9EC8DD` |
| sun | `#FFB347` |
| sunGlow | `#FFD27A` |

**Warbler (meadow green)** — accent `#5BA84E`, warm `#F2C14E`, bg `#EEF5E4`, text `#1F2A1A`, sub `#56664A`.

**Kingfisher (teal)** — accent `#1E8EA1`, warm `#FFB36B`, bg `#E5F1F2`, text `#0E2A2D`, sub `#4D6F73`.

**Cardinal (pink/hibiscus)** — accent `#E04E7A`, warm `#FFB36B`, bg `#FFE9EE`, text `#2E0F1B`, sub `#7C4E60`.

Full palette object is in `reference/palettes.jsx`.

### Spacing & Radius

| Token | px |
|---|---|
| Page side padding | 22 |
| Card padding | 18 / 20 (vert / horiz) |
| Row padding | 14 / 16 |
| Card gap (vertical list) | 14 |
| Card radius | **26** (alarm cards), **24** (large) |
| Row radius | **18** |
| Pill radius | **999** (full pill) |
| Chip / segmented button | 12 |
| Input field | 12 |
| Big CTA button | 22 |
| FAB | 64×64, fully round |

### Shadows

- **Card (alarm on)**: `0 8px 22px {accent}18, 0 1px 2px rgba(0,0,0,0.04)`
- **Card (alarm off)**: `0 1px 2px rgba(0,0,0,0.03)` with `opacity: 0.7`
- **FAB**: `0 12px 28px {accent}55, 0 2px 4px rgba(0,0,0,0.08)`
- **Dial knob**: `0 0 32px {sun}aa, 0 0 0 6px {accent}22, 0 4px 14px rgba(0,0,0,0.18)`
- **Wake button**: `0 10px 28px {accent}88`

In RN translate to `shadowColor / shadowOffset / shadowOpacity / shadowRadius` (iOS) and `elevation` (Android). For colored glow shadows, iOS supports them natively; Android may need a workaround (e.g. a blurred View underneath).

### Animation Easing

- Toggle, mode switch, picker arc: `cubic-bezier(.2, .7, .2, 1)` over 200–320 ms
- Card / screen entry: 380 ms fade + 8 px translate-Y
- Scale-in (ringing time hero): 320 ms scale 0.96 → 1, opacity 0 → 1
- Sun rise (scene): 8 s ease-out, `translateY 60% → 0%`, opacity 0.6 → 1
- Cloud drift: 70–110 s linear infinite
- Bird glide: 24 s / 32 s / 42 s linear infinite, traversing the full width
- Feather fall: 11–17 s linear infinite, vertical with rotation 
- Grass sway: 3–4 s ease-in-out infinite, rotate -3° ↔ 3°
- Glow pulse (badge dot): 1.6 s, box-shadow expand 0 → 30 px

---

## Screens

### 1. Alarm List Screen

**Layout** (top to bottom, full bleed):
1. Status bar (system).
2. **Header block** (`padding: 60 22 0`):
   - Top line: small feather icon (12 px) + space + meta text "Wednesday  ·  May 20" (mono, 11 px, letter-spacing 2, uppercase, sub color).
   - Greeting: Fraunces 42 px / weight 400, time-dependent text (e.g., "The lark is calling, Maya.").
   - Subline (14 px, sub color): "Next chime in **6h 12m** · Dawn chorus" or "No alarms set. Rest easy."
3. **Decorative birds**: 3 small bird-silhouette SVGs positioned absolutely in the top-right of the header area, opacity 0.3–0.55.
4. **Decorative sun glow**: a 160×160 radial-gradient circle at top-right, ~55% opacity, low-positioned behind the header.
5. **Alarm cards stack** (gap 14):
   - Each card: white surface, radius 26, 1px border `border` color.
   - Left-edge accent bar (4 px wide, gradient `warm → accent`) shows when alarm is on.
   - Row 1: large time `Fraunces 44 / weight 500` + small `ampm` mono badge bottom-aligned + flex spacer + toggle.
   - Row 2 (mt 6): bird-themed icon (16 px, accent-tinted), bold label, "·", repeat description.
   - Row 3 (mt 12): 7 day dots, 22 px circles, S/M/T/W/T/F/S; active = filled `accent` + white text, inactive = transparent with 1 px border.
   - Off state: opacity 0.7, no accent bar, no glow shadow.
6. **FAB**: 64×64 circle, bottom-right (24 px inset, bottom 40), `linear-gradient(135deg, warm, accent)`, contains 22×22 white "+" SVG.
7. **Demo button** (preview only — remove in production): bottom-left, small pill, "▶ demo ring".

**Empty state:** if no alarms, show a centered card with sub-color text: "Tap + to set your first alarm".

**Interactions:**
- Tap card body → opens Edit screen for that alarm.
- Tap toggle → flip on/off (200 ms knob slide animation).
- Tap FAB → opens Edit screen with a new alarm pre-filled (`7:00 AM`, "Wake up", weekdays, songbird icon, Skylark sound).

**Greeting logic** (by current hour):
- < 5 → "The night birds rest."
- < 12 → "The lark is calling, Maya."
- < 17 → "Good afternoon, songbird."
- < 21 → "Evening, Maya."
- else → "Roost time. Sleep well."

**Next-chime calculation:** For each on-alarm, compute next datetime ≥ now (respecting `repeat` days; if `repeat` is empty, it's one-time and "tomorrow if past today"). Render the closest as "Next chime in **{Hh Mm}** · {label}".

---

### 2. Edit Alarm Screen

**Layout** (vertical stack, scrolls):
1. **Header row** (padding 4): `Cancel` (sub color, plain text button), centered mono uppercase label "New Alarm" or "Edit Alarm", `Save` (accent color, weight 700).
2. **Time readout** (centered, baseline-aligned row):
   - `[HH]` button — Fraunces 76 / weight 500, in a 12 px-radius pill that's filled with `accentSoft` and 1.5 px accent border when active.
   - `:` separator — Fraunces 64, sub color, weight 400.
   - `[MM]` button — same treatment.
   - To the right (margin-left 8), a 2-row stack: `AM` / `PM` pills (10–12 px, 4 px gap, fill `accent` + white text when active, else transparent sub).
   - Tap HH or MM to switch which value the dial controls.
3. **Radial dial** (340×340 square, dragging):
   - Background: white surface circle, radius 144 px, with 1 px `border` stroke.
   - 60 tick marks around the perimeter at radius 152. Every 5th is "major" (length 10, color = text, opacity 0.45, width 1.6); others are "minor" (length 4, color = sub, opacity 0.18, width 1).
   - Hour labels (12, 3, 6, 9) at radius 170 — sub color, Inter 14/500, opacity 0.65 in hour mode / 0.3 in minute mode.
   - Minute labels (:00, :15, :30, :45) at radius 170 — sub color, JetBrains Mono 13/500, opacity 0.65 in minute mode / 0 in hour mode.
   - Arc trail from 12 o'clock to the knob, radius 130, stroke `accent`, width 3, round caps, opacity 0.85.
   - **Knob ("the lark")**: 56 × 56 circle positioned on the radius-122 ring. Background = radial gradient `sunGlow → sun → accent`. Glow shadow as specified. Inside, a 28×14 white bird-curve SVG (`M2 11 Q9 2 16 11 Q23 2 30 11`, stroke white 2.2 px, round caps). Outer halo: conic-gradient ring blurred 2 px at 40% opacity.
   - Center pin: 4 px dot, sub color at 0.4 opacity.
   - Center hint (text in the middle of the dial): two mono lines, 10 px, uppercase, letter-spacing 1.5, sub color at 0.55 opacity — "guide the lark" / "·  hour  ·" (or minute).
4. **Config rows** below dial (gap 10, padding 4):
   - **Label** row — inline. Label "LABEL" (mono 10/600 uppercase letter-spacing 1.8 sub-color) on the left, right-aligned editable text input.
   - **Repeat** row — stacked. Below the title, a flex row of 7 day buttons (S M T W T F S), height 34, radius 12, fill `accent` + white + glow when selected, else `surfaceSoft` + sub.
   - **Mood** row — stacked. 4 large icon buttons (songbird, feather, owl, dove), flex equal, padding 10×4, radius 14, vertical stack of icon + 11 px label. Active = `accentSoft` background + 1.5 px inset accent stroke + text color.
   - **Sound** row — stacked. Pills (radius 999, padding 7×12) for: Skylark, Robin, Goldfinch, Nightingale, Wren, Mourning Dove. Active = text color background + surface text. Wrap on overflow, gap 6.
5. **Delete alarm** — plain text button at bottom, color `#C8463C`, weight 600. Only shown when editing an existing alarm.

**Interactions:**
- **Dial drag**: pointer events (mouse + touch). On down, immediately set the value from pointer position. On move while dragging, continuously update. The math (see `reference/time-picker.jsx`):
  ```ts
  const cx = ringRect.left + ringRect.width / 2;
  const cy = ringRect.top + ringRect.height / 2;
  let theta = Math.atan2(clientX - cx, -(clientY - cy));   // 0 = up, clockwise
  if (theta < 0) theta += 2 * Math.PI;
  const turn = theta / (2 * Math.PI);                       // 0..1
  // hour mode: hour = round(turn * 12) || 12   (1..12)
  // minute mode: minute = round(turn * 60) % 60
  ```
  In React Native, use `react-native-gesture-handler`'s `PanGestureHandler` (or `Gesture.Pan()` from the v2 API) on a `View` sized 340×340. Compute angle from `event.x / event.y` relative to the center.
- **Mode toggle**: tapping HH or MM swaps `mode` state between `'hour'` and `'minute'`.
- **Save**: writes alarm back to list, returns to list screen.
- **Cancel**: returns without saving.
- **Delete**: removes the alarm, returns to list.

**Default new-alarm values:** `7:00 AM`, label "Wake up", repeat `[1,2,3,4,5]` (Mon–Fri), icon `songbird`, sound `Skylark`, on = true.

---

### 3. Ringing Scene (Full-bleed)

**Layered structure** (back to front):
1. **Sky gradient** (full bleed): vertical linear gradient — `#2A3D5C 0% → #6B4E7D 18% → #C26B7A 38% → #E89968 56% → #F2C28C 70% → #B8C9A8 88% → #7FA86E 100%`. This is independent of the active palette (always a dawn sky).
2. **Sun glow** at `(50%, 52%)`: 600 × 600 circle, `radial-gradient` from `#FFE7B0 → #FFB76B → rgba(255,150,90,0.4) → transparent`, `mix-blend-mode: screen`, opacity 0.85. Animation `sun-rise` 8 s ease-out (translateY 60% → 0%).
3. **Sun disc** at `(50%, 55%)`: 90 × 90 circle, radial-gradient `#FFF4D1 → #FFD27A → #FFA94D`, plus `box-shadow: 0 0 80px #FFD27A, 0 0 140px #FFA94D88`. Same rise animation.
4. **Clouds** (3 instances): 120 × 42 SVG of overlapping ellipses, white at 0.85–0.9 opacity. Drift across full width: 70 s / 95 s / 110 s linear infinite, scales 1 / 0.7 / 1.2, opacities 0.7 / 0.5 / 0.6.
5. **Flying birds** (3 layers of flocks):
   - Top flock: 1 large + 1 small bird shape, `bird-glide` 24 s linear infinite (translate full width with slight Y bob).
   - Middle flock: 3 small birds, 32 s linear (delayed −8 s).
   - High solitary: 1 small bird, 42 s linear (delayed −22 s).
   - Bird shape: `<svg viewBox="0 0 36 18"><path d="M2 10 Q9 2 18 10 Q27 2 34 10" stroke="#1A2530" strokeWidth="2" fill="none"/></svg>`.
6. **Drifting feathers** (3 instances): 22 × 36 leaf-shape SVGs with central rachis line, colors `#FFE7B0` / `#FFD6B0` / `#FFF1D6`. Fall vertically with rotation over 11 / 14 / 17 s, slight horizontal drift.
7. **Far mountains**: SVG silhouette at 28% from bottom, color `#6B4E7D`, opacity 0.75. Path: `M0 200 L0 140 L40 110 L80 130 L120 90 L170 120 L220 80 L270 110 L320 95 L380 120 L400 105 L400 200 Z`.
8. **Near mountains**: SVG silhouette at 20% from bottom, color `#3F4E5C`. Path: `M0 200 L0 150 L30 120 L70 140 L110 100 L160 130 L210 110 L260 135 L310 115 L360 140 L400 130 L400 200 Z`.
9. **Mist layer**: 80 px tall band at 18% from bottom, linear-gradient `rgba(255,220,180,0.5) → transparent`, blurred 8 px.
10. **Hills**: bottom 24% SVG with linear gradient `#5C8C56 → #2D4A2A`. Path: `M0 200 L0 100 Q60 70 130 90 Q220 115 300 80 Q360 60 400 80 L400 200 Z`.
11. **Grass blades**: 8 absolutely-positioned 3 × 30–46 px gradient slivers, base = bottom, sway -3° ↔ 3° on 3–4 s loop with staggered delays. Color `linear-gradient(180deg, #6BA15C, #2D4A2A)`.
12. **Foreground darkening**: 60 px linear gradient `transparent → #1F3318` at the very bottom.
13. **Warm shimmer**: full-bleed radial `rgba(255,220,150,0.18)` centered, fades to transparent at 50%.
14. **Dimming vignette**: top/bottom subtle dark gradient over everything (`rgba(0,0,0,0.18 → 0 → 0 → 0.45)`).

**Foreground content** (over the scene):
- **Top center (≈18% from top)**, scale-in animated:
  - "NOW SINGING" pill — 10 px bold mono uppercase, letter-spacing 2, inside `rgba(255,255,255,0.18)` + blur(12px), padding 4×10, radius 999. Includes a 6 px red dot (`#FF6B6B`) that pulses (`glow-pulse` 1.6 s).
  - Below (margin-top 14): time-based greeting, mono 11 px, letter-spacing 3, uppercase, opacity 0.85.
    - < 5 → "Pre-dawn chorus" / < 12 → "The lark is calling" / < 17 → "Afternoon flight" / < 21 → "Evening roost" / else → "Night birds singing"
  - Below (mt 6): the alarm time, Fraunces 110 / weight 400 / letter-spacing -0.04em / line-height 1.
  - Below (mt 4): the alarm label, Fraunces 22.
  - Below (mt 14): sound chip — `♪ {sound}` (default "Rainforest" fallback), 11 px, in a `rgba(255,255,255,0.12)` blurred pill.
- **Bottom (24 px insets, gap 12)**:
  - "Snooze · 9 min" button — full width, padding 18, radius 22, `rgba(255,255,255,0.22)` background, 1 px white-alpha border, 18 px backdrop blur, 16 px white text weight 600.
  - "Wake up" button — full width, padding 20, radius 22, `linear-gradient(135deg, warm, accent)`, 17 px white text weight 700, big colored shadow.
- **Bottom scrim**: 220 px tall vertical gradient `transparent → rgba(0,0,0,0.35)` behind the buttons for readability.

**Optional real-video mode:** If you have a real nature MP4, use it instead of the CSS scene. In RN, use `expo-av`'s `<Video>` (or `expo-video` on newer SDKs) full-bleed, looping, muted by default, with the same foreground content on top.

**Interactions:**
- Snooze → dismiss scene, schedule alarm again in 9 minutes.
- Wake up → dismiss scene entirely.

---

## State Management

```ts
type Alarm = {
  id: number;
  hour: number;         // 1..12
  minute: number;       // 0..59
  ampm: 'AM' | 'PM';
  label: string;
  repeat: number[];     // 0=Sun, 6=Sat. Empty = one-time.
  icon: 'songbird' | 'feather' | 'owl' | 'dove';
  sound: string;        // one of the sound options
  on: boolean;
};

type AppState = {
  alarms: Alarm[];
  screen: 'list' | 'edit' | 'trigger';
  editing: Alarm | null;       // alarm being edited (or new one being created)
  triggered: Alarm | null;     // alarm currently ringing
  paletteKey: 'goldfinch' | 'warbler' | 'kingfisher' | 'cardinal';
};
```

**Default alarms (seed data):**
```ts
[
  { id: 1, hour: 6, minute: 30, ampm: 'AM', label: 'Dawn chorus',    repeat: [1,2,3,4,5], icon: 'songbird', sound: 'Skylark',       on: true  },
  { id: 2, hour: 7, minute: 15, ampm: 'AM', label: 'Morning flight', repeat: [0,6],       icon: 'feather',  sound: 'Goldfinch',     on: true  },
  { id: 3, hour: 9, minute: 0,  ampm: 'PM', label: 'Roost time',     repeat: [0,1,2,3,4,5,6], icon: 'owl', sound: 'Mourning Dove', on: false },
]
```

**Trigger logic:** every second, compute current `(h12, minute, ampm, dayOfWeek)`. If any on-alarm matches and `seconds < 5`, switch to the trigger screen. (In a real Expo app, replace the in-app interval with `expo-notifications` for actual scheduling.)

**Persistence:** use `expo-secure-store` or `@react-native-async-storage/async-storage` to persist `alarms` and `paletteKey`.

---

## SVG Icons (extract these as `react-native-svg` components)

All icons are 24×24 viewBox unless noted. `color` is filled from the palette's `accent` (or a passed prop).

**Songbird (perched):**
```xml
<path d="M5 16c0-3 2-6 6-6 2 0 3 .5 4 1.5l4-2.5-1 4 2 1-3 1c-.5 2.5-3 4.5-6 4.5-3 0-6-1-6-3.5z" fill={color}/>
<circle cx="16.5" cy="10.5" r="0.7" fill="#fff"/>
<path d="M11 19l-1 3M13 19l0 3" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
```

**Feather:**
```xml
<path d="M19 5c-7 0-12 5-13 11l2 2 6-1c4-1 7-5 7-9V5z" fill={color}/>
<path d="M19 5L6 18" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
```

**Owl:**
```xml
<ellipse cx="12" cy="13" rx="7" ry="8" fill={color}/>
<circle cx="9" cy="11" r="2.4" fill="#fff"/>
<circle cx="15" cy="11" r="2.4" fill="#fff"/>
<circle cx="9" cy="11" r="1" fill="#1a1a1a"/>
<circle cx="15" cy="11" r="1" fill="#1a1a1a"/>
<path d="M12 13l-1 1.5h2L12 13z" fill="#1a1a1a"/>
<path d="M6 6l3 3M18 6l-3 3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
```

**Dove (in flight):**
```xml
<path d="M2 14c2 1 5 1 7-1 1 1.5 3 2 5 2 4 0 7-3 8-7-2 1-4 1-6 0 0-2-2-3-4-3-3 0-5 2-5 5-2 0-4 1-5 4z" fill={color}/>
<circle cx="19" cy="7" r="0.7" fill="#fff"/>
```

**Bird-glyph (used in flock + dial knob + decorative):** viewBox `0 0 32 12`
```xml
<path d="M2 9 Q8 1 16 9 Q24 1 30 9" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
```

**Plus (FAB):**
```xml
<path d="M11 3v16M3 11h16" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"/>
```

---

## React Native / Expo Translation Notes

| Web concept used | RN equivalent |
|---|---|
| `<div>` + flex | `<View>` with `style={{ ... }}` |
| SVG (inline) | `react-native-svg` (`<Svg>`, `<Path>`, `<Circle>`, `<G>`, `<Defs>`, `<LinearGradient>`, `<RadialGradient>`) |
| `linear-gradient` / `radial-gradient` background | `expo-linear-gradient` (`<LinearGradient>`) or `react-native-radial-gradient` for radial; for the dial knob's radial gradient, an `<Svg>` with `<RadialGradient>` inside is cleanest |
| `backdrop-filter: blur()` | `expo-blur` (`<BlurView>`) — wrap the pill content |
| `mix-blend-mode: screen` | Not directly available — approximate by stacking with opacity, or use `react-native-skia` for blend modes |
| `box-shadow` | iOS: `shadowColor / shadowOffset / shadowOpacity / shadowRadius`. Android: `elevation` (loses color). Colored glows → consider a blurred View underneath |
| Pointer drag on dial | `react-native-gesture-handler` `Gesture.Pan()` |
| CSS keyframe animations (clouds, birds, feathers, sway, sun-rise, glow-pulse) | `react-native-reanimated` with `withRepeat(withTiming(...))` + `useSharedValue`. Or for cloud/bird drift use looping `Animated.timing` with `useNativeDriver: true` |
| Google Fonts | `expo-font` + the relevant `@expo-google-fonts/*` packages |
| `position: absolute` + `inset` | `position: 'absolute', top: 0, left: 0, right: 0, bottom: 0` (no `inset` shorthand) |
| Status bar | `expo-status-bar` (`<StatusBar style="dark" />` on alarm list & edit; `style="light"` on ringing) |
| Safe area | `react-native-safe-area-context` (`<SafeAreaView>` or `useSafeAreaInsets`) |

### Recommended Expo libraries

- `expo-linear-gradient` — backgrounds and the wake-up button
- `react-native-svg` — all icons, dial ticks, mountains, clouds, feathers
- `react-native-gesture-handler` — dial drag
- `react-native-reanimated` — all animations
- `expo-blur` — frosted pills on the ringing screen
- `expo-font` + `@expo-google-fonts/fraunces`, `@expo-google-fonts/inter`, `@expo-google-fonts/jetbrains-mono`
- `@react-native-async-storage/async-storage` — persisting alarms + palette
- `expo-notifications` — real alarm scheduling
- `expo-av` or `expo-video` — playing a real nature video on the ringing screen
- `react-navigation` (`@react-navigation/native` + `native-stack`) — list ↔ edit nav. Ringing scene is best presented as a modal route (`presentation: 'fullScreenModal'`).

### Suggested file layout

```
src/
  theme/
    palettes.ts          — the 4 palettes + types
    fonts.ts             — useFonts hook wrapping the 3 families
  components/
    icons/               — Songbird, Feather, Owl, Dove, BirdGlyph, Plus, Feather (decorative)
    AlarmCard.tsx
    DayPills.tsx
    Toggle.tsx
    TimePicker.tsx       — the radial dial + AM/PM + HH/MM tabs
  screens/
    AlarmListScreen.tsx
    EditAlarmScreen.tsx
    RingingScreen.tsx
  scene/
    NatureScene.tsx      — sky, sun, mountains, hills, mist, grass
    Clouds.tsx
    Birds.tsx
    Feathers.tsx
  state/
    alarms.ts            — context or zustand store
  utils/
    nextAlarm.ts         — computeNextAlarm() helper
```

---

## Copy & Strings

Centralize these in a `strings.ts` for easy editing. All current copy is shown above in each screen section.

- **App name**: Lark
- **Status pills**: "NOW SINGING"
- **Dial center hint**: "guide the lark"
- **FAB action**: opens a new alarm with default label "Wake up"
- **Sound options**: Skylark, Robin, Goldfinch, Nightingale, Wren, Mourning Dove
- **Mood (icon) labels**: Songbird, Feather, Owl, Dove
- **Repeat helpers**: "Every day", "Weekdays", "Weekends", "One-time", or comma-joined day initials

---

## Assets

There are no bitmap assets. Everything is SVG or CSS-generated. Optional: replace the CSS sunrise scene with a real nature video (e.g., a looping 10–20 s 1080p MP4 from your media library or Pexels).

---

## Files

- `reference/index.html` — entry point that loads everything
- `reference/app.jsx` — top-level state, screen routing, default alarms, Tweaks integration
- `reference/palettes.jsx` — all 4 palette definitions
- `reference/alarm-list.jsx` — list screen, alarm cards, toggle, icons, helpers (`greeting`, `formatDate`, `computeNextAlarm`)
- `reference/edit-alarm.jsx` — edit screen wrapping the picker
- `reference/time-picker.jsx` — radial sun-dial component with drag math
- `reference/nature-scene.jsx` — sunrise scene composition (sky, sun, clouds, birds, feathers, mountains, hills, grass)
- `reference/styles.css` — keyframes, fonts, helper classes
- `reference/ios-frame.jsx` — iPhone bezel used in the prototype (not needed in production — RN runs on a real device)
- `reference/tweaks-panel.jsx` — runtime tweaks panel used during design exploration (not needed in production)
