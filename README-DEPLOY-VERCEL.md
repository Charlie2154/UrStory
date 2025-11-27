# Deploying U (UStory) to Vercel — Step-by-step

This README covers two routes to deploy quickly to Vercel and get a free public URL:
- Quick GUI method (recommended) — connect GitHub, import repo, set env vars in Vercel dashboard
- CLI method (optional) — use `vercel` CLI

Important notes before you start
- Do NOT commit `.env.local` to GitHub. Keep it local (it's already in `.gitignore` in typical projects).
- Server-only secrets (e.g. `OPENAI_API_KEY`) should NOT be named `NEXT_PUBLIC_*`. Put them in Vercel Environment Variables and reference them from server routes only (API routes).

Checklist (high level)
1. Push code to GitHub
2. Create a Vercel account (or login) and import the repo
3. Name the project `UStory`
4. Add environment variables in Vercel (Production + Preview)
5. Deploy and verify

---

1) Push your repo to GitHub (skip if already on GitHub)

Open PowerShell in your project root (`c:\Users\Vaishnavi\u-next`) and run:

```powershell
# initialize (only if not a git repo yet)
git init
git add .
git commit -m "Initial commit"
# create repo on GitHub using the website or GitHub CLI;
# then add remote and push (replace placeholders):
git remote add origin https://github.com/YOUR_USERNAME/u-next.git
git branch -M main
git push -u origin main
```

2) GUI: Import to Vercel (recommended)

- Go to https://vercel.com and sign in with GitHub.
- Click "New Project" → "Import Project" → choose the `u-next` repository you pushed.
- Vercel will auto-detect Next.js. Click "Import".
- In the project settings step you can set the Project Name — put `UStory`.

3) Set Environment Variables in Vercel

Open the project in Vercel Dashboard → Settings → Environment Variables. Add the following variables (copy values from your local `.env.local`):

- `NEXT_PUBLIC_FIREBASE_API_KEY` = (value from `.env.local`)
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = projectu2154.firebaseapp.com
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = projectu2154
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = projectu2154.appspot.com
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = 853147986658
- `NEXT_PUBLIC_FIREBASE_APP_ID` = 1:853147986658:web:f21db5e474505bd6104cbb

- `OPENAI_API_KEY` = (your OpenAI secret) — mark this as **Environment Variable** (server use only)

Set the scope to `Production` and `Preview` (or add to both). Do NOT expose `OPENAI_API_KEY` as `NEXT_PUBLIC_...` — keep it private.

4) Deploy / Build

- After import, Vercel will start a deployment. Wait for the build to finish.
- The app will be live at `https://u-next-yourusername.vercel.app` (Vercel assigns a URL). You can change the project name to `UStory` (this affects the default subdomain) — or rename the project in Vercel UI under Settings → General → Project Name.

5) Optional: Use the `vercel` CLI

Install the Vercel CLI and deploy from terminal (alternative):

```powershell
npm i -g vercel
vercel login
# from project root
vercel --prod --name UStory
```

To add environment variables using the CLI (example):

```powershell
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
# You'll be prompted to paste the value
vercel env add OPENAI_API_KEY production
```

6) Verify

- Visit the Vercel URL once deployment finishes.
- If something fails, open the Vercel deployment logs (Dashboard → Deployments → Click the latest deployment → View Logs) to diagnose.

Troubleshooting tips
- If your Firebase auth fails (api-key-not-valid), make sure the same Firebase API key is set in Vercel and that Firebase Authentication (Email/Password) is enabled in the Firebase Console.
- If your OpenAI requests fail, ensure `OPENAI_API_KEY` is set in Vercel **and** your server route uses it (server API route reads from `process.env.OPENAI_API_KEY`).
- If CSS or Tailwind classes don't appear, try clearing the build cache by re-deploying or using the `vercel --prod` CLI deploy.

Security reminder
- Keep secrets in Vercel Environment Variables. Don't expose `OPENAI_API_KEY` to the client.

---

If you want, I can:
- Generate a `vercel.json` for specific rewrites or redirects
- Create a short `deploy.sh` or PowerShell script to automate `git push` and `vercel --prod`
- Walk you through the Vercel UI click-by-click; tell me when you're at the Vercel dashboard and I will guide you next steps interactively.

