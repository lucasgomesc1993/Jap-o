---
name: NipponBox - Tokyo Editorial
colors:
  surface: '#ffffff'
  surface-dim: '#f4f4f5'
  surface-bright: '#ffffff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fafafa'
  surface-container: '#f4f4f5'
  surface-container-high: '#e4e4e7'
  surface-container-highest: '#d4d4d8'
  on-surface: '#09090b'
  on-surface-variant: '#71717a'
  inverse-surface: '#09090b'
  inverse-on-surface: '#ffffff'
  outline: '#e4e4e7'
  outline-variant: '#f4f4f5'
  primary: '#bc002d'
  on-primary: '#ffffff'
  primary-container: '#e60037'
  on-primary-container: '#ffffff'
  inverse-primary: '#ff4d6d'
  secondary: '#18181b'
  on-secondary: '#ffffff'
  secondary-container: '#27272a'
  on-secondary-container: '#ffffff'
  error: '#ef4444'
  on-error: '#ffffff'
  error-container: '#fecaca'
  on-error-container: '#991b1b'
  background: '#fafafa'
  on-background: '#09090b'
typography:
  h1:
    fontFamily: Cormorant Garamond, serif
    fontSize: clamp(4rem, 8vw, 7.5rem)
    fontWeight: '500'
    lineHeight: '0.9'
    letterSpacing: -0.04em
  h2:
    fontFamily: Cormorant Garamond, serif
    fontSize: clamp(3rem, 5vw, 4.5rem)
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: -0.02em
  h3:
    fontFamily: Cormorant Garamond, serif
    fontSize: 2rem
    fontWeight: '500'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  body:
    fontFamily: Inter, sans-serif
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  ui-label:
    fontFamily: Inter, sans-serif
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.15em
    textTransform: uppercase
  button:
    fontFamily: Inter, sans-serif
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.15em
    textTransform: uppercase
rounded:
  sm: 2px
  DEFAULT: 4px
  md: 6px
  lg: 8px
  xl: 12px
  full: 9999px
spacing:
  unit: 4px
  sidebar_width: 280px
  gutter: 24px
  margin_page: 48px
  card_padding: 32px
  section_gap: 120px
---

## Brand & Style

This design system embodies the **"Tokyo Editorial / Tech-Logistics Avant-Garde"** aesthetic. We have completely stripped away "AI slop", generic soft gradients, and warm beiges. The focus is now on high-contrast brutalism, razor-sharp alignment, mass-scale typography, and a cold, hyper-efficient technological vibe. 

The target audience should feel they are using a highly sophisticated, industrial-grade proxy logistics terminal disguised as a high-end fashion magazine.

## Colors

The palette is strictly monochromatic (Zinc system) punctuated by a singular, violent red (Crimson/Japanese Flag Red).

- **Background:** Stark whites (`#ffffff`) and cold light zincs (`#fafafa`). Absolutely no warm or yellow undertones.
- **Surface:** Pure white for maximum contrast against light zinc backgrounds.
- **Inverse Surface:** Pure black or Zinc 950 (`#09090b`) used for massive, heavy blocks of text or entire inverse sections (like the Philosophy section) to create sudden, dramatic visual weight.
- **Text:** Near black (`#09090b`) for primary reading, Zinc 500 (`#71717a`) for technical secondary data.
- **Accent:** Crimson Red (`#bc002d`). Used exclusively for active states, hover glows, and the single primary action path. It signifies intent and action.

## Typography

The dual-font strategy creates extreme tension between heritage and machinery.

- **Headings (H1-H3):** *Cormorant Garamond*. Used at colossal, screen-breaking scales. Line-heights are tight (`0.9` to `1`), and tracking is highly negative (`-0.04em`). This gives the appearance of a printed fashion editorial.
- **Body:** *Inter* or a similar stark geometric sans-serif. Slightly tight tracking (`-0.01em`) for a dense, factual look.
- **UI & Labels:** *Inter* at micro-sizes (`11px` to `13px`), heavy weights (`700`), forced uppercase, and extreme positive tracking (`0.15em` to `0.2em`). This creates the "Logistics Terminal" aesthetic.

## Layout & Spacing

The layout philosophy is **Asymmetric Brutalism**. 

- **Negative Space (Ma):** Margins and gaps are enormous. Sections should feel isolated and monumental. `section_gap` is set to `120px`.
- **Grids:** Visible grid lines (1px solid borders) are encouraged to separate content, acting as wireframes.
- **Alignment:** Strict adherence to left-alignment. Center alignment is banned unless used for deliberate artistic interruption.

## Elevation & Depth

We reject soft, generic drop-shadows. Depth is created through stark borders and sudden motion.

- **Borders:** 1px solid `outline` (`#e4e4e7`) is used extensively to box elements, create tables, and segment UI.
- **Hover Shadows:** When shadows are used (e.g., hovering a primary button), they are colored and sharp. A crimson button hovering gains a crimson shadow (`rgba(188, 0, 45, 0.15)`) and translates up (`translateY(-2px)`).
- **Depth Levels:**
    - **Base:** Flat white or zinc.
    - **Interactive:** Boxed with a 1px border.
    - **Hover/Active:** Inverts color or gains a stark red shadow.

## Shapes & Iconography

The shape language is **Cold Precision**.

- **Corners:** Border radii are nearly eradicated. We use `0px` for buttons, or `2px` to `4px` maximum for large surfaces to avoid pixel-bleeding. No "squircles" or pills.
- **Icons:** Emojis are strictly forbidden. Use `lucide-react` with a `strokeWidth={1.5}` or `1`. Icons must be wireframe-thin to match the editorial lines.

## Components

- **Buttons:**
    - **Primary:** Hollow by default or solid crimson. Rectangular (`border-radius: 0`). Micro-typography (11px, uppercase, 0.15em tracking). On hover, background turns white, text turns crimson, lifting with a crimson shadow.
    - **Secondary:** Flat text or 1px bordered boxes. Inverts colors on hover.
- **Cards/Containers:** 1px sharp borders. No internal drop shadows. High internal padding.
- **Steppers/Timelines:** Stripped down to flat lines with editorial numbers (`01`, `02`, `03`) floating on top. No bubbles or circles.
- **Forms/Inputs:** Bottom-border only, or sharp 1px boxes. Focus state turns the border solid black or crimson instantly—no slow fading.