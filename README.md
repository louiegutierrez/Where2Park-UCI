# Where2Park

Where2Park is a local UC Irvine parking planner. It imports a class schedule, maps class locations, estimates class-to-class walking gaps, and recommends a parking zone and permit type for the quarter.

## Run

```bash
cd ~/Desktop/Where2Park
npm run dev
```

Open `http://localhost:5173`.

## Import formats

- `.ics` calendar export
- `.csv` with columns like `course,days,start,end,location`
- pasted schedule text such as `ICS 31 MW 9:00-9:50 ICS 174`

Parking rates and permit rules are based on the UCI Transportation 2025-2026 student permit and rate pages. Always confirm final purchase eligibility and availability in myCommute.
