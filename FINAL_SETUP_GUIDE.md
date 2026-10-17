# Tiramisu — Complete Final Setup Guide

This guide takes Tiramisu from the delivered source code to a working local or deployed application with real Supabase authentication and database-backed social features.

## 1. What is included

Tiramisu currently contains:

- Supabase email/password authentication wiring.
- Login, signup, forgot-password, password visibility, validation, session persistence, logout, and protected routes.
- A responsive Discover experience with Leaflet and OpenStreetMap.
- Clearly labelled fictional demo profiles with approximate locations.
- Search and interest filters.
- A demo messaging interface with a local composer and future Supabase Realtime structure.
- A playable Would You Rather game in Joy Room.
- A local profile editor and privacy controls.
- Supabase SQL schema and Row Level Security policies.
- ElevenLabs-ready voice-message placeholders.
- A read-only demo mode that does not pretend to authenticate a user.

The application distinguishes between connected functionality and demo-only functionality. Do not treat sample profiles or sample messages as real persisted user data.

## 2. Requirements

Install the following before starting:

- Node.js 18 or newer; Node.js 20 or 22 is recommended.
- npm 10 or newer.
- A Supabase project.
- Git, if you are cloning or committing the project.

Check your versions:

```bash
node --version
npm --version
git --version
```

## 3. Install the project

From the project directory:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The application is configured to listen on `0.0.0.0:3000`, which also makes it suitable for managed preview environments.

## 4. Configure Supabase

### 4.1 Create or select a project

1. Open the Supabase dashboard.
2. Create a new project or select an existing project.
3. Wait until the project is fully provisioned.

### 4.2 Copy the browser-safe credentials

Open **Project Settings → API** and copy:

- Project URL.
- Publishable key or anon key.

Never use any of the following in frontend code:

- Service-role key.
- Database password.
- Secret API key.
- ElevenLabs API key.

### 4.3 Create the local environment file

Copy the example file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_BROWSER_SAFE_PUBLISHABLE_OR_ANON_KEY
```

Replace the placeholder values with the values from your Supabase project.

Restart the development server after changing environment variables:

```bash
npm run dev
```

Vite exposes variables prefixed with `VITE_` to browser code. Only browser-safe Supabase credentials belong in this file.

### 4.4 Enable email/password authentication

In Supabase:

1. Open **Authentication → Providers**.
2. Enable **Email**.
3. Decide whether email confirmation is required.
4. Save the provider settings.

If email confirmation is enabled, signup returns a message asking the user to check their inbox. This is expected behavior.

### 4.5 Configure redirect URLs

Open **Authentication → URL Configuration**.

For local development, add:

```text
http://localhost:3000
```

If you deploy the app, also add the deployed origin, for example:

```text
https://your-domain.example
```

The forgot-password flow redirects back to the current application origin at `/login`.

## 5. Create the database and security policies

The SQL file is located at:

```text
supabase/schema.sql
```

Run it as follows:

1. Open the Supabase dashboard.
2. Open **SQL Editor**.
3. Create a new query.
4. Paste the complete contents of `supabase/schema.sql`.
5. Run the query.
6. Confirm there are no errors.

The SQL creates:

- `profiles` linked to `auth.users.id`.
- `conversations`.
- `conversation_members`.
- `messages`.
- Indexes for membership and message ordering.
- A trigger that creates a profile row after signup.
- Profile `updated_at` handling.
- Row Level Security policies.

### Security behavior

The policies enforce the following:

- A user can create and update only their own profile.
- Community-visible profiles can be discovered by authenticated users.
- Private profiles are not broadly exposed.
- Conversations are visible only to members.
- Conversation membership is restricted.
- Messages are not public.
- Only conversation members can read messages.
- Only authenticated members can send messages.
- Users can delete only their own messages.

After running the SQL, inspect **Database → Tables** and confirm the tables exist.

## 6. Start using real authentication

With `.env.local` configured:

1. Open `/signup`.
2. Create an account with a valid email and a password of at least six characters.
3. Confirm the email if Supabase requires confirmation.
4. Log in at `/login`.
5. Confirm the app redirects to `/discover`.
6. Refresh the page and confirm the session remains active.
7. Open `/profile` and confirm the account email is visible.
8. Log out.
9. Try opening `/discover` directly while logged out and confirm you return to `/login`.

The app does not provide fake login success when Supabase is not configured. Instead, it shows a configuration message.

## 7. Demo mode

If you want to show the frontend before connecting Supabase, open:

```text
/discover?demo=1
```

For example:

```text
http://localhost:3000/discover?demo=1
```

Demo mode is intentionally labelled **Read-only demo mode**. It does not create an account, bypass Supabase authentication, or claim that demo messages are saved to a backend.

Demo mode supports:

- Discover profile browsing.
- Map interaction.
- Search and interest filtering.
- Local message composition.
- Joy Room gameplay.
- Local profile editing.

Demo mode does not persist real profiles, conversations, or messages to Supabase.

## 8. Understand the current feature status

| Feature | Current state | Next setup step |
| --- | --- | --- |
| Signup and login | Real Supabase Auth wiring | Add `.env.local` values |
| Forgot password | Real Supabase reset email call | Configure Supabase redirect URLs |
| Session persistence | Real Supabase session listener | No additional code required |
| Logout | Real Supabase logout when authenticated | No additional code required |
| Discover profiles | Fictional demo data | Replace with a Supabase profile query when ready |
| Map | Leaflet + OpenStreetMap | Replace fictional coordinates with privacy-safe user areas |
| Messages | Demo threads and local composer | Add Supabase conversation/message queries |
| Supabase Realtime | Not enabled by default | Subscribe to `messages` after testing RLS |
| Profile editor | Local UI | Add profile update query using authenticated user ID |
| Would You Rather | Fully playable locally | Optional: persist scores later |
| Voice messages | Placeholder controls | Add a secure server-side or Edge Function endpoint |

## 9. Connect real profiles

When you are ready to replace the demo profile list:

1. Query `public.profiles` with the Supabase client.
2. Request only fields needed by the Discover screen.
3. Filter by `visibility` and privacy rules on the server/database side.
4. Store broad areas or geohashes rather than exact home coordinates.
5. Never automatically publish the current user’s exact location.
6. Keep a clear fallback state while profile data loads.
7. Keep the current fictional data as a deliberate fallback only if you label it as demo data.

A profile should be created automatically by the SQL trigger after signup. The authenticated user ID is available as:

```ts
const { data: { user } } = await supabase.auth.getUser()
```

Use `user.id` as the profile ID. Do not accept an arbitrary profile ID from the browser for ownership checks.

## 10. Connect real messaging

A production messaging flow should follow this order:

1. Create a row in `conversations` with `created_by = auth.uid()`.
2. Insert the creator into `conversation_members`.
3. Insert the second participant into `conversation_members` only through an authorized flow.
4. Query conversations through membership.
5. Query messages ordered by `created_at`.
6. Insert messages with `sender_id = auth.uid()`.
7. Test all reads and writes while authenticated as different users.
8. Confirm one user cannot read another user’s conversation by changing an ID in the browser.

Only after RLS is verified should you enable Realtime for the `messages` table. The SQL file includes the optional publication statement:

```sql
alter publication supabase_realtime add table public.messages;
```

Run it only after confirming your desired Realtime exposure and policies.

## 11. Add secure ElevenLabs voice features

Do not call ElevenLabs directly from the browser with a secret key.

Use a Supabase Edge Function or another server-side endpoint that:

1. Requires a valid authenticated Supabase user.
2. Accepts a short audio recording or text-to-speech request.
3. Reads the ElevenLabs secret from server-side environment variables.
4. Calls ElevenLabs from the server.
5. Returns a transcript or generated audio result.
6. Lets the user review a transcript before sending.
7. Stores only the approved transcript in `messages.voice_transcript`.
8. Applies an explicit retention policy to raw audio.

Suggested endpoints:

```text
POST /functions/v1/transcribe-voice
POST /functions/v1/speak-message
```

Recommended browser flow:

```text
Record → upload securely → transcribe → review transcript → send message
```

Never ship the ElevenLabs key in:

- React components.
- `.env.example` with a real value.
- Vite client variables.
- Browser network requests.
- Git history.

## 12. Test checklist before submission

### Authentication

- [ ] Signup with a valid email works.
- [ ] Signup with an invalid email shows a readable error.
- [ ] Signup with a short password is rejected.
- [ ] Login with incorrect credentials shows a readable error.
- [ ] Login with correct credentials redirects to Discover.
- [ ] Refresh preserves the session.
- [ ] Forgot-password displays the reset confirmation message.
- [ ] Logout returns to Login.
- [ ] Direct access to `/discover`, `/messages`, `/joy`, and `/profile` while logged out returns to Login.

### Database security

- [ ] A profile row is created after signup.
- [ ] A user can update only their own profile.
- [ ] A conversation is visible only to members.
- [ ] A message is visible only to conversation members.
- [ ] A user cannot insert a message as another sender.
- [ ] A user cannot read messages by changing a conversation ID.
- [ ] No service-role key is present in browser source or Git.

### Product behavior

- [ ] Discover map loads without tile errors.
- [ ] Profile cards open and show privacy-safe approximate location copy.
- [ ] Search and interest filters work.
- [ ] Message composer adds a clearly demo/local message in demo mode.
- [ ] Joy Room answer selection updates feedback and score.
- [ ] Joy Room “Another one” changes the prompt.
- [ ] Profile editing shows the local save confirmation.
- [ ] Mobile navigation works at a narrow viewport.
- [ ] Voice controls remain labelled as placeholders.

### Build and routes

Run:

```bash
npm run build
```

The build should complete successfully. A bundle-size warning from Leaflet is acceptable if the build exits successfully.

Verify:

```text
/manus-routes.json
/login
/signup
/forgot-password
/discover
/messages
/joy
/profile
```

## 13. Deployment

### Static deployment

Build the application:

```bash
npm run build
```

Deploy the generated `dist/` directory to Vercel, Netlify, Cloudflare Pages, or another static host.

Set these environment variables in the deployment provider:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Then add the deployed URL to Supabase **Authentication → URL Configuration**.

### SPA fallback

Configure the hosting provider to serve `index.html` for application routes such as:

```text
/login
/signup
/forgot-password
/discover
/messages
/joy
/profile
```

Without an SPA fallback, refreshing a nested route may return a host-level 404.

### Managed Tiramisu preview

The delivered managed preview runs on port 3000 and already includes Vite host handling for the browser-facing preview domain. The code is checkpointed on the project’s canonical `main` branch.

## 14. Common issues

### “Supabase is not connected yet”

Check that:

- `.env.local` exists in the project root.
- Variable names start with `VITE_`.
- The values contain no surrounding quotes or accidental spaces.
- The dev server was restarted after editing `.env.local`.
- The Supabase URL begins with `https://`.

### Signup succeeds but the app does not enter immediately

Email confirmation is probably enabled. Check the inbox, confirm the email, then log in.

### Forgot-password link does not return to the app

Add the correct local and deployed URLs under Supabase **Authentication → URL Configuration**.

### Nested route returns 404 after deployment

Enable SPA fallback to `index.html` for application routes.

### Map is blank

Confirm the browser can reach the OpenStreetMap tile endpoint. Check browser console network errors and confirm the map container has a non-zero height.

### Messages appear but are not in Supabase

This is expected for the current demo UI. Run the SQL schema and add the real conversation/message data-access layer before presenting messages as persisted.

### Realtime does not update

Confirm:

- The `messages` table is in the `supabase_realtime` publication.
- The authenticated user is a conversation member.
- RLS allows the intended read.
- The client subscribes only after the user session is available.

## 15. Final handoff commands

Before handing the project to another developer:

```bash
npm install
npm run build
git status
```

Confirm that:

- `npm run build` succeeds.
- `.env.local` is not committed.
- `.env.example` contains placeholders only.
- `README.md` and this guide are present.
- `supabase/schema.sql` is present.
- The current feature-status table is accurate.
- No private key appears in source or Git history.
