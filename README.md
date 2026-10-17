# Tiramisu — Make New Friends

Tiramisu is a playful social discovery demo for a hackathon theme of **Using Technology for Joy**. It helps people discover nearby interests, break the ice with small games, and start low-pressure conversations.

The visual direction is a **soft digital campfire**: deep navy surfaces, violet social signals, and Tiramisu Lime actions that feel like small pools of light in a night-time room.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

The dev server runs at `http://localhost:3000`.

## Connect Supabase Auth

1. Create or open a Supabase project.
2. In **Project Settings → API**, copy the project URL and the browser-safe publishable/anon key into `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

3. In **Authentication → URL Configuration**, add the local site URL (`http://localhost:3000`) and your deployed site URL.
4. Keep email/password auth enabled. The frontend uses `signInWithPassword`, `signUp`, `resetPasswordForEmail`, `getSession`, and `onAuthStateChange` from the official `@supabase/supabase-js` client.
5. Restart `npm run dev` after changing `.env.local`.

If the two variables are missing, Tiramisu intentionally shows a configuration state and does **not** pretend that a login succeeded.

## Connect the database

Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor. It creates:

- `profiles`, linked to `auth.users.id`, with visibility and approximate-location settings.
- `conversations`, `conversation_members`, and `messages`.
- A new-user trigger that creates a profile row from signup metadata.
- Updated-at handling for profiles.
- Row Level Security policies that keep conversations, membership, and messages private to authenticated members.

The current UI keeps Discover profiles and Message threads clearly labelled as demo-only until a database query layer is wired to your chosen product flow. No sample message is presented as successfully persisted.

## Voice / ElevenLabs readiness

Voice controls are intentionally shown as placeholders. Do not put an ElevenLabs API key in browser code. A production implementation should call a secure server-side endpoint or Supabase Edge Function that:

1. Receives an authenticated audio upload or text-to-speech request.
2. Reads the ElevenLabs secret from server-side environment variables.
3. Returns a transcript/audio URL to the browser.
4. Lets the user review a transcript before inserting a message row.

The `voice_transcript` field in the SQL schema is reserved for the reviewed transcript. Retention and storage policy should be decided before saving raw audio.

## Feature status

| Feature | Status | Notes |
| --- | --- | --- |
| Login, signup, forgot password | Connected when Supabase env vars are present | Real Supabase Auth; no fake success state |
| Session persistence and logout | Connected when Supabase env vars are present | Uses Supabase session listener |
| Protected app routes | Connected | Unauthenticated users return to login |
| Discover map | Demo UI | Leaflet + OpenStreetMap with fictional approximate pins |
| Search and interest filters | Working locally | Filters demo profiles in the browser |
| Messages | Demo UI | Clearly labelled local sample threads; composer works in-browser |
| Database schema / RLS | Ready to run | See `supabase/schema.sql` |
| Supabase Realtime | Not enabled by default | SQL includes the optional publication note |
| Joy Room | Fully playable locally | Would You Rather prompts, feedback, score, starters |
| Profile editor | Local UI | Logout is real when Auth is connected; profile persistence can use the schema |
| ElevenLabs voice | Placeholder | Requires secure endpoint or Edge Function |

## Deployment

For a static deployment, build with:

```bash
npm run build
```

Publish the generated `dist/` directory through Vercel, Netlify, Cloudflare Pages, or another static host. Set the two `VITE_` variables in that host’s environment settings and add its URL to Supabase Authentication URL Configuration. Never deploy a service-role key, database password, or ElevenLabs secret to the frontend.

## Project structure

- `src/components/` — app shell, navigation, map, cards, and shared controls.
- `src/pages/` — auth, Discover, Messages, Joy Room, and Profile screens.
- `src/data/demo.ts` — fictional people, prompts, and demo threads.
- `src/lib/` — Supabase client, auth context, and navigation helpers.
- `src/styles/global.css` — responsive design system and screen styling.
- `supabase/schema.sql` — tables, trigger, and RLS policies.
- `public/manus-routes.json` — complete preview route manifest.
