# BIOBUZZ Portfolio Review

A web page where FIRST Tech Challenge teams upload their engineering portfolio (PDF) and get detailed feedback before an event:

- **Rule check** against Competition Manual rule A201: page count, page size, file size, cover page, small text, links, prior-season content, personal info and leftover template text.
- **Section checklists** for 15 portfolio sections, adapted from the LOAD Robotics 25609 Starter Port.
- **Page-by-page notes**: what a judge sees in a 30-second skim, strengths, ranked fixes, readability.
- **Every award criterion scored 1–5** for the seven non-Inspire awards. Required criteria that score 1–2 make the team not eligible. Inspire contention is worked out from the Think, Machine/Creativity/Innovation and Team Attributes scores.

Built by Largo Robotics for the 2026-27 BIOBUZZ season.

> **© 2026 Largo Robotics. All rights reserved. Proprietary software.** Teams may use the hosted tool free of charge to review their own portfolios. Copying, modifying, republishing, or selling this tool or any part of it is not permitted without written permission. See [LICENSE](LICENSE).

---

## How it works (no server needed)

```
Team's browser ──(page images + text, using the team's own Claude API key)──▶ Claude API
     ▲                                                                            │
     └────────────────────────────── feedback ────────────────────────────────────┘
```

- The whole tool is a static page (`index.html`, `config.js`, `img/`) hosted on **GitHub Pages**. There's no server and no database.
- Each team pastes **its own Claude API key** on the page. The PDF is read in the team's browser, and the review goes straight from that browser to Claude. Largo Robotics never sees the portfolio or the key, and pays nothing.
- **Never put an API key in this repository.** Anyone can read a public repo.

## Setup on GitHub
1. Upload `index.html`, `config.js`, `LICENSE`, `README.md` and the `img/` folder to the repository. (`worker/` is optional; see below.)
2. In `config.js`, leave `apiUrl: ""`. That turns on "use your own key" mode.
3. Go to **Settings → Pages**. Choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. Share the link GitHub shows, e.g. `https://woodjame.github.io/portfolio-review/`.

## What teams need to do
1. Go to **platform.claude.com** and create an account.
2. Add a little credit under **Billing**. $5 covers many reviews. Set a spend limit under **Limits**.
3. Open **API keys → Create key**, copy it, and paste it into the page.
4. Upload the portfolio PDF and click **Review portfolio**.

The page explains these steps under "How do I get a key?". The key is saved in the browser only if the team ticks "Save my last review on this computer", and **Clear my review** removes it.

## Models
`config.js` sets which Claude models are used:
- `modelDefault: "claude-haiku-5-5"` reads the pages (6 steps per review).
- `modelComplex: "claude-sonnet-5-5"` does the section and award scoring (2 steps).

Set both to `claude-haiku-5-5` for the lowest cost, or both to `claude-sonnet-5-5` for the most thorough reading.

## Costs (paid by each team on its own key)
Each review makes about 8 Claude calls: 6 page batches with page images, plus 2 scoring passes. Rough estimates at October 2026 prices:
- **Haiku + Sonnet (the default): about $0.30 per review**
- Haiku only: about $0.03
- Sonnet only: about $0.60

Check current prices on the Claude pricing page.

## Privacy
- The PDF is opened in the team's own browser. The rule check runs there, and the file is never uploaded or stored.
- Page images and text go straight from the team's browser to Claude (Anthropic), only for that team's review. No Largo Robotics server is involved.
- No team can see another team's portfolio or feedback. There is no shared storage of any kind.
- Saving the last review and key on a computer is **off by default**. **Clear my review** removes everything.
- Under Anthropic's commercial API terms, inputs and outputs aren't used for training and are deleted after a short retention period.
- Students should appear by first name and last initial only. The rule check flags emails and phone numbers.

## Updating
Edit `index.html` or `config.js` on GitHub and commit. GitHub Pages updates within a minute or two.

## Troubleshooting
| Message on the page | Fix |
|---|---|
| "Paste your team's Claude API key first" | The key box is empty or the text isn't a key (keys start with `sk-ant-`). |
| "Claude didn't accept that API key" | Copy the whole key again from the Claude Console. |
| "Your Claude account is out of credit" | Add credit under Billing in the Claude Console. |
| "Claude is busy or your key hit its rate limit" | Wait a minute and try again. |

## Optional later: a shared review server
If Largo Robotics later wants to pay for reviews so teams don't need their own key, `worker/worker.js` is a ready-made Cloudflare Worker. It keeps one API key secret, checks team access codes and sets daily limits. Put its address in `apiUrl` in `config.js` and the page switches to access codes automatically. Not needed for GitHub-only use.

The page also works inside claude.ai as a Claude artifact. There it uses Claude directly and needs no key.

---
Section checklist adapted from the LOAD Robotics (25609) STARTER PORT template. Award criteria from the FIRST Tech Challenge Competition Manual (TU06), Section 6. Judges make all award decisions. This tool is a second reader, not a judge.
