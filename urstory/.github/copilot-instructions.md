# UrStory - AI-Powered Storytelling Platform

## Architecture Overview

**UrStory** is a Next.js 14 app using the App Router, Firebase (Auth + Firestore), and Google Gemini AI for collaborative story generation. The app enables users to write personal stories through conversational AI guidance, creating a safe, empathetic space for emotional expression.

### Core User Flows
1. **Portal Entrance** (`/`) → Emotional landing page with story discovery
2. **Write Flow** (`/write`) → Multi-step story creation with AI assistance
3. **Reader Flow** (`/reader`) → Browse categorized stories (pen-friend concept)
4. **Story View** (`/story/[id]`) → Individual story reading experience

## Tech Stack

- **Framework**: Next.js 14.0.4 (App Router, React 18.2)
- **Styling**: Tailwind CSS 3.3.5 with custom gradient backgrounds
- **Database**: Firebase Firestore (stories collection)
- **Auth**: Firebase Authentication (Google, email/password)
- **AI**: Google Gemini API (2.5-pro, flash-latest, 2.0-flash fallbacks)
- **State**: React hooks + localStorage for draft persistence
- **Real-time**: Socket.io-client 4.8.1 (market-bot integration)

## Project Structure

```
app/
├── layout.jsx                  # Root layout with gradient backgrounds
├── page.jsx                    # Homepage (portal entrance)
├── write/                      # Story creation flow
│   ├── page.jsx               # Choose writing mode (new chapter/continue)
│   ├── select-type/page.jsx   # Story type selection (coming soon)
│   └── editor/page.jsx        # AI-assisted editor (coming soon)
├── reader/page.jsx            # Story browsing with categories
├── story/[id]/page.jsx        # Individual story view
├── login/page.jsx             # Authentication page
├── market/page.jsx            # Market feature (experimental)
└── api/
    └── generateStory/route.js  # Gemini AI story generation endpoint

components/
├── AuthHeader.jsx             # Navigation with auth state
└── ChatStoryEditor.jsx        # Conversational story editor with AI

lib/
└── firebaseClient.js          # Firebase initialization (client-side)

styles/
└── globals.css                # Tailwind imports + custom CSS
```

## Key Patterns & Conventions

### 1. Client Components Everywhere
All interactive pages use `"use client"` directive. This is an emotional, reactive app—prioritize client-side interactivity over SSR.

**Example**: Every page in `/app` starts with `"use client"`.

### 2. Firebase Lazy Loading
Firebase is dynamically imported to avoid SSR issues:
```javascript
const loadFirebase = (await import("../../lib/firebaseClient")).default;
const { db } = await loadFirebase();
```
Never import Firebase modules at the top level of client components.

### 3. Gradient-First Design Language
All pages use Tailwind's gradient backgrounds for emotional resonance:
- `from-blue-50 via-slate-50 to-emerald-50` (homepage)
- `from-sky-50 to-emerald-50` (root layout)
- Rounded corners (`rounded-xl`, `rounded-2xl`) everywhere
- Shadow hierarchy: `shadow-sm → shadow-md → shadow-lg → shadow-xl`

### 4. AI Story Generation (Route: `/api/generateStory`)
**Critical workflow**:
- Accepts `{ conversation, currentStory }` POST payload
- Tries 4 Gemini models in sequence until success:
  1. `gemini-2.5-pro` (preferred)
  2. `gemini-flash-latest`
  3. `gemini-pro-latest`
  4. `gemini-2.0-flash` (fallback)
- Returns structured JSON: `{ storyText, followUp }`
- **Grounding rule**: AI only uses details from context/conversation (no invention unless asked)
- Prefers Indian cultural context when names/settings imply it

**Environment variable**: `GEMINI_API_KEY` (server-side only)

### 5. ChatStoryEditor Component
The core writing experience lives in `components/ChatStoryEditor.jsx`:
- Conversational UI: alternating user/AI messages
- Real-time story preview pane
- Draft persistence via `localStorage` keys: `cse_messages_v1`, `cse_story_v1`
- First-time user detection: compares `creationTime === lastSignInTime`
- Save to Firestore: stories/{id} with fields `{ title, content, author, timestamp }`

### 6. Firebase Schema
**Collection: `stories`**
```javascript
{
  title: string,
  content: string,          // Final story text
  author: {
    uid: string,
    displayName: string,
    email: string
  },
  timestamp: serverTimestamp(),
  storyType: string         // e.g., "freeform", "guided"
}
```

**Environment Variables** (`.env.local`):
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=projectu2154
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
GEMINI_API_KEY=...                      # Server-side only
```

## Developer Workflows

### Run Development Server
```bash
npm run dev
# Runs on http://localhost:3000
```

### Build for Production
```bash
npm run build
npm start
```

### Firebase Deployment (if configured)
```bash
firebase deploy
```
See `.firebaserc` and `firebase.json` for hosting/functions config.

### Debugging AI Generation
- Check server logs for `[generateStory]` prefix
- API key presence logged: `GEMINI_API_KEY present: true/false`
- Model responses logged as JSON (verbose mode)
- If all models fail, check quota limits on Google AI Studio

## Emotional Design Principles

1. **Safety First**: Copy emphasizes anonymity, no judgment, emotional safety
2. **Empathy Language**: "Find Your New Pen Friend" (not "users"), "unspoken truth", "voices that needed to be heard"
3. **Progressive Disclosure**: Features unlock gradually (see `/write/page.jsx` "Coming Soon" cards)
4. **Micro-Interactions**: Hover states, gentle shadows, pulsing animations (`animate-pulse` on CTAs)

## Future Vision (From Roadmap)

The existing instructions mentioned:
- 🌌 **Portal Entrance**: Two-door choice mechanic
- 🔥 **Digital Campfire**: Immersive writing UI with ripples/particles
- 🎨 **Transformation Chamber**: Visual AI process animation
- 🌱 **Growth Garden**: Gamified story tracking (seeds → plants)
- ✨ **Constellation View**: Galaxy of shared stories

**Status**: Foundation is built (Next.js + Tailwind + AI). Implement these via:
- Framer Motion for animations
- Three.js + @react-three/fiber for 3D effects
- Howler.js for ambient audio
- Custom React hooks for particle systems

## Common Pitfalls

1. **Firebase SSR Errors**: Always lazy-load Firebase in client components
2. **AI Hallucination**: Remind users AI is grounded in their input (see prompt in `generateStory`)
3. **Tailwind Purging**: If styles disappear, check `content` paths in `tailwind.config.js`
4. **LocalStorage Hydration**: Use `isHydrated` state before reading localStorage (see ChatStoryEditor)
5. **Gemini Rate Limits**: Implement exponential backoff if hitting 429 errors

## Integration Points

- **Market-bot** (`/market-bot`): Socket.io server for real-time features (separate Node.js app)
- **Firebase Hosting**: Configured via `.firebase/` and `firebase.json`
- **Vercel**: Deployment metadata in `.vercel/`

## Testing Strategy

Currently manual testing. For magical UX features:
1. Test first-time user flow (clear cookies, sign up)
2. Verify AI responses feel conversational (not robotic)
3. Check mobile responsiveness (all pages use `max-w-*` containers)
4. Validate localStorage persistence across page reloads

---

**When implementing new features**: Prioritize emotional impact over technical complexity. Every interaction should feel like "magic the user has never experienced before." Reference the homepage's "unspoken truth" framing as the north star for voice and tone.
