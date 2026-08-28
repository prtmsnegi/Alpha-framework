# Alpha

A personal habit-tracking app built around three frameworks:

- **Groom** — grooming, skincare, self-care
- **Shred** — fitness and health
- **Style** — dressing and personal presentation

Open the app, see what's pending today and this week, check things off, done. Tasks are
fully user-defined (nothing is hard-coded to the built-in examples) and support two
recurring cadences — *X times per day* / *X times per week* — plus a third, non-recurring
**one-time task with a due date**. Every completion is logged as a permanent history
record (never just a checkbox toggle), so daily/weekly counters can reset cleanly without
ever losing past data.

The Dashboard also gives quick access to a **Pomodoro** timer: a 4-session focus cycle
(default 25 min work / 5 min short break / 30 min long break, all configurable) that
auto-advances between segments and chimes at each transition.

## Stack

React 19 + Vite + Tailwind CSS v4, `lucide-react` icons. State via React Context, all
data persisted to the browser's `localStorage` (no backend, no account, no cloud sync —
this is a single-user, single-device personal tool). Dark and light themes are both
fully styled; toggle from the sun/moon button on the Dashboard.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
npm run lint
```

## Companion app

[Fix-Your-Calorie](https://github.com/prtmsnegi/Fix-Your-Calorie) is a separate nutrition
tracker. Alpha's Shred screen is built against a `HealthDataProvider` interface
(`src/services/healthData/`) so it can read nutrition/weight data from that app later
without any rework — for now it's a stub with no data connected.
