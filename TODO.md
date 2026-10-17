# Tiramisu delivery outcomes

## Authentication is real and protected

- [ ] Login and signup pages use the official Supabase JavaScript client and read `VITE_SUPABASE_URL` plus `VITE_SUPABASE_ANON_KEY`.
- [ ] Email and password validation, password visibility toggle, forgot-password flow, loading indicators, and readable error messages are present.
- [ ] Session persistence, logout, redirect after authentication, and protected application routes are implemented.
- [ ] When credentials are missing, the app shows a clear configuration message and does not simulate successful authentication.

## Discover helps people find one another safely

- [ ] Discover includes an interactive map with clearly identified demo profiles at approximate fictional locations.
- [ ] Search and interest filters, clickable profile cards, interests, short bios, conversation starters, a start-conversation action, and a location-sharing preference are present.
- [ ] Exact home locations are not exposed and the user's location is not automatically published.

## Messaging is honest and ready for the backend

- [ ] Messages includes a conversation list, direct-message screen, message bubbles, timestamps, composer, send action, and empty/loading/error states.
- [ ] Voice-message controls are clearly marked as placeholders until a secure ElevenLabs backend is connected.
- [ ] Demo messages are not presented as successfully persisted messages and the structure is ready for Supabase Realtime.

## Joy Room is playable

- [ ] Would You Rather supports random question selection, two selectable answers, feedback, scoring/reactions, and conversation starter cards.

## Profile and navigation are complete

- [ ] Profile includes avatar, username, bio, interests, edit profile interface, visibility and location-sharing settings, and logout.
- [ ] Every visible navigation item works and the layout is responsive with desktop sidebar plus mobile bottom navigation.

## Supabase and secure voice handoff are documented

- [ ] Reusable Supabase client, profile creation linked to `auth.users.id`, SQL schema for `profiles`, `conversations`, `conversation_members`, and `messages`, and appropriate RLS policies are provided.
- [ ] Private conversations and messages have no public access policies.
- [ ] ElevenLabs guidance documents secure server-side or Supabase Edge Function handling; no ElevenLabs secret is shipped to the browser.

## Project quality and delivery

- [ ] Reusable components, visual polish, micro-interactions, and responsive states are implemented.
- [ ] `.env.example`, README installation/Supabase/deployment instructions, and a connected-vs-demo feature matrix are included.
- [ ] `npm install` and `npm run dev` are supported, the build runs, and `/manus-routes.json` matches the app routes.
- [ ] The implementation is committed to the canonical `main` branch and the preview is verified.
