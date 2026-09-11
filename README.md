# SKILLBRIDGE
# 🌊 SkillBridge — Verified Skill-to-Opportunity Ecosystem

> A clickable, high-fidelity product PROTOTYPE connecting **Students, Industries, Academicians, and Institutions** — skill assessment → verified learning → internship matching → placements → analytics.

Zero dependencies. Zero build step. **Open `index.html` and present.**

![Prototype](https://img.shields.io/badge/prototype-clickable-0369A1)
![Routes](https://img.shields.io/badge/screens-25%20routes%20%C2%B7%204%20roles-0EA5E9)
![Deps](https://img.shields.io/badge/dependencies-none-2DD4BF)
![Theme](https://img.shields.io/badge/theme-Ocean%20Blue-0EA5E9)

---

## ✨ Quick Start

```bash
# Option 1 — just open it
open index.html            # macOS
start index.html           # Windows
xdg-open index.html        # Linux

```

> 🎯 **Demo moment:** Sign in as **Industry**, open **Applicants** and move a candidate's status — then sign in as **Student** and open **Applications**: the tracker card has moved in real time. The prototype runs on one shared cross-role state.



🧭 Four Roles, One Shared State
##THESE ARE ONLY MOCK ROLES NOT ACTUAL ONES

| Role | Persona | Home | What they do |
| --- | --- | --- | --- |
| 🎓 Student | Priya Sharma | Dashboard + readiness ring | Learn via modules & challenges, verify skills, match to opportunities, track applications, grow through mentorship |
| 🏭 Industry | TCS Talent Team | Dashboard | Post opportunities with skill benchmarks, rank applicants by match %, run the pipeline, publish programs, engage talent |
| 📚 Academician | Dr. Lakshmi Iyer | Portal Home | Browse FDPs, consultancy & research collaborations, faculty opportunities |
| 🏛️ Institution | ABC University | Overview + Skill Health | Skill-gap heatmaps, intervention launches, placements, industry partnerships |

Role is chosen at login; the sidebar, navigation, and home screen all adapt instantly.



🎮 Working Interactions

| Flow | Behavior |
| -----| -------- |
| 🔐 Login → role | Role pills route each persona to its own dashboard & sidebar |
| 🧭 Hash routing | Every sidebar item and card is a real URL (`#/student/...`) — back/forward buttons work |
| 🧠 Assessment & challenges | Question-by-question flow, timed practice builds, completion updates journey state |
| 📮 Apply → tracker | Apply fires a toast and the card lands in the pipeline as *Applied* |
| 🔄 Cross-role sync | `setApplicantStatus` in Industry moves the same card in the Student tracker — one shared store |
| 🛟 Interventions | Institutions launch gap-fix programs (e.g. *JavaScript Bootcamp — 184 students assigned*) that surface on student screens |
| 🤝 Mentorship | Request → accept → notifications on both sides |
| 🪟 Modals & toasts | Global `modal()` / `toast()` system for confirmations and detail views |
| ✨ Hover states | Cards lift, buttons elevate on every surface |



## 🎨 Design System — "Ocean Blue"

| Token | Value | Usage |
| --- | --- | --- |
| Ocean | `#0369A1` | Navbar, primary buttons, active states |
| Ocean Dark | `#075985` | Button hover |
| Sky | `#0EA5E9` | Secondary accents, interview status, gradients |
| Seafoam | `#2DD4BF` | Verified ✔, offers, success highlights — used sparingly |
| Background | `#F0F9FF` · Card `#FFFFFF` / border `#E2E8F0` | Light canvas, 16px-radius cards |
| Text | `#0C4A6E` / `#475569` | Poppins headings · Inter body |
| Status | Applied `#64748B` · Shortlisted `#D97706` · Interview `#0EA5E9` · Offered `#2DD4BF` · Rejected `#DC2626` | Pill badges & pipeline borders |
| Skill gaps | Red `#DC2626` · Amber `#D97706` · On-track `#16A34A` | Gap bars, heatmap cells |

Signature elements: the **sky→ocean gradient readiness ring**, **match-% pills**, and the **seafoam verified seal**.



## 🗂️ Project Structure

javascript
skillbridge-prototype/
├── index.html      # 0.8 KB — app shell, font links, mounts #app
├── styles.css      # 19 KB  — full Ocean Blue design system
├── app.js          # 76 KB  — SPA: state, hash router, 25 routes, charts
└── README.md



🛠️ Tech Notes

- **Vanilla HTML/CSS/JS** — no frameworks, no bundler, no network calls (Google Fonts via CDN with graceful offline fallback)
- **Hash-based SPA router** with query params (`#/student/challenge?id=2`) and browser history support
- All charts (readiness ring, radar, heatmap, funnel) are **hand-drawn SVG/CSS**
- One shared client-side store drives the four roles — that's what makes cross-role sync possible
- 8px spacing system · 44px minimum touch targets · responsive mobile preview


🗺️ Roadmap (post-prototype)

- [ ] React + design-token package for the Ocean Blue system
- [ ] Backend: assessment engine, match scoring, real notifications
- [ ] Institution exports (placement PDFs/Excel) & WCAG AA audit

