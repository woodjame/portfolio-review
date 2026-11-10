# BIOBUZZ Portfolio Review

A web page where FIRST Tech Challenge teams upload their engineering portfolio (PDF) and get detailed feedback before an event:

- **Rule check** against Competition Manual rule A201: page count, page size, file size, cover page, small text, links, prior-season content, personal info and leftover template text.
- **Section checklists** for 15 portfolio sections, adapted from the LOAD Robotics 25609 Starter Port.
- **Page-by-page notes**: what a judge sees in a 30-second skim, strengths, ranked fixes, readability.
- **Every award criterion scored 1–5** for the seven non-Inspire awards. Required criteria that score 1–2 make the team not eligible. Inspire contention is worked out from the Think, Machine/Creativity/Innovation and Team Attributes scores.

Built by Largo Robotics for the 2026-27 BIOBUZZ season.

> **© 2026 Largo Robotics. All rights reserved. Proprietary software.** Teams may use the hosted tool free of charge to review their own portfolios. Copying, modifying, republishing, or selling this tool or any part of it is not permitted without written permission. See [LICENSE](LICENSE).

---

## How it works

```
Team's browser ──(page images + text)──▶ Review server (Cloudflare Worker) ──▶ Claude API
     ▲                                     holds your API key, checks access codes
     └──────────────(feedback)─────────────────────────────┘
```

- The **web page** (`index.html`, `config.js`, `img/`) is a static site. You can host it on GitHub Pages or on your own website.
- The **review server** (`worker/worker.js`) is a small Cloudflare Worker. It keeps your Claude API key secret, only answers your own websites, checks team access codes and limits daily use. **Never put the API key in this repository.**
- The PDF is read in the team's browser. Only page images and text are sent to Claude for the review, and nothing is saved, apart from optional daily usage counters.

---

## Setup (about 30 minutes, one time)

### 1. Get a Claude API key
1. Sign in to the Claude Console (platform.claude.com) and set up billing. You pay per use (see **Costs** below).
2. Under **Limits**, set a **monthly spend limit** you're comfortable with.
3. Under **API keys**, create a key named `portfolio-review`. Copy it somewhere safe; you'll only see it once.

### 2. Create the review server (Cloudflare Worker, free plan works)
1. Sign up at dash.cloudflare.com.
2. Go to **Workers & Pages → Create → Create Worker**, name it `portfolio-review`, and click **Deploy**.
3. Click **Edit code**, delete the sample code, paste in everything from `worker/worker.js`, and click **Deploy**.
4. Go to **Settings → Variables and Secrets** and add:

   | Name | Type | Value |
   |---|---|---|
   | `ANTHROPIC_API_KEY` | Secret | your key from step 1 |
   | `ACCESS_CODES` | Secret | codes you give teams, comma-separated, e.g. `LARGO-A7K2,TEAM12345-Q9` |
   | `ALLOWED_ORIGINS` | Text | `https://woodjame.github.io,https://enbytenprodigeez.org` (no slashes at the end) |

5. Optional: turn on the **daily limit per team**.
   - Go to **Storage & Databases → KV → Create** and name it `portfolio-review-usage`.
   - On the worker, open **Settings → Bindings → Add → KV namespace**. Use the variable name `USAGE` and choose that namespace.
   - The default is 80 review steps per code per day (one review is about 8 steps, so about 10 reviews). To change it, add `DAILY_CALL_LIMIT`.
6. Copy the worker's address, e.g. `https://portfolio-review.yourname.workers.dev`. Opening it in a browser should show `{"ok":true,...}`.

Optional settings: `MODEL_DEFAULT` and `MODEL_COMPLEX` choose the Claude model (both default to `claude-sonnet-5-5`). `MAX_TOKENS` sets the longest answer per step (default 16000).

### 3. Put the page on GitHub Pages
1. On GitHub, create a new **public** repository, e.g. `biobuzz-portfolio-review`.
2. Click **uploading an existing file** and drag in everything from this folder (`index.html`, `config.js`, `LICENSE`, `README.md`, `img/`, `worker/`). Then **Commit**.
3. Open `config.js` on GitHub, click the pencil, and set your worker address:
   ```js
   apiUrl: "https://portfolio-review.yourname.workers.dev",
   ```
   Commit.
4. Go to **Settings → Pages → Build and deployment**. Choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
5. After a minute the page is live at `https://woodjame.github.io/biobuzz-portfolio-review/`.

### 4. Hand out access codes
- Give each team (or each group of teams) its own code from `ACCESS_CODES`. The page remembers the code in that browser.
- To shut off a code, remove it from `ACCESS_CODES` and save.
- Separate codes let the daily limit apply per team, and let you see who is using it.

### 5. Add it to the club website (enbytenprodigeez.org)
Pick one:
- **Link** (simplest): add a "Portfolio Review" button that links to the GitHub Pages address.
- **Host it on the site:** upload `index.html`, `config.js` and the `img/` folder into a folder such as `/portfolio-review/` on your web host. It works because `https://enbytenprodigeez.org` is already in `ALLOWED_ORIGINS`.
- **Subdomain:** point `review.enbytenprodigeez.org` at GitHub Pages (GitHub **Settings → Pages → Custom domain**, plus a CNAME record at your domain host). Then add `https://review.enbytenprodigeez.org` to `ALLOWED_ORIGINS`.

---

## Costs
Each review makes about 8 Claude calls: 6 page batches with page images, plus 2 scoring passes. For a 16-page portfolio that's roughly 110k input tokens and 40k output tokens.

At Claude Sonnet 5.5 rates ($2 per million input tokens, $10 per million output, October 2026) that's **about $0.60 per review**. Switching `MODEL_COMPLEX` to Opus roughly doubles the cost of those steps.

Check current prices on the Claude pricing page, and keep a spend limit set in the Console.

## Privacy
- The PDF is opened in the team's own browser. The rule check runs there, and the file is never uploaded or stored.
- Page images and text go through the review server to Claude (Anthropic) for that team's review only, then straight back. The worker has no database and doesn't log content.
- No team can see another team's portfolio or feedback. There is no shared storage of any kind.
- Saving the last review on a computer is **off by default** (for shared and school computers). Teams can opt in, and **Clear my review** removes everything.
- Under Anthropic's commercial API terms, inputs and outputs aren't used for training and are deleted after a short retention period.
- Students should appear by first name and last initial only. The rule check flags emails and phone numbers.

## Updating
- Edit `index.html` and commit. GitHub Pages updates within a minute or two.
- Edit the worker in the Cloudflare dashboard and click **Deploy**.

## Troubleshooting
| Message on the page | Fix |
|---|---|
| "Written feedback isn't set up on this copy" | `apiUrl` in `config.js` is empty or wrong. |
| "That access code wasn't accepted" | The code isn't in `ACCESS_CODES` (check for spaces). |
| "This website isn't allowed to use the review server" | Add the page's address (e.g. `https://woodjame.github.io`) to `ALLOWED_ORIGINS`. |
| "Your team has used today's review limit" | Raise `DAILY_CALL_LIMIT` or wait until tomorrow. |
| "Claude API error" | Check the API key and that the Console account has credit. |

The page also works inside claude.ai as a Claude artifact. There it uses Claude directly and `config.js` isn't needed.

---
Section checklist adapted from the LOAD Robotics (25609) STARTER PORT template. Award criteria from the FIRST Tech Challenge Competition Manual (TU06), Section 6. Judges make all award decisions. This tool is a second reader, not a judge.
