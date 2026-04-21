# CLAUDE-DESIGN.md — Iron & Light Johnson Academy
## Ink & Gold Design System

Read this file only for sessions that touch CSS or visual components.
Do not read for logic-only sessions.

---

## Core Rules
- All tokens and components live in packages/shared — never redefine in individual tools
- Font is Lexend ONLY — never Inter, Roboto, or system fonts
- Primary accent is gold #c9a84c — never green, never blue
- Header/sidebar/bottom nav background is always #22252e hardcoded — never a CSS variable
- Card text uses var(--text-primary) NOT var(--ink)
- Desktop breakpoint 1024px — never lower

---

## Font
Single font family: Lexend (Google Fonts)
Weights: 300, 400, 500, 600, 700
Stack: 'Lexend', system-ui, sans-serif — applied to ALL elements globally
Form elements override explicit: input, textarea, button, select all inherit Lexend.
Body base: 14px. No serif fonts anywhere in the UI.

---

## Logo
File: packages/shared/src/assets/logo.png
Import: import logo from '@homeschool/shared/assets/logo.png'
Both Header components render: <img src={logo} alt="ILA" className="header-logo" />

---

## Color tokens — Light mode (default)
--bg-base:       #f2f0ed
--bg-surface:    #ebe8e3
--bg-card:       #ffffff
--bg-card-hover: #faf8f5
--border:        #eae6e0
--border-light:  #f0ece6
--ink:           #22252e
--ink-light:     #3a3d48
--gold:          #c9a84c
--gold-light:    #e8c97a
--gold-pale:     rgba(201,168,76,0.10)
--red:           #c0392b
--red-lt:        #fdf0ed
--text-primary:  #2a2520
--text-secondary:#5a5248
--text-muted:    #a8a09a

## Color tokens — Dark mode
--bg-base:       #1c1e24
--bg-surface:    #22252e
--bg-card:       #2a2d35
--bg-card-hover: #32353f
--border:        #363944
--border-light:  #3a3d48
--ink:           #3a3d48
--ink-light:     #4a4e5a
--gold:          #c9a84c
--gold-light:    #e8c97a
--gold-pale:     rgba(201,168,76,0.12)
--red:           #e05252
--red-lt:        rgba(224,82,82,0.10)
--text-primary:  #e8e8e8
--text-secondary:#a0a8b8
--text-muted:    #5a6070

Dark mode: toggle data-mode="light" / data-mode="dark" on <html>
All tokens scoped to [data-mode] selectors
All color transitions: transition: 0.3s
No backward-compat aliases — all components use Ink & Gold tokens directly.

---

## Dark mode token rule
Never hardcode colors that need to work in both light and dark.
Always use CSS variables (var(--text-primary), var(--bg-card), etc.)

Hardcoded literals ONLY on brand chrome:
- Header / sidebar / bottom nav / sheet-header backgrounds → always #22252e
- Active-state gold accents (#e8c97a, #c9a84c) on dark chrome → same in both modes

Token choice — tricky spots:
- Card body text → var(--text-primary) NOT var(--ink)
  (--ink becomes unreadable on dark card backgrounds)
- Section headings, sheet labels → var(--text-secondary) NOT var(--text-muted)
  (--text-muted is too faint for small-caps headings in dark mode)

When a hardcoded color must only apply in one mode, scope with [data-mode="dark"] rules.

---

## Layout
- Mobile: planner header is 132px fixed 3-row stack (#22252e). Shell has BottomNav as 56px fixed bottom bar.
- Desktop (≥1024px): planner header display:none. Shell's 200px fixed left sidebar owns branding + nav + sign-out + Student selector. Content column has margin-left: 200px.
- All chrome backgrounds are #22252e hardcoded — never changes between light/dark.

---

## Header
- Background: #22252e — hardcoded literal, NOT a CSS var
- Planner: 3 rows — Row 1 (48px) logo + brand + 4 icon buttons; Row 2 (~52px) week nav centered; Row 3 (32px) student pills. Total: 132px.
- Dashboard: single row, 60px, logo + school name + 2 icon buttons
- Logo: 34–38px square, border-radius: 8px
- School name:
    Line 1: "IRON & LIGHT" — LIGHT in .header-school-accent (color: #e8c97a)
    Line 2: "JOHNSON ACADEMY"
    Tagline: "Faith · Knowledge · Strength" (rgba(255,255,255,0.35))
- Icon buttons: 32×32px, background: rgba(255,255,255,0.08), border: rgba(255,255,255,0.13)
- Active student tab: color: #e8c97a
- Student row border-top: 1px solid rgba(255,255,255,0.07)

---

## DayStrip
- Floating pill container: background var(--bg-card), border-radius: 12px, padding: 5px, margin: 0 14px 14px
- Active day: background #22252e (dark pill), white text
- Today: date number in var(--gold), 2px solid underline in var(--gold)
- Today + active: date in var(--gold-light) for contrast on dark pill
- Sick day: red dot via CSS ::after centered below date number (not top-right corner)

---

## Bottom nav / Sidebar
Heights (responsive):
- base (<400px): 56px; icon 18px; label 9px
- ≥400px and ≤1023px: 68px; icon 24px; label 12px
- ≥1024px: collapses to 200px left sidebar (height: 100vh)

- Background: always #22252e — never changes in dark mode
- Active tab: icon + label #e8c97a, icon pill rgba(201,168,76,0.15) background
- Inactive tab: rgba(255,255,255,0.45)
- Large phone band ALWAYS bounded: (min-width: 400px) and (max-width: 1023px)

Desktop sidebar spec:
- Width 200px, fixed left, full viewport height, #22252e background
- Brand block at top: logo + school name + tagline (desktop only)
- Tab list: vertical rows (icon + label)
- Student section: renders only when activeTab === 'planner' && students.length > 0
- Footer: sign-out button + version — desktop only

---

## Sidebar nav items
- 44x44px, border-radius: 10px
- Default: color: var(--text-muted), no background
- Hover: background: var(--bg-card)
- Active: background: var(--gold-pale), color: var(--gold), box-shadow: inset 0 0 0 1px rgba(201,168,76,0.2)

---

## Cards
- background: var(--bg-card), border: 1px solid var(--border), border-radius: 12px, padding: 22px
- shadow light: 0 1px 4px rgba(0,0,0,0.06)
- shadow dark: 0 1px 6px rgba(0,0,0,0.25)
- Title: 12px, font-weight: 600, letter-spacing: 0.08em, text-transform: uppercase, color: var(--text-secondary)
- Hover: border-color: var(--gold-light), box-shadow: 0 4px 16px rgba(201,168,76,0.12), transform: translateY(-2px)

---

## Buttons
- Primary: background: var(--gold), color: #fff, border-radius: 8px, padding: 7px 16px, font-weight: 600. hover: var(--gold-light)
- Ghost: transparent, border: 1px solid var(--border), color: var(--text-secondary). hover: border var(--gold), color var(--gold)
- Text link: color: var(--gold-light), no border/background

---

## Progress bars
- Track: 4px, background: var(--border), border-radius: 2px
- Fill: linear-gradient(90deg, var(--gold), var(--gold-light))
- Thumb: 12x12px, background: var(--gold-light), border: 2px solid var(--bg-base), box-shadow: 0 0 0 2px var(--gold-light)

---

## Lesson rows
- padding: 10px 14px, border-radius: 8px
- hover: background: var(--bg-card-hover)
- Color dot: 8x8px circle left of content
- Sub-label: italic, 11px, color: var(--text-muted)
- Date: right-aligned, 11px, color: var(--text-muted)

---

## Section dividers
- 11px, font-weight: 600, letter-spacing: 0.1em, text-transform: uppercase, color: var(--text-muted)
- ::after flex line: height: 1px, background: var(--border), flex: 1

---

## General vibe — non-negotiable
- Warm charcoal + gold. Header is always #22252e — the strongest brand anchor.
- Content area is warm cream/white in light, dark charcoal in dark. Never gray-blue.
- Lexend 300-400 body, 500-600 emphasis
- Gold (#c9a84c) is the primary accent — active states, highlights, CTAs
- Borders always warm-toned, never neutral gray
- Spacing generous: 28px page padding, 20px between cards, 22px internal card padding

---

## Where desktop rules live
- App.css @media → shell-aware: .shell-content offset, .shell-content .day-strip non-sticky, .shell-content .planner-action-bar alignment
- PlannerLayout.css @media → planner-only: .planner-body sizing, .planner-subjects grid, day headers, week nav
- Header.css @media → single rule: .header { display: none }
- DayStrip.css → no @media. Mobile horizontal pill layout correct at every width.
- SubjectCard.css → no @media. Card geometry is intrinsic.
- BottomNav.css @media → mobile bottom bar → desktop left sidebar transition

---

## Subject color palette (CalendarWeekView)
Auto-assigned via hash of subject name — 8 color palette, same subject always same color.
Colors: red, blue, green, orange, purple, teal, pink, gold.
No setup needed. Done cards are faded with strikethrough.
