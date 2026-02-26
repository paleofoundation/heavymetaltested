# Indiana University Bloomington — Design Tokens & CSS Patterns

A comprehensive summary of design tokens, typography, colors, spacing, and layout patterns extracted from the IU Bloomington website (bloomington.iu.edu) and IU brand assets.

---

## 1. Color Palette

### Primary Brand Colors
| Token | Hex | Usage |
|-------|-----|-------|
| **Crimson (Primary)** | `#990000` | Primary accent, links, buttons, footer links, hero backgrounds, card eyebrows |
| **Crimson (Short)** | `#900` | Alternate shorthand in site.css |
| **Crimson Dark / Mahogany** | `#7A1705` | Footer tagline background, branding bar (3.x), trident accent |
| **Crimson Darker** | `#800000` | Footer border-top, button hover states |
| **Crimson Darkest** | `#5a0c0c` | Button active state |
| **Cream** | `#edebeb` | Backgrounds (site.css variant) |
| **White** | `#ffffff` | Backgrounds, button text on crimson |

### Crimson Scale (Rivet Design System)
| Level | Hex | Use |
|-------|-----|-----|
| crimson-000 | `#fff7f8` | Lightest tint |
| crimson-100 | `#ffd6db` | Light tint, borders |
| crimson-200 | `#ff636a` | |
| crimson-300 | `#f23a3f` | |
| crimson-400 | `#dc231e` | Code/inline, focus rings |
| crimson-500 | `#990000` | **Primary** |
| crimson-600 | `#800000` | Hover |
| crimson-700 | `#5a0c0c` | Active |

### Neutral / Black Scale (Text & UI)
| Token | Hex | Usage |
|-------|-----|-------|
| black-000 | `#f8f9fa` | Lightest background (hero, billboard) |
| black-000 (alt) | `#f7f7f8` | Site.css variant |
| black-100 | `#e2e7e9` | Borders, dividers, light gray |
| black-100 (alt) | `#ebecee` | Site.css borders |
| black-200 | `#a0abb4` | |
| black-300 | `#75838f` | |
| black-400 | `#4c5a69` | Body text, secondary content |
| black-500 | `#243142` | **Primary text**, headings |
| black-600 | `#182534` | |
| black-700 | `#0e1825` | |
| black-800 | `#243142` | Site.css |
| black-900 | `#161c24` | Site.css |

### Secondary Brand Colors
| Color | Primary | Light (100) | Dark (600/700) |
|-------|---------|-------------|----------------|
| **Blue** | `#006298` | `#c6ecf6` / `#edfafd` | `#004f80` / `#00385f` |
| **Gold** | `#ffaa00` | `#fff4c6` | `#a36b00` |
| **Green** | `#056e41` | `#dee8c6` | `#005c31` |
| **Orange** | `#df3603` | `#ffcdc0` | `#b11c00` |
| **Purple** | `#59264d` | `#decadc` | `#48183d` |

### UI Colors
| Purpose | Hex |
|---------|-----|
| Border default | `#e2e7e9` |
| Border (site.css) | `#c4c7cc` |
| Focus ring | `#990000` or `#dc231e` |
| Trident shadow (3.x) | `rgba(74, 61, 48, 0.3)` |
| Tile color (meta) | `#990000` |

---

## 2. Typography

### Font Families
| Family | Fallbacks | Usage |
|--------|-----------|-------|
| **BentonSans** | Helvetica Neue, Helvetica, Arial, sans-serif | Primary sans-serif |
| **BentonSansRegular** | Arial, serif | Body, footer |
| **BentonSansBold** | Arial, serif | Branding bar, headings |
| **BentonSansCondRegular** | Arial, serif | Compact headings |
| **BentonSansCondBold** | Arial, serif | Footer tagline |
| **BentonSansLight** | — | Light weight |
| **GeorgiaPro** | Georgia, Times New Roman, Times, serif | Serif body, quotes |
| **GeorgiaProBoldItalic** | Georgia, serif | Footer tagline "and" |

### Font Sources
- Base URL: `https://fonts.iu.edu/fonts/`
- Preload: `benton-sans-regular.woff`, `benton-sans-bold.woff`
- Loaded via: `https://fonts.iu.edu/style.css?family=BentonSans:regular,bold|BentonSansCond:regular,bold|GeorgiaPro:regular|BentonSansLight:regular`

### Font Sizes
| Context | Size | Notes |
|---------|------|------|
| Footer p | `0.75rem` | Small text |
| Footer tagline span | `1rem` | "and" in tagline |
| Card eyebrow | `0.875rem` | |
| Hero eyebrow | `0.875rem` | Uppercase |
| Body / default | `1rem` | |
| Hero teaser | `1.125rem` | |
| Branding bar (mobile) | `17px` / `18px` | |
| Branding bar (desktop) | `1.25rem` | |
| Footer tagline | `1.375rem` / `1.5rem` | Uppercase |
| Card title | `1.25rem` | |
| Quote text | `1.625rem` / `2rem` | GeorgiaPro italic |
| Hero title (mobile) | `2rem` | |
| Hero title (desktop) | `2.5625rem` | |
| Stat number | `2.5625rem` | |
| Billboard title | `1.8125rem` | |

### Line Heights
| Context | Value |
|---------|-------|
| Default | `1.5` |
| Hero title | `1.2` |
| Card title | `1.3` |
| Footer p | `24px` / `2.25rem` |
| Footer tagline | `2.5rem` |
| Breakout quote | `39px` / `48px` (md-up) |

### Font Weights
- Normal: `400`
- Medium: `500`
- Bold: `700`

### Text Transform & Letter Spacing
- Branding bar / footer tagline: `text-transform: uppercase`
- Footer tagline: `letter-spacing: 0.2em` (0.1em for bicentennial)
- Hero eyebrow: `letter-spacing: 0.03125rem`
- Stat description: `letter-spacing: 0.025rem`

---

## 3. Spacing Patterns

### Base Unit
- Primary unit: `rem` (root typically 16px)
- Common values: `0.125rem`, `0.25rem`, `0.5rem`, `0.75rem`, `1rem`, `1.5rem`, `2rem`, `2.5rem`, `4rem`

### Padding
| Context | Value |
|---------|-------|
| Row pad | `0.9375rem` (15px) left/right |
| Container | `1.5rem` left/right |
| Card body (raised) | `1rem` / `1.5rem` (md-up) |
| Hero | `1.5rem` top, `2rem` bottom (mobile); `4rem` (md-up) |
| Footer | `24px` / `32px` (md-up) top, `24px` bottom |
| Button | `0 0.75rem` |
| Tagline | `0 24px` / `0 16px` (bicentennial) |

### Margins
| Context | Value |
|---------|-------|
| Row | `margin-left/right: auto` |
| Billboard title | `margin-top: 1rem` |
| Billboard body | `margin-top: 2.5rem` |
| Hero body | `margin-top: 1.5rem` |
| Card content | `margin-top: 1.5rem` |
| Footer tagline | `margin: -24px -0.9375rem 24px -0.9375rem` |

### Border Radius
| Token | Value |
|-------|-------|
| sm | `0.125rem` |
| md | `0.25rem` |
| lg | `0.5rem` |
| circle | `999rem` |

---

## 4. Layout & Max-Widths

### Container Widths
| Context | Max-Width |
|---------|-----------|
| Row (branding, footer) | `64rem` (1024px) |
| Container sm | `52.5rem` (840px) |
| Container md | `64rem` (1024px) |
| Container lg | `71.25rem` (1140px) |
| Billboard center body | `48rem` |

### Breakpoints
| Name | Min-Width |
|------|-----------|
| sm | `30em` (480px) |
| md | `46.25em` (740px) |
| lg | `67.5em` (1080px) |
| xl | `78.75em` (1260px) |
| xxl | `87.5em` (1400px) |
| Desktop (brand) | `1025px` |
| Tablet (brand) | `40em` (640px) |

### Grid / Flex
- Primary layout: Flexbox (`display: flex`, `flex-direction`, `flex-wrap`)
- Row/column utilities: `rvt-row`, `rvt-column`, `rvt-flex-*`
- Responsive: `-sm-up`, `-md-up`, `-lg-up`, `-xl-up`, `-xxl-up` suffixes

---

## 5. Header / Branding Bar

### 3.3.x (Current Bloomington)
- **Background**: `#ffffff`
- **Border**: `1px solid #E2E7E9`
- **Text color**: `#243142`
- **Font**: BentonSansBold
- **Logo**: 36px (mobile), 2.5rem (desktop)
- **Padding**: `1rem` bottom (mobile), `1.6rem` (desktop)
- **Position**: `fixed`, `top: 0`, `z-index: 10`

### 3.x (Legacy)
- **Background**: `#7A1705` (mahogany)
- **Border-top**: `5px solid #990000` (crimson accent bar)
- **Text**: `#fff`
- **Font**: BentonSansCondRegular
- **Trident shadow**: `rgba(74, 61, 48, 0.3)` 3px bar below

### Common
- Max-width row: `64rem`
- Row pad: `0.9375rem`
- Search: 250px width on desktop
- Focus: `outline: .125rem solid #990000`

---

## 6. Footer

- **Font**: BentonSansRegular
- **Links**: `color: #990000`, `text-decoration: underline` (none on hover)
- **Tagline**: Background `#7A1705`, color `#fff`, BentonSansCondBold, uppercase, letter-spacing 0.2em
- **Tagline "and"**: GeorgiaProBoldItalic, lowercase
- **Border-top** (md-up): `6px solid #800000` (3.3.x) or `#7A1705` (3.x)
- **Padding**: `24px 0` (mobile), `32px 0 24px` (md-up)
- **Signature**: 240px width, 36px height (padding-top trick)

---

## 7. Buttons

### Primary (Crimson)
- **Background**: `#990000`
- **Border**: `0.125rem solid #990000`
- **Color**: `#ffffff`
- **Height**: `2.5rem`
- **Padding**: `0 0.75rem`
- **Border-radius**: `0.25rem`
- **Box-shadow**: `0 0.25rem 0.5rem rgba(36, 49, 66, 0.16)`
- **Hover**: `#800000`
- **Active**: `#5a0c0c`
- **Focus**: `box-shadow: 0 0 0 0.125rem #ffffff, 0 0 0 0.25rem #990000`

### On Dark Backgrounds
- Background: `#ffffff`
- Color: `#006298`
- Hover: `#c6ecf6`, text `#00385f`

---

## 8. Cards

- **Raised**: `background: #ffffff`, `border-radius: 0.5rem`, `box-shadow: 0 0.25rem 1rem rgba(36, 49, 66, 0.2)`
- **Eyebrow**: `color: #990000`, `font-size: 0.875rem`
- **Title**: `font-size: 1.25rem`, `line-height: 1.3`, color `#243142`
- **Content**: `border-top: 1px solid #e2e7e9`, `color: #4c5a69`
- **Image**: `border-radius: 0.5rem`

---

## 9. Hero Section

- **Default background**: `#f8f9fa`
- **Dark variant** (`.rvt-hero--bg-dark`): `#990000`
- **Eyebrow**: `#990000`, `0.875rem`, uppercase
- **Title**: `2rem` (mobile), `2.5625rem` (md-up), `line-height: 1.2`
- **Teaser**: `1.125rem`, `#4c5a69`
- **Padding**: `1.5rem` top, `2rem` bottom (mobile); `4rem` (md-up)
- **Media**: `border-radius: 0.5rem`, aspect-ratio 3/2 or 16/9

---

## 10. Notable Design Patterns

### Crimson Accent Bars
- **Branding bar (3.x)**: 5px solid `#990000` at top
- **Billboard title**: `::before` block `2rem × 0.5rem`, `#990000`, `top: -1rem`
- **Footer**: 6px solid crimson/mahogany at top

### Cream / Limestone Backgrounds
- **Cream**: `#edebeb` (site.css)
- **Light gray**: `#f8f9fa`, `#f7f7f8`
- **Billboard image area**: `#f8f9fa` pseudo-element

### Body Class: `mahogany`
- Used on home page (`body.mahogany`) — likely campus-specific theme
- Associates with crimson/mahogany color treatment

### CTA Links
- Font: BentonSans, weight 700
- Arrow icon (fill `#95ADCB` in SVG)
- `padding-right: 1.5rem`

### Home Banner Override
```css
#home #banner.bg-crimson:before { background: #990000; }
#home #banner.bg-crimson .button { ... }
```

---

## 11. Linked Stylesheets (from bloomington.iu.edu)

1. `https://fonts.iu.edu/style.css?family=BentonSans:regular,bold|BentonSansCond:regular,bold|GeorgiaPro:regular|BentonSansLight:regular`
2. `https://assets.iu.edu/web/fonts/icon-font.css`
3. `https://assets.iu.edu/web/3.3.x/css/iu-framework.min.css`
4. `https://assets.iu.edu/brand/3.3.x/brand.min.css`
5. `https://assets.iu.edu/search/3.3.x/search.min.css`
6. `/_assets/css/site.css`
7. `/_assets/css/home-2025-october.css`

---

## 12. Meta / Tile Color

- `msapplication-TileColor`: `#990000`

---

*Extracted from: bloomington.iu.edu, assets.iu.edu/brand, assets.iu.edu/web (IU Framework/Rivet), and IU Bloomington site-specific CSS. Generated: February 2025.*
