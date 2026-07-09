## Add Optional Login + User Progress Tracking

Add an auth system so students can optionally sign in with **Email/Password**, **Google**, or **Phone (SMS OTP)**, complete a short profile, and have their learning activity saved. Learning stays fully open — sign-in only enables progress tracking.

### 1. Auth methods

- **Email + password** — built-in, no extra setup.
- **Google** — one-tap sign-in via Lovable Cloud's managed Google OAuth (no keys needed).
- **Phone + SMS OTP** — requires an SMS provider. Lovable Cloud does not ship SMS out of the box, so we'll connect **GatewayAPI** (Lovable-supported SMS connector) or a similar provider. You'll need to authorize one connection before phone login works. If you'd rather skip this to avoid SMS costs, we can ship with Email + Google only and add Phone later.

### 2. Pages & UX

- New `/auth` page with three tabs: **Email**, **Phone**, **Google button**.
  - Email tab: sign-up / sign-in toggle, name + email + password.
  - Phone tab: enter phone → receive 6-digit code → verify.
  - Google tab: single "Continue with Google" button.
- New `/onboarding` page (shown once after first sign-up): collect **Full name**, **State / LGA** (dropdown of 36 Nigerian states + FCT), **School class** (JSS3–SS3).
- New `/profile` page: view stats (subjects studied, quizzes taken, avg score, current streak, minutes learned), edit profile, sign out.
- Home page: adds a small **Sign in** button in the header (or **Profile** avatar when signed in). Everything remains usable when signed out.
- Chat & Quiz screens: if signed in, silently record activity; if not, a subtle "Sign in to save your progress" hint appears after finishing a quiz.

### 3. Data tracked (only when signed in)

- **Chat sessions** — subject, topic (first question), timestamp, message count.
- **Quiz attempts** — subject, topic, score, total questions, timestamp.
- **Daily activity** — one row per user per day with minutes spent → used for streaks.
- **Profile** — name, state, class, phone/email.

### 4. Technical details

Database (new tables in Lovable Cloud, all with RLS so each user only sees their own data):

```text
profiles          (user_id, full_name, state, school_class, phone, email)
chat_sessions     (user_id, subject_id, topic, message_count, created_at)
quiz_attempts     (user_id, subject_id, topic, score, total, created_at)
daily_activity    (user_id, activity_date, minutes_spent)  UNIQUE(user_id, activity_date)
```

Auth wiring:
- Enable email/password (no auto-confirm — students verify by email link) and Google via `configure_social_auth`.
- Enable Phone provider and connect an SMS provider (GatewayAPI connector) — needs your approval on the connection step.
- Trigger auto-creates a `profiles` row on signup; onboarding page fills in the details.
- `AuthProvider` context wraps the app, exposes `user`, `session`, `signOut`.
- Protected `/profile` and `/onboarding` routes redirect to `/auth` if signed out.

Progress tracking:
- Lightweight hooks (`useTrackChat`, `useTrackQuiz`, `useTrackActivity`) that no-op when the user is signed out — keeps the 2G-optimized experience unchanged for anonymous users.
- Streak = count of consecutive days with a `daily_activity` row.

### 5. What I need from you before building

1. **Confirm Phone/SMS**: include it now (I'll ask you to connect GatewayAPI), or ship with **Email + Google** only for now?
2. **Email confirmation**: require email verification link before login (safer), or auto-confirm for faster onboarding on slow networks?
