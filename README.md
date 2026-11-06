# PrayForOthers

A Devvit application that helps support prayer communities on Reddit.

Built using:

- Devvit Web
- React
- TypeScript
- Hono
- Tailwind CSS

---

# Features

## 1. Prayer Report Generator

Generates a report of unanswered prayer posts.

When a moderator selects:

```text
Generate Prayer Report
```

the app will:

1. Search `r/PrayerRequests`
2. Look at posts created within the last 30 days
3. Find posts with zero comments
4. Generate a report
5. Post the report into the subreddit where the app is installed

Example:

```text
Unanswered Posts Report (42)
```

---

## 2. Amen Auto-Reply

When a user comments:

```text
Amen
```

the bot automatically replies:

```text
Amen
```

The bot:

- ignores its own comments
- replies only once per Reddit post
- prevents reply loops

Example:

```text
User:
Amen

Bot:
Amen
```

---

## 3. Dynamic Item Requests

Users can request an item by mentioning the bot:

```text
u/prayforothers please give me a coffee
```

The bot responds:

```text
Hey u/ExampleUser, here is your coffee.
```

Examples:

```text
u/prayforothers please give me a cookie
```

↓

```text
Hey u/ExampleUser, here is your cookie.
```

```text
u/prayforothers please give me a pizza
```

↓

```text
Hey u/ExampleUser, here is your pizza.
```

```text
u/prayforothers please give me a giant purple dragon
```

↓

```text
Hey u/ExampleUser, here is your giant purple dragon.
```

---

# Development

## Requirements

- Node.js 24+
- Devvit CLI
- Reddit account
- Reddit Developer account

Install Devvit:

```bash
npm install -g devvit
```

Login:

```bash
devvit login
```

---

# Running Locally

Start playtest mode:

```bash
npm run dev
```

This uploads the current build and launches a Reddit playtest version.

---

# Type Checking

Run TypeScript validation:

```bash
npm run test:types
```

---

# Build

Build the application:

```bash
npm run build
```

---

# Deploy

Upload a new version:

```bash
npm run deploy
```

---

# Publish

Publish the application:

```bash
npm run launch
```

---

# Test Subreddit

Current development subreddit:

```text
r/prayforothers_dev
```

---

# Menu Actions

Moderator Menu:

```text
Generate Prayer Report
```

Creates a report of unanswered posts from:

```text
r/PrayerRequests
```

and posts the report into the installed subreddit.

---

# Project Structure

```text
src
├── client
│   ├── global.ts
│   ├── index.css
│   ├── module.d.ts
│   ├── splash.html
│   └── splash.tsx
│
├── server
│   ├── core
│   │   └── post.ts
│   ├── index.ts
│   └── routes
│       ├── menu.ts
│       └── triggers.ts
│
└── shared
    └── api.ts
```
