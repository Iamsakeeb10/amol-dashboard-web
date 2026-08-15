# Knowledge Battle Admin Dashboard — UI Design Guide

This guide defines the visual language for the admin dashboard so it feels like a natural extension of Amol Tracker's brand (dark emerald/gold, Islamic-app aesthetic) while staying clean, fast, and easy to scan for a single-admin content tool.

---

## 1. Design Principles

- **Consistent with the app, not identical to it.** Reuse the emerald/gold identity, but let the dashboard feel like a "control room" — more neutral surface area, brand color used for emphasis rather than everywhere.
- **Data-first.** This is a content management tool. Tables, forms, and status states should be scannable at a glance — no decorative clutter competing with the data.
- **Soothing light mode as default.** Since this is a content-review tool used to read a lot of question text, default to a soft, low-glare white palette that's easy on the eyes for long sessions. Offer the dark emerald/gold theme as a toggle for night use, not the other way around.

---

## 2. Color Palette

### Brand core (carried over from Amol Tracker — used as accent in both themes)
| Token | Hex | Usage |
|---|---|---|
| `--brand-emerald` | `#0F5132` | Primary actions, active nav, focus rings |
| `--brand-emerald-light` | `#1B7A4D` | Hover states, secondary emphasis |
| `--brand-gold` | `#B8923F` | Accents, badges, highlights (deepened slightly for legibility on white) |
| `--brand-gold-soft` | `#D4AF37` | Hover on gold elements, dark-theme accent |

### Light theme (default) — soft, soothing, low-glare
| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#FAFAF7` | App background — warm off-white, not stark `#FFFFFF`, easier on the eyes |
| `--bg-surface` | `#FFFFFF` | Cards, panels, table containers |
| `--bg-surface-raised` | `#FFFFFF` | Modals, dropdowns, popovers — paired with a soft shadow instead of a color shift |
| `--border-subtle` | `#E6E8E3` | Card borders, dividers |
| `--text-primary` | `#1E2621` | Headings, primary text — soft near-black, not pure `#000` |
| `--text-secondary` | `#5C6960` | Labels, helper text |
| `--text-muted` | `#8B958E` | Placeholders, disabled text |
| `--accent-wash` | `#EAF3EC` | Very light emerald tint for hover rows, selected states, subtle section backgrounds |

### Dark theme (toggle, for night use)
| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#0B0F0D` | App background |
| `--bg-surface` | `#121814` | Cards, panels, table containers |
| `--bg-surface-raised` | `#1A211C` | Modals, dropdowns, popovers |
| `--border-subtle` | `#243027` | Card borders, dividers |
| `--text-primary` | `#F4F6F4` | Headings, primary text |
| `--text-secondary` | `#9CAAA2` | Labels, helper text |
| `--text-muted` | `#6B7A70` | Placeholders, disabled text |

### Semantic / status colors (same in both themes)
| Token | Hex | Usage |
|---|---|---|
| `--success` | `#2FA36B` | Successful upload toast, "Active" badge |
| `--warning` | `#E0A94A` | "Draft" / needs-review badge |
| `--danger` | `#D9534F` | Delete actions, validation errors, "Inactive" |
| `--info` | `#4A9CE0` | Neutral notices, bulk-upload progress |

**Rule of thumb:** emerald = primary action, gold = highlight/success accent, never use both as background+text on the same element (contrast risk). Status colors are reserved strictly for badges, toasts, and inline validation — not decoration. On the light theme, use `--brand-gold` (the deepened `#B8923F`) for any gold *text*, and reserve the brighter `--brand-gold-soft` for backgrounds/borders only — bright gold text on white fails contrast.

---

## 3. Typography

- **Font:** Inter or Geist (clean, geometric, excellent at small sizes for tables/forms). Bengali question text should render with a font that has solid Bengali glyph support (e.g. Noto Sans Bengali) as a fallback stack.
- **Scale:**
  - Page title: 28px / semibold
  - Section heading: 18–20px / semibold
  - Body / table text: 14px / regular
  - Labels / helper text: 12–13px / medium, `--text-secondary`
- **Line height:** 1.5 for body, 1.2 for headings.
- Keep question-text fields visually distinct (slightly larger, monospace-adjacent or quoted styling) since that's the core content being reviewed.

---

## 4. Layout & Spacing

- **Spacing scale (4px base):** 4 / 8 / 12 / 16 / 24 / 32 / 48px. Use 16px as the default gap between form fields, 24px between major sections, 32–48px for page-level padding on desktop.
- **Radius:** 8px on inputs/buttons, 12px on cards/modals, 999px (pill) on badges and status chips — matches Amol Tracker's rounded, friendly feel.
- **Elevation:** On the light theme, use soft, diffuse shadows (e.g. `0 2px 8px rgba(30,38,33,0.06)`) for cards and modals — keep them subtle, not sharp/dark, to preserve the soothing feel. On the dark theme, avoid heavy shadows (they don't read well); use a 1px `--border-subtle` outline plus a very faint inner glow instead.
- **Grid:** 12-column layout on desktop, single column stacked on mobile. Max content width ~1200px, centered, with generous side padding on ultra-wide screens.

---

## 5. Responsive Behavior

| Breakpoint | Range | Behavior |
|---|---|---|
| Mobile | < 640px | Single column. Topic selector becomes a full-width dropdown at top. Tabs (Single Add / Bulk Upload) become swipeable/segmented control. Table view collapses into stacked cards (one question per card) instead of horizontal scroll. |
| Tablet | 640px – 1024px | Two-column form layout where sensible (e.g. option pairs side by side). Table view returns with horizontal scroll if needed; sticky first column. |
| Desktop | > 1024px | Sidebar (topic list / nav) + main content area. Full data table with all columns visible. Form and preview can sit side-by-side. |
| Wide | > 1440px | Cap content width at ~1200–1280px, center it — don't stretch tables/forms edge-to-edge. |

**Touch targets:** minimum 44x44px on mobile for buttons, checkboxes, and the correct-answer radio selector.

**Sticky elements:** on mobile, keep the "Submit / Upload" action pinned to the bottom of the viewport (not buried below a long form) so it's always reachable.

---

## 6. Component Styling Notes

- **Buttons:** Primary = solid emerald bg, white text. Secondary = transparent bg, emerald border/text. Destructive (delete question) = danger red, used sparingly with a confirm step.
- **Cards (question rows, topic cards):** `--bg-surface` background, `--border-subtle` 1px border, 12px radius, 16–20px internal padding.
- **Status badges:** pill-shaped, soft-tinted background (e.g. success color at 15% opacity) with full-strength text color — not solid fill blocks.
- **Forms:** Inputs use `--bg-surface-raised` background with `--border-subtle`, emerald border + subtle emerald glow on focus. Labels above inputs, not inline.
- **Correct-answer selector:** Make the correct option visually distinct with a gold left-accent or checkmark badge once selected — this is the most important field on the form, it should never be ambiguous.
- **Bulk upload dropzone:** Dashed `--border-subtle` border, emerald highlight + subtle bg tint on drag-over state. Show a compact progress/result summary (X added, Y skipped) using status colors after commit.
- **Toasts:** Bottom-right on desktop, bottom-center full-width on mobile. Success = emerald/gold accent bar, error = danger accent bar.
- **Empty states:** Simple centered icon + short text + primary CTA (e.g. "No questions yet — Add your first question"). Avoid empty tables with no guidance.

---

## 7. Theme Toggle

- Add a simple sun/moon icon toggle in the top nav (top-right, next to the logout button) that switches a `data-theme="light" | "dark"` attribute on `<html>` and swaps the CSS variable values above.
- Persist the choice (e.g. `localStorage` in a real deploy) so it doesn't reset every visit, but **default new/first-time sessions to light** per the soothing-by-default preference.
- Respecting `prefers-color-scheme` is optional here — since this default intentionally overrides "match system" in favor of light-first.

---

## 8. Accessibility

- Maintain minimum 4.5:1 contrast for body text against backgrounds in both themes (verify `--brand-gold` variants specifically — the brighter gold fails contrast as text on white; use the deepened `#B8923F` or `--brand-emerald` for text-on-light instead).
- Every interactive element needs a visible focus ring (emerald, 2px, offset) in both themes.
- Don't rely on color alone for status — pair badges with a short label ("Active" / "Inactive"), not just a colored dot.