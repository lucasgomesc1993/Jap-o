---
name: NipponBox
colors:
  surface: '#fef8f2'
  surface-dim: '#ded9d3'
  surface-bright: '#fef8f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f3ec'
  surface-container: '#f2ede7'
  surface-container-high: '#ede7e1'
  surface-container-highest: '#e7e2dc'
  on-surface: '#1d1b18'
  on-surface-variant: '#5b403e'
  inverse-surface: '#32302c'
  inverse-on-surface: '#f5f0ea'
  outline: '#8f6f6d'
  outline-variant: '#e4bebb'
  surface-tint: '#b91a25'
  primary: '#78000f'
  on-primary: '#ffffff'
  primary-container: '#a30018'
  on-primary-container: '#ffaca6'
  inverse-primary: '#ffb3ae'
  secondary: '#665d57'
  on-secondary: '#ffffff'
  secondary-container: '#eaddd6'
  on-secondary-container: '#6a615b'
  tertiary: '#393836'
  on-tertiary: '#ffffff'
  tertiary-container: '#504f4c'
  on-tertiary-container: '#c3c1bd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad7'
  primary-fixed-dim: '#ffb3ae'
  on-primary-fixed: '#410004'
  on-primary-fixed-variant: '#930014'
  secondary-fixed: '#ede0d9'
  secondary-fixed-dim: '#d1c4bd'
  on-secondary-fixed: '#211a16'
  on-secondary-fixed-variant: '#4d4540'
  tertiary-fixed: '#e5e2de'
  tertiary-fixed-dim: '#c8c6c2'
  on-tertiary-fixed: '#1c1c1a'
  on-tertiary-fixed-variant: '#474744'
  background: '#fef8f2'
  on-background: '#1d1b18'
  surface-variant: '#e7e2dc'
typography:
  h1:
    fontFamily: Cormorant Garamond
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.01em
  h2:
    fontFamily: Cormorant Garamond
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  h3:
    fontFamily: Cormorant Garamond
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.2'
  body:
    fontFamily: Jost
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  ui-label:
    fontFamily: Jost
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  button:
    fontFamily: Jost
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  sidebar_width: 228px
  gutter: 24px
  margin_page: 48px
  card_padding: 24px
  section_gap: 64px
---

## Brand & Style

This design system embodies the "High-End Japanese Boutique" aesthetic, focusing on the intersection of traditional craftsmanship and modern editorial minimalism. The target audience appreciates quiet luxury, precision, and a curated shopping experience.

The design style is **Minimalist-Editorial**. It prioritizes intentional whitespace (Ma), razor-sharp alignment, and a sophisticated contrast between heritage-inspired serif typography and functional geometric sans-serifs. The atmosphere is calm, high-contrast yet warm, and avoids unnecessary ornamentation to allow the products to stand as the primary focus.

## Colors

The palette is rooted in a warm, organic foundation. The primary **Crimson (#A30018)** is used sparingly as a mark of quality and intent, reminiscent of Japanese lacquerware or a hanko seal. 

- **Background:** A warm off-white that reduces eye strain and provides a tactile, "washi paper" feel.
- **Surface:** Pure white is reserved for cards and the sidebar to create distinct elevation against the warm background.
- **Text:** Near-black with warm undertones maintains readability while feeling softer and more premium than pure black.
- **Borders:** Subtle taupe-grey provides structure without breaking the editorial flow.

## Typography

This design system utilizes a dual-font strategy to balance editorial elegance with functional clarity. 

- **Titles (H1-H3):** Use *Cormorant Garamond* (represented by *Newsreader* in the available system fonts). This serif face provides an authoritative, literary feel. Use sentence case for headlines to maintain a modern boutique tone.
- **Body & UI:** Use *Jost* (represented by *Epilogue* in the available system fonts). This geometric sans-serif offers high legibility for product descriptions and navigation. 
- **Character:** Letter spacing should be slightly increased for UI labels and buttons to enhance the premium, airy feel.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** within a fluid container, emphasizing "Ma" (the beauty of empty space). 

- **Sidebar:** A fixed 228px white column. It features a signature 3px crimson stripe at the top edge, serving as a constant brand anchor.
- **Grid:** Use a 12-column grid for content areas with generous 24px gutters. 
- **Rhythm:** Vertical spacing between sections should be expansive (64px+) to allow the eye to rest and to signify a transition between curated "collections."
- **Alignment:** All text elements should align to a rigorous baseline to reinforce the sense of precision.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and subtle, warm shadows rather than heavy blurs or dramatic lighting.

- **Shadows:** Use a very soft, diffused shadow: `rgba(26, 20, 16, 0.05)` with a 10px to 20px blur. This creates a "lifted paper" effect rather than a digital floating effect.
- **Borders:** Every card and surface transition is defined by a 1px solid border in `#DDD8D2`. 
- **Depth Levels:**
    - **Level 0 (Base):** Background `#F5F2EE`.
    - **Level 1 (Cards/Sidebar):** Surface `#FFFFFF` with 1px border.
    - **Level 2 (Dropdowns/Modals):** Surface `#FFFFFF` with warm shadow and 1px border.

## Shapes

The shape language is "Soft-Precision." While the layout is rigid and grid-based, the individual elements use a **10px corner radius** (represented as `roundedness: 2`). This softening of the corners prevents the UI from feeling cold or clinical, adding a touch of contemporary friendliness to the boutique aesthetic.

## Components

- **Buttons:** 
    - **Primary:** Crimson background, white text. No border. Jost 600, 13px. Minimalist padding: 12px 24px.
    - **Secondary:** Transparent background, 1px `#1A1410` border, text in `#1A1410`.
- **Cards:** White background, 10px radius, 1px `#DDD8D2` border. Use generous internal padding (24px).
- **Inputs:** 1px border in `#DDD8D2`. On focus, the border changes to Crimson. Background is `Surface2`.
- **Sidebar Navigation:** Use Jost 500 for links. Active state is indicated by a subtle weight change and a small 2px crimson vertical bar on the left of the label.
- **Chips/Tags:** Small 10px Jost text, light `#EEE9E4` background, 2px radius.
- **Checkboxes/Radios:** Use sharp squares for checkboxes and circles for radios, utilizing the Crimson accent for the "selected" state.
- **Product Display:** Use a "hanging" layout where images are flush with the top of the card, followed by serif titles and sans-serif prices below.