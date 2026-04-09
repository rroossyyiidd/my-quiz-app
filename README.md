# AI Placement Test — Quiz Application

An interactive web application for **Computer Science placement tests**. Users can register, log in, take timed multiple-choice quizzes, and view their results and quiz history.

## Tech Stack

| Layer            | Technology                                          |
| ---------------- | --------------------------------------------------- |
| Framework        | [Next.js 16](https://nextjs.org/) (App Router)      |
| Language         | TypeScript 5                                        |
| UI Library       | React 19                                            |
| Styling          | Tailwind CSS 4 + Custom CSS (glassmorphism, mesh)   |
| State Management | React Context (auth), TanStack React Query 5 (data) |
| Fonts            | Geist Sans & Geist Mono (via `next/font/google`)    |
| Linting          | ESLint 9 + eslint-config-next                       |
| Quiz Data Source | [Open Trivia Database (OpenTDB)](https://opentdb.com/) |
| Auth & Storage   | LocalStorage (client-side mock)                     |

## Key Features

- **Registration & Login** — localStorage-based authentication with form validation
- **Dashboard** — Summary statistics (tests taken, tests passed, best score), quiz history with continue quiz feature
- **Quiz Engine** — 5 multiple-choice questions from OpenTDB, 5-minute total timer, auto-submit on timeout, progress auto-save
- **Async Result Processing** — Submit quiz to API Route (mock), poll status until `completed`
- **Quiz History** — Per-user history stored in localStorage
- **Responsive & Animated UI** — Dark theme, gradient mesh background, glassmorphism cards, micro-animations

## Architecture & Project Structure

```
my-quiz-app/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (providers, fonts, metadata)
│   ├── page.tsx                  # Entry redirect (→ /dashboard or /login)
│   ├── globals.css               # Global styles, animations, design tokens
│   ├── _components/              # Shared UI components
│   │   ├── button.tsx            #   Reusable Button (variant, size, loading)
│   │   ├── card.tsx              #   Glass-effect Card container
│   │   ├── input.tsx             #   Styled form Input
│   │   ├── error-display.tsx     #   Error message display
│   │   ├── loading-spinner.tsx   #   Loading spinner indicator
│   │   └── progress-bar.tsx      #   Quiz progress bar
│   ├── (public)/                 # Route group: public pages (no auth required)
│   │   ├── layout.tsx            #   Public layout (centered, floating orbs)
│   │   ├── login/page.tsx        #   Login page
│   │   └── register/page.tsx     #   Registration page
│   ├── (authenticated)/          # Route group: protected pages
│   │   ├── layout.tsx            #   Authenticated layout (header, sign out modal, auth guard)
│   ├── dashboard/page.tsx        #   Dashboard & quiz history
│   └── quiz/                 #   Quiz module
│       ├── page.tsx          #     Quiz page (state machine UI)
│       ├── _components/      #     Quiz-specific components
│       │   ├── quiz-loading.tsx
│       │   ├── quiz-runner.tsx
│       │   ├── quiz-processing.tsx
│       │   ├── quiz-result.tsx
│       │   └── quiz-error.tsx
│       └── _hooks/           #     Quiz-specific hooks
│           ├── use-quiz.ts           # Main quiz state machine
│           ├── use-quiz-questions.ts # Fetch questions (useQuery)
│           ├── use-submit-quiz.ts    # Submit answers (useMutation)
│           └── use-quiz-result.ts    # Poll result (useQuery + refetchInterval)
│   └── api/                      # Next.js API Routes (Route Handlers)
│       └── placement-test/
│           ├── _store.ts         #   In-memory result store (globalThis)
│           ├── submit/route.ts   #   POST: submit quiz → return taskId
│           └── result/[taskId]/route.ts  # GET: poll quiz result by taskId
│
├── api/                          # Client-side API layer
│   ├── auth/
│   │   ├── index.ts              #   Auth functions (login, register, logout)
│   │   └── type.ts               #   Auth types (TUser, TLoginPayload, etc.)
│   └── quiz/
│       ├── index.ts              #   Quiz API functions (fetch, submit, getResult)
│       └── type.ts               #   Quiz types (TQuizQuestion, TQuizResult, etc.)
│
├── common/                       # Shared constants, enums, types
│   ├── enums/
│   │   └── quiz.ts               #   QuizStatus enum (IDLE → COMPLETED)
│   └── types/
│       └── response.ts           #   Generic API response types
│
├── libs/                         # Application-level providers & context
│   ├── auth-context.tsx          #   AuthProvider + useAuth hook
│   └── query-provider.tsx        #   TanStack QueryClientProvider wrapper
│
├── docs/
│   └── guidelines.md             # Coding & module structure guidelines
├── public/                       # Static assets (SVG icons)
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── eslint.config.mjs             # ESLint flat config
├── postcss.config.mjs            # PostCSS (Tailwind CSS plugin)
└── package.json
```

## State Management

### Authentication — React Context

`AuthProvider` (`libs/auth-context.tsx`) provides global authentication state:

| API          | Description                                      |
| ------------ | ------------------------------------------------ |
| `user`       | The currently logged-in user object, or `null`   |
| `isLoading`  | `true` during initialization from localStorage   |
| `login()`    | Log in with username + password                  |
| `register()` | Register a new user                              |
| `logout()`   | Clear session and redirect to login              |

User data is stored in `localStorage` with the following keys:
- `quiz_app_users` — list of all registered users
- `quiz_app_current_user` — currently active user (password excluded)

### Data Fetching — TanStack React Query

`QueryProvider` (`libs/query-provider.tsx`) wraps the entire app with `QueryClientProvider`.

**Default options:**
- `staleTime`: 60 seconds
- `retry`: 1
- `refetchOnWindowFocus`: false

**Query Hooks:**

| Hook                 | Type     | Description                                          |
| -------------------- | -------- | ---------------------------------------------------- |
| `useQuizQuestions()` | Query    | Fetch 5 questions from OpenTDB                       |
| `useSubmitQuiz()`    | Mutation | Submit answers to `/api/placement-test/submit`       |
| `useQuizResult()`    | Query    | Poll result with `refetchInterval: 1s`               |

## Quiz Lifecycle (State Machine)

The quiz is managed via the `QuizStatus` enum in `use-quiz.ts`:

```
┌──────┐   startQuiz()   ┌─────────┐  questions loaded  ┌─────────────┐
│ IDLE │ ───────────────▶ │ LOADING │ ──────────────────▶ │ IN_PROGRESS │
└──────┘                  └─────────┘                     └──────┬──────┘
   ▲                          │                                  │
   │ restart()                │ error                   all answered
   │                          ▼                                  │
   │                     ┌─────────┐                             ▼
   │                     │  ERROR  │◀──── submit error ──┌──────────────┐
   │                     └─────────┘                     │ PROCESSING   │
   │                                                     └──────┬───────┘
   │                                                            │
   │                                                  result.status === "completed"
   │                                                            │
   │                     ┌───────────┐                          ▼
   └─────────────────────│ COMPLETED │◀─────────────────────────┘
                         └───────────┘
```

**Timer:** Quiz has a 5-minute (300 seconds) total countdown. If time runs out, the current answer is automatically submitted as blank and the quiz advances. Progress is auto-saved to localStorage every change.

## API Routes

### `POST /api/placement-test/submit`

Accepts a quiz submission, calculates the score, stores it in an in-memory store, and returns a `taskId`.

**Request Body:**
```json
{
  "userId": "uuid",
  "answers": [
    {
      "questionId": 0,
      "selectedAnswer": "...",
      "correctAnswer": "...",
      "isCorrect": true,
      "timeSpent": 15
    }
  ],
  "totalTime": 120,
  "completedAt": "2026-04-05T00:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "taskId": "uuid",
    "status": "processing"
  }
}
```

> The status automatically changes to `"completed"` after 3 seconds (simulated async processing).

### `GET /api/placement-test/result/[taskId]`

Poll the quiz result by `taskId`.

**Response:**
```json
{
  "success": true,
  "data": {
    "taskId": "uuid",
    "userId": "uuid",
    "score": 80,
    "totalQuestions": 5,
    "correctAnswers": 4,
    "percentage": 80,
    "passed": true,
    "answers": [],
    "completedAt": "...",
    "status": "completed"
  }
}
```

> Passing threshold: **≥ 60%**

## External API

**OpenTDB** — [https://opentdb.com/api.php](https://opentdb.com/api.php)

```
GET https://opentdb.com/api.php?amount=5&category=18&type=multiple
```

- `amount=5` — 5 questions per quiz
- `category=18` — Science: Computers
- `type=multiple` — Multiple choice

Answers are decoded from HTML entities and shuffled before being displayed.

## Design System

### Color Palette

| Token              | Value     | Usage            |
| ------------------ | --------- | ---------------- |
| `--background`     | `#0a0e1a` | Base background  |
| `--foreground`     | `#e2e8f0` | Default text     |
| `--accent-cyan`    | `#06b6d4` | Primary accent   |
| `--accent-violet`  | `#8b5cf6` | Secondary accent |
| `--accent-emerald` | `#10b981` | Success / passed |
| `--accent-rose`    | `#f43f5e` | Error / failed   |

### CSS Utilities

| Class            | Description                                            |
| ---------------- | ------------------------------------------------------ |
| `.bg-mesh`       | Multi-layer radial gradient background                 |
| `.glass`         | Glassmorphism: blur, semi-transparent bg, subtle border |
| `.text-gradient`  | Gradient text (cyan → violet)                          |
| `.timer-warning`  | Pulsing glow animation for timer warning               |

### Animations

`fade-in`, `slide-up`, `slide-down`, `scale-in`, `shimmer`, `pulse-glow`, `float`, `timer-pulse`

## Shared Components

| Component        | File                                  | Props                                      |
| ---------------- | ------------------------------------- | ------------------------------------------ |
| `Button`         | `app/_components/button.tsx`          | `variant`, `size`, `isLoading`, `children` |
| `Card`           | `app/_components/card.tsx`            | `hover`, `className`, `children`, `style`  |
| `Input`          | `app/_components/input.tsx`           | `label`, `icon`, + standard input props    |
| `LoadingSpinner` | `app/_components/loading-spinner.tsx` | `message`, `size`                          |
| `ProgressBar`    | `app/_components/progress-bar.tsx`    | progress value                             |
| `ErrorDisplay`   | `app/_components/error-display.tsx`   | `message`, retry callback                  |

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm (or yarn / pnpm / bun)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd my-quiz-app

# Install dependencies
npm install

# Copy environment variables (if applicable)
cp .env.example .env
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Path Aliases

Configured in `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

**Usage examples:**
```typescript
import { useAuth } from "@/libs/auth-context";
import { Button } from "@/app/_components/button";
import type { TUser } from "@/api/auth/type";
import { QuizStatus } from "@/common/enums/quiz";
```

## Conventions

1. **Route Groups** — `(public)` for open pages, `(authenticated)` for pages requiring login
2. **Private Folders** — `_` prefix for module-scoped components/hooks/utils (`_components/`, `_hooks/`)
3. **Client-first** — Prefer full client-side rendering (`"use client"`)
4. **API Layer Separation** — Root `api/` contains client-side functions and types; `app/api/` contains Next.js Route Handlers
5. **Type Prefix** — All types use the `T` prefix (e.g., `TUser`, `TQuizResult`)

For more detailed guidelines, see [docs/guidelines.md](docs/guidelines.md).
