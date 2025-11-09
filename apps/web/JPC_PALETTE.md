# JPC Color Palette

Custom color palette for TisOps Hub design system - Vibrant Style.

**Last Updated**: January 2025
**Status**: Official Color Palette ✅
**Primary Reference**: File Imports page (`http://localhost:3001/imports`)

---

## 🎨 Current Color System (Vibrant Style)

The vibrant design uses **clean, simple colors** with vibrant `-400` variants for maximum impact on dark backgrounds.

### Base Colors (Dark Theme)
```css
/* Background Colors */
--background: oklch(0.08 0 0)                    /* Very dark background */
--card: oklch(0.12 0.02 264.53)                  /* Card backgrounds */
--muted: oklch(0.18 0.015 264.53)                /* Muted backgrounds */

/* Text Colors */
--foreground: oklch(0.98 0 0)                    /* Almost white text */
--card-foreground: oklch(0.98 0 0)               /* Card text */
--muted-foreground: oklch(0.58 0.01 264.53)      /* Muted text */
```

**Usage:**
```tsx
className="bg-background"              // Page background
className="bg-card"                    // Card background
className="bg-muted"                   // Muted sections
className="text-foreground"            // Primary text
className="text-muted-foreground"      // Secondary text
className="text-muted-foreground/70"   // Tertiary text (70% opacity)
```

### Vibrant Accent Colors (The Heart of the Design!)
```css
/* PRIMARY VIBRANT COLORS - Use these for text and icons! */
.text-cyan-400        /* Cyan stats, primary numbers, main icons */
.text-emerald-400     /* Success stats, positive indicators */
.text-orange-400      /* Warning stats, error counts */
.text-purple-400      /* Special stats, REP01 tags */
```

**Why -400 Variants?**
- Maximum vibrancy and contrast on dark backgrounds
- Numbers and icons "pop" and catch the eye
- This is what makes the File Imports page look vibrant!

### Background & Border Colors
```css
/* Low opacity for subtle effects */
.bg-cyan-500/5        /* Very subtle backgrounds */
.bg-cyan-500/10       /* Light backgrounds in buttons/cards */
.bg-cyan-500/20       /* Medium backgrounds */
.border-cyan-500/20   /* Subtle borders */
.border-cyan-500/40   /* Medium borders (info banners) */
.border-cyan-500/50   /* Focus states */
```

**Vibrant Usage Examples:**
```css
/* Stats Cards - Vibrant numbers! */
.text-4xl.font-bold.text-cyan-400        /* Primary stat number */
.text-4xl.font-bold.text-emerald-400     /* Success stat number */
.text-4xl.font-bold.text-orange-400      /* Error stat number */

/* Icons with 50% opacity */
.h-10.w-10.text-cyan-400/50              /* Icon next to stat */

/* Buttons with vibrant accents */
.bg-cyan-500/10.text-cyan-400            /* Browse button */
.bg-cyan-500                              /* Primary button (solid!) */

/* Info Banners with gradients */
.bg-gradient-to-r.from-cyan-500/15.to-cyan-600/5
.border-cyan-500/40

/* Form inputs with vibrant focus */
.focus:ring-cyan-500/50.focus:border-cyan-500/50
```

### Color Intensity Levels

The color system uses different opacity levels for backgrounds and borders:

```tsx
// Backgrounds (semi-transparent)
bg-cyan-500/5        // Very subtle (5%)
bg-cyan-500/10       // Subtle (10%)
bg-cyan-500/15       // Light (15%)
bg-cyan-500/20       // Medium (20%)
bg-cyan-500/30       // Strong (30%)

// Borders (semi-transparent)
border-cyan-500/20   // Subtle border
border-cyan-500/30   // Medium border
border-cyan-500/40   // Strong border
border-cyan-500/50   // Very strong border

// Text (full intensity with variants)
text-cyan-100        // Full brightness
text-cyan-100/70     // 70% opacity
text-cyan-100/60     // 60% opacity
text-cyan-200        // Slightly dimmer variant
```

### Gradient Patterns

Common gradient combinations used in the current design:

```tsx
// Card gradients
className="bg-gradient-to-br from-cyan-500/10 via-card to-purple-500/5"

// Status indicator gradients
className="bg-gradient-to-r from-cyan-500/15 to-cyan-600/5"
className="bg-gradient-to-r from-amber-500/15 to-amber-600/5"

// Table header gradients
className="bg-gradient-to-r from-cyan-500/10 to-purple-500/5"

// Button gradients
className="bg-gradient-to-r from-cyan-500 to-cyan-600"
className="hover:from-cyan-600 hover:to-cyan-700"
```

---

## 🎯 Color Usage by Component Type

### Category Badges
```tsx
// Error de Alcance (Cyan)
className="bg-cyan-500/20 text-cyan-100 border-cyan-500/40"

// Error de codificación (Bug) (Orange)
className="bg-orange-500/20 text-orange-100 border-orange-500/40"

// Error de datos (Data Source) (Emerald)
className="bg-emerald-500/20 text-emerald-100 border-emerald-500/40"
```

### Request ID Badges
```tsx
className="bg-cyan-500/15 text-cyan-100 border-cyan-500/30"
className="group-hover:bg-cyan-500/25"  // Hover state
```

### Interactive Badges
```tsx
// Additional Info
className="bg-cyan-500/20 text-cyan-100 border-cyan-500/40 hover:bg-cyan-500/30"

// Tag Categorization
className="bg-purple-500/20 text-purple-100 border-purple-500/40 hover:bg-purple-500/30"

// Missing IDs
className="bg-orange-500/20 text-orange-100 border-orange-500/40 hover:bg-orange-500/30"
```

### Buttons
```tsx
// Primary Button
className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white"
className="hover:from-cyan-600 hover:to-cyan-700"

// Secondary/Outline Button
className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
```

### Info Banners
```tsx
// Info Banner (Blue)
className="bg-gradient-to-r from-blue-500/15 to-blue-600/5 border-blue-500/40"
className="text-blue-100"

// Warning Banner (Amber)
className="bg-gradient-to-r from-amber-500/15 to-amber-600/5 border-amber-500/40"
className="text-amber-100"
```

### Tables
```tsx
// Container
className="border-cyan-500/20 bg-card/60 shadow-cyan-500/10"

// Header
className="bg-gradient-to-r from-cyan-500/10 to-purple-500/5 border-cyan-500/20"

// Column Headers
className="text-cyan-100 bg-cyan-500/5"

// Rows
className="border-cyan-500/10 hover:bg-cyan-500/10"

// Cells
className="text-cyan-100/70"
```

---

## 💡 Color Mixing Rules

When combining colors in the current system:

1. **Primary color**: Cyan is the dominant accent
2. **Secondary colors**: Orange, Purple, Emerald for specific categories
3. **Background opacity**: 5-20% for subtle effects
4. **Border opacity**: 20-50% for visibility
5. **Text**: Use 100% color variants (cyan-100, orange-100, etc.)
6. **Hover states**: Increase opacity by 10%

**Example Card:**
```tsx
<div className="
  bg-gradient-to-br from-cyan-500/10 via-card to-purple-500/5
  border border-cyan-500/30
  hover:border-cyan-500/50
  shadow-xl shadow-cyan-500/10
  hover:shadow-cyan-500/20
">
  <p className="text-foreground">Title</p>
  <p className="text-muted-foreground/90">Description</p>
</div>
```

---

## 📝 Old UI Colors (Request Relationships Page)

> **💡 Note**: The following colors were used in the previous design system. If any of these colors fit well with the current design pattern, feel free to use them and move them to the [Current Color System](#current-color-system-error-categorization) section above.

### 1. jpc (Cyan/Teal) - Primary Accent
```tsx
// Old usage:
className="bg-jpc-400 text-white"           // Primary button
className="text-jpc-400"                     // Accent text
className="border-jpc-400"                   // Borders
className="bg-jpc-400/20"                    // Semi-transparent background
```

**Color Reference:**
- `jpc-400`: **#32E6C7** - Primary cyan/teal
- `jpc-900`: **#007260** - Dark teal

### 2. jpc Purple - Badges & Cards
```tsx
// Old usage:
className="bg-jpc-purple-500 text-white"    // Purple badge
className="bg-jpc-purple-900"                // Dark purple header
className="bg-jpc-purple-500/50"             // Semi-transparent badge
```

**Color Reference:**
- `jpc-purple-500`: **#A43FD9** - Primary purple
- `jpc-purple-900`: **#2F0B43** - Dark purple (table headers)

### 3. jpc Orange - Warnings & Secondary
```tsx
// Old usage:
className="bg-jpc-orange-500 text-white"    // Orange button
className="text-jpc-orange-500"              // Warning text
className="bg-jpc-orange-500/30"             // Semi-transparent badge
```

**Color Reference:**
- `jpc-orange-500`: **#E54302** - Primary orange/red

### 4. jpc Background - Dark Theme
```tsx
// Old usage:
className="bg-jpc-bg-900"                    // Very dark background
className="bg-jpc-bg-500"                    // Mid-dark background
className="from-jpc-bg-900 to-jpc-bg-500"   // Gradient
```

**Color Reference:**
- `jpc-bg-900`: **#000813** - Very dark blue background
- `jpc-bg-500`: **#001a2e** - Mid-dark background

### 5. jpc Gold - Text & Accents
```tsx
// Old usage:
className="text-jpc-gold-500"                // Gold text (ALL text in old UI)
className="bg-jpc-gold-500/10"               // Subtle gold tint
```

**Color Reference:**
- `jpc-gold-500`: **#E9D8A5** - Primary gold/sepia

### Old Color Matrix

| Color Name | Hex Value | Old Use Case | Current Equivalent |
|------------|-----------|--------------|-------------------|
| `jpc-400` | #32E6C7 | Primary buttons, links | `cyan-500` |
| `jpc-purple-500` | #A43FD9 | Badges, cards | `purple-500` |
| `jpc-purple-900` | #2F0B43 | Table headers, dark sections | No longer used (now cyan-themed) |
| `jpc-orange-500` | #E54302 | Warnings, secondary actions | `orange-500` |
| `jpc-bg-900` | #000813 | Main dark background | `background` |
| `jpc-bg-500` | #001a2e | Secondary dark background | `card` |
| `jpc-gold-500` | #E9D8A5 | All text content | `foreground` / `muted-foreground` |

### Old Example: JPC-Style Card
```tsx
<div className="
  bg-gradient-to-br
  from-jpc-bg-900
  via-jpc-bg-500
  to-jpc-bg-900
  rounded-xl
  border
  border-jpc-400/20
  p-6
  backdrop-blur-md
  shadow-[0_0_30px_rgba(50,230,199,0.15)]
">
  <h2 className="text-jpc-400 text-2xl font-bold mb-4">
    jpc Card
  </h2>

  <div className="flex gap-2">
    <span className="
      bg-jpc-purple-500/50
      text-jpc-gold-500
      px-3 py-1
      rounded-full
      border
      border-jpc-purple-500/50
    ">
      Badge 1
    </span>

    <span className="
      bg-jpc-orange-500/30
      text-jpc-gold-500
      px-3 py-1
      rounded-full
      border
      border-jpc-orange-500/50
    ">
      Badge 2
    </span>
  </div>

  <button className="
    mt-4
    bg-jpc-400
    hover:bg-jpc-500
    text-white
    px-6 py-2
    rounded-lg
    transition-colors
  ">
    Action Button
  </button>
</div>
```

---

## 🔄 Converting Old to New Colors

### Before (Old UI - Request Relationships):
```tsx
<div className="bg-jpc-400/10 border border-jpc-400/50">
  <span className="text-jpc-gold-500">Text</span>
  <a className="bg-jpc-purple-500/50 text-jpc-gold-500 border-jpc-purple-500/50">
    Badge
  </a>
</div>
```

### After (Current UI - Error Categorization):
```tsx
<div className="bg-cyan-500/10 border border-cyan-500/30">
  <span className="text-foreground">Text</span>
  <Badge className="bg-purple-500/20 text-purple-100 border-purple-500/40">
    Badge
  </Badge>
</div>
```

### Key Migration Changes

| Aspect | Old UI | Current UI |
|--------|--------|------------|
| **All Text** | Gold (`jpc-gold-500`) | `foreground` / `muted-foreground` (OKLCH) |
| **Badge Text** | Gold | Color-matched (cyan-100, orange-100, etc.) |
| **Table Headers** | Dark purple (`jpc-purple-900`) | Cyan gradient |
| **Backgrounds** | `jpc-bg-900`, `jpc-bg-500` | `background`, `card` (OKLCH) |
| **Border Radius** | `rounded-xl` | `rounded-2xl` |
| **Color System** | Hardcoded hex | OKLCH with Tailwind classes |

---

## 📚 Reference

- **Primary Vibrant Reference**: `apps/web/app/imports/page.tsx` - THE standard!
- **Secondary References**:
  - `apps/web/app/rep01-tags/page.tsx`
  - `apps/web/app/error-categorization/page.tsx`
  - `apps/web/app/tasks/page.tsx`
- **Old Implementation**: `apps/web/app/request-relationships/page.tsx`
- **Design System**: See [JPC_DESIGN_SYSTEM.md](./JPC_DESIGN_SYSTEM.md)
- **Global Styles**: `apps/web/app/globals.css`

---

**Vibrant Style Key Principles**:
1. ✅ Use `-400` variants for ALL text and icons (cyan-400, emerald-400, orange-400, purple-400)
2. ✅ Use low opacity `/5`, `/10`, `/20` for backgrounds and borders
3. ✅ Clean `bg-card` backgrounds (NO complex gradients in cards!)
4. ✅ Info banners get subtle gradients: `bg-gradient-to-r from-cyan-500/15 to-cyan-600/5`
5. ✅ Solid `bg-cyan-500` buttons (NO gradients!)
6. ✅ Vibrant focus states: `focus:ring-cyan-500/50 focus:border-cyan-500/50`

**Remember**: The File Imports page (`http://localhost:3001/imports`) is your vibrant design bible!
