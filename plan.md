# Tiramisu — Make New Friends

## Approved implementation plan

Build a polished social discovery web app for a hackathon using a React + Vite + TypeScript frontend. Keep the demo emotionally warm and playful while being explicit about what is connected to Supabase and what is demo-only.

### Product behavior

- **Authentication:** Use the official Supabase JavaScript client with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Support login, signup, forgot-password, password validation, visibility toggle, session persistence, protected app routes, and logout. Missing configuration must render a clear setup state rather than a fake successful login.
- **Discover:** Provide fictional approximate profiles, map pins, search, interest filters, profile detail, conversation starters, start-conversation action, and location-sharing preference copy that avoids exact home locations.
- **Messages:** Provide conversation list, direct-message layout, demo-mode labeling, empty/loading/error states, send composer, and ElevenLabs-ready voice controls. Demo messages are never presented as persisted backend messages.
- **Joy Room:** Provide a playable randomized Would You Rather game, answer feedback, reaction/score feedback, and conversation starter cards.
- **Profile:** Provide editable local profile fields, visibility/location-sharing settings, and logout.
- **Database handoff:** Include SQL for `profiles`, `conversations`, `conversation_members`, and `messages` with RLS policies; keep data-access boundaries ready for Realtime integration.
- **Documentation:** Include `.env.example`, README, ElevenLabs secure-server guidance, route manifest, build validation, and a connected-vs-demo matrix.

## Design direction

### Style alternatives considered

- **Neon social clubhouse** (0.07): high-contrast night-club color blocking with playful signal lights and chat-room energy.
- **Soft digital campfire** (0.06): warm, tactile surfaces and friendly glow as a metaphor for meeting people.
- **Editorial city guide** (0.04): refined magazine layout with map annotations and human stories.

### Chosen movement: Soft digital campfire

#### Core principles

1. **Warmth inside the night:** A deep navy canvas makes every profile, message, and action feel like a small pool of light.
2. **Joy before optimization:** Use playful prompts, human copy, and tactile reactions instead of engagement-bait mechanics.
3. **Calm clarity:** Keep screens breathable, with a strong reading order and one obvious next action per card.
4. **Trust by default:** Label fictional/demo content, soften map precision, and explain privacy choices in plain language.

#### Color philosophy

Near-black navy is the shared room; violet is the social signal and creative spark; lime is reserved for moments that invite a person to act. Surfaces use cool blue-violet layering rather than a noisy rainbow so profiles and conversations stay legible.

#### Layout paradigm

A persistent left rail acts as the venue entrance, while the main content is a staggered “campfire table” of map, people, and prompt cards. On mobile, the rail collapses into a thumb-friendly bottom dock and the table becomes a single flowing story.

#### Signature elements

- A small lime “online pulse” dot paired with short human status copy.
- Violet pin/ring motifs that make map and profile moments feel related.
- Rounded cards with a faint top-edge glow, like light catching a tabletop.

#### Interaction philosophy

Every interaction should feel like an invitation: filters refine without resetting context, cards lift slightly on hover, actions confirm with a small spark, and privacy controls describe consequences rather than hiding them behind jargon.

#### Animation

Use quick 160–220ms ease-out transitions for hover, selection, and navigation. Let new cards enter with a subtle upward fade, use a soft pulse only for live/online indicators, and respect `prefers-reduced-motion`. Avoid constant parallax or attention-stealing movement.

#### Typography system

Use **Plus Jakarta Sans** for a friendly, contemporary interface with strong numerals and rounded terminals. Use weight 800 for page titles, 700 for card titles and CTA labels, and 500–600 for supporting copy. Keep body text between 14–16px with comfortable line height.

#### Brand essence

**Tiramisu is the low-pressure way to meet your next favorite person nearby.** Personality: curious, kind, electric.

#### Brand voice

Copy should sound like a thoughtful friend nudging you into a good conversation. Headlines are short and specific; CTAs are invitations rather than commands.

- “Find a little more your kind of people.”
- “No awkward opener required.”

#### Wordmark & logo

A compact `Tiramisu` wordmark accented by a lime four-point spark. The mark appears in the rail and auth card, with letter spacing tightened enough to feel like a distinct product signature.

#### Signature brand color

**Tiramisu Lime — `#c8ff5a`**. It is bright enough to feel optimistic against navy, but soft enough to remain friendly instead of fluorescent.

## Technical structure

```text
tiramisu/
├── public/
│   ├── manus-routes.json
│   └── favicon.svg
├── src/
│   ├── components/       # App shell, nav, cards, map, messaging UI, shared controls
│   ├── data/             # Fictional profiles, prompts, demo conversations
│   ├── lib/              # Supabase client, storage helpers, formatting utilities
│   ├── pages/             # Auth and protected feature screens
│   ├── styles/            # Global tokens, responsive layout, component styles
│   ├── App.tsx           # Route state and auth boundary
│   └── main.tsx          # Vite entry point
├── supabase/schema.sql   # Tables, indexes, RLS policies, profile trigger notes
├── .env.example
├── README.md
├── TODO.md
└── package.json
```

## Build workflow

- Pin the package manager in `package.json`, install only the required frontend dependencies, and keep secrets in env vars.
- Run host-managed diagnostics after edits; use `npm run build` as the clean production check.
- Start Vite on port 3000 bound to `0.0.0.0`, verify `/manus-routes.json`, and inspect the preview visually after meaningful UI content exists.
- Commit the implementation to the project's canonical `main` branch so the Webdev checkpoint records the delivered version.
