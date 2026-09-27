# o'feeling 🐾

A cozy personal life organizer: daily check-ins, a cat companion (Mochi), an adaptive study planner, a color-coded calendar, a syllabus tracker, a CGPA planner and a societies tracker.

## Run it

```bash
npm install
npm run dev      # open the printed localhost link (best on phone width)
```

Data is saved in your browser (localStorage).

## How it works

- **Check in**: pick a mood and an energy level (1–5) and write what's on your mind. It plans study blocks around your classes: fewer on low days, more on ambitious days, never zero. Weak subjects and near exams get priority.
- **Just talk**: write "tech society meeting at 5pm" or "DBMS viva at 3pm tomorrow" and it lands on the calendar.
- **Tick off** a study block and the syllabus topic behind it gets marked done too.

## Real AI (optional)

Deploy to Vercel and set `ANTHROPIC_API_KEY`. `api/chat.js` then powers Mochi (`COMPANION_MODEL` is optional). Without a key, Mochi uses a built-in offline companion.

## Roadmap

Google Classroom import · Google Calendar sync · WhatsApp reminder bot · syllabus PDF upload · weekly reflection
