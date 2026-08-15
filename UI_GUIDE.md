# Knowledge Battle Admin Dashboard — UI Design Guide

This guide defines the visual language for the admin dashboard so it feels like a natural extension of Amol Tracker's brand (dark emerald/gold, Islamic-app aesthetic) while staying clean, fast, and easy to scan for a single-admin content tool.

---

## 1. Design Principles

- **Consistent with the app, not identical to it.** Reuse the emerald/gold identity, but let the dashboard feel like a "control room" — more neutral surface area, brand color used for emphasis rather than everywhere.
- **Data-first.** This is a content management tool. Tables, forms, and status states should be scannable at a glance — no decorative clutter competing with the data.
- **Calm dark mode as default.** Admin tools are used in short, frequent bursts (often at night after work). Default to dark theme; make light mode a toggle, not the primary experience.

---

## 2. Color Palette

### Brand core (carried over from Amol Tracker)
| Token | Hex | Usage |
|---|---|---|
| `--brand-emerald` | `#0F5132` | Primary actions, active nav, focus rings |
| `--brand-emerald-light` | `#1B7A4D` | Hover states, secondary emphasis |
| `--brand-gold` | `#D4AF37` | Accents, badges, highlights, success emphasis on dark bg |
| `--brand-gold-soft` | `#E8C766` | Hover on gold elements |

### Dark theme (default)
| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#0B0F0D` | App background |
| `--bg-surface` | `#121814` | Cards, panels, table containers |
| `--bg-surface-raised` | `#1A211C` | Modals, dropdowns, popovers |
| `--border-subtle` | `#243027` | Card borders, dividers |
| `--text-primary` | `#F4F6F4` | Headings, primary text |
| `--text-secondary` | `#9CAAA2` | Labels, helper text |
| `--text-muted` | `#6B7A70` | Placeholders, disabled text |

### Light theme (optional toggle)
| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#F7F8F6` | App background |
| `--bg-surface` | `#FFFFFF` | Cards, panels |
| `--border-subtle` | `#E3E7E2` | Dividers |
| `--text-primary` | `#111815` | Headings |
| `--text-secondary` | `#5A6660` | Body/labels |

### Semantic / status colors (same in both themes)
| Token | Hex | Usage |
|---|---|---|
| `--success` | `#2FA36B` | Successful upload toast, "Active" badge |
| `--warning` | `#E0A94A` | "Draft" / needs-review badge |
| `--danger` | `#D9534F` | Delete actions, validation errors, "Inactive" |
| `--info` | `#4A9CE0` | Neutral notices, bulk-upload progress |

**Rule of thumb:** emerald = primary action, gold = highlight/success accent, never use both as background+text on the same element (contrast risk). Status colors are reserved strictly for badges, toasts, and inline validation — not decoration.

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
- **Elevation:** Avoid heavy shadows on dark theme (they don't read well). Use a 1px `--border-subtle` outline plus a very faint inner glow instead of drop shadows for cards.
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

## 7. Accessibility

- Maintain minimum 4.5:1 contrast for body text against backgrounds (verify gold-on-dark and emerald-on-dark combos specifically — gold on light backgrounds can fail contrast, use `--brand-emerald` for text-on-light instead).
- Every interactive element needs a visible focus ring (emerald, 2px, offset).
- Don't rely on color alone for status — pair badges with a short label ("Active" / "Inactive"), not just a colored dot.