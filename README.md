# PrayForOthers

A Devvit application that helps prayer communities identify unanswered prayer requests and provides interactive community bot features.

Built with:

- Devvit Web
- TypeScript
- Hono
- React
- Tailwind CSS

---

# Features

## 1. Prayer Report Generator

Generates a report of unanswered prayer requests from:

```text
r/PrayerRequests
```

The report:

- Searches the previous 30 days
- Finds posts with zero comments
- Sorts them by age
- Creates a report post in the subreddit where the app is installed

Moderator Menu:

```text
Generate Prayer Report
```

---

## 2. Amen Auto Reply

When a user comments:

```text
Amen
```

the bot automatically replies:

```text
Amen
```

Features:

- Case-insensitive matching
- Ignores the bot's own comments
- Prevents infinite loops
- Responds only once per Reddit post

Example:

```text
User:
Amen

Bot:
Amen
```

---

## 3. Dynamic Item Requests

A user can request an item by mentioning the bot.

Example:

```text
u/prayforothers please give me a coffee
```

Response:

```text
Hey u/ExampleUser, here is your coffee.
```

Additional examples:

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

## 4. Delete All Prayer Reports

Deletes prayer reports created by the app.

Moderator Menu:

```text
Delete All Prayer Reports
```

Features:

- Tracks report posts created by the app
- Deletes only tracked report posts
- Does not affect normal subreddit content
- Cleans up old report posts in bulk

Example:

```text
Delete All Prayer Reports
```

↓

```text
Deleted 5 prayer reports.
```

---

# Moderator Menu

The app currently provides:

```text
Generate Prayer Report

Delete All Prayer Reports
```

---

# Development

## Requirements

- Node.js 22 or later
- Devvit CLI
- Reddit Developer Account
- Git

---

# Installation

Clone the repository:

```bash
git clone https://github.com/dominicoki/prayforothers-reddit-devvit-app.git
```

Enter the project:

```bash
cd prayforothers-reddit-devvit-app
```

Install dependencies:

```bash
npm install
```

Login to Devvit:

```bash
devvit login
```

---

# Running in Playtest Mode

Start local development:

```bash
npm run dev
```

This uploads a playtest version to Reddit.

---

# Type Checking

Validate TypeScript:

```bash
npm run test:types
```

---

# Build

Build the project:

```bash
npm run build
```

---

# Deploy

Upload a new app version:

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

---

# Current Version

## v1.1

Features included:

- Prayer Report Generator
- Amen Auto Reply
- Dynamic Item Requests
- Delete All Prayer Reports

---

# License

Personal project for Reddit community support and prayer outreach.
