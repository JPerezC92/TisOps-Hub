<!-- markdownlint-disable -->
<!-- @ts-nocheck -->
# JPC Design System
**Official Design Pattern for TisOps Hub - Vibrant Style**

This document defines the complete design system used in File Imports (`/imports`). All future pages and components must follow these vibrant patterns.

**Last Updated**: January 2025
**Source**: `/imports` page (Vibrant Reference)
**Status**: Official Design System ✅

---

## 🎨 Current UI Color Palette - Vibrant Style

### Primary Colors (Base)
```css
/* Dark Mode Theme - Clean and Simple */
--background: oklch(0.08 0 0);                    /* Very dark background */
--foreground: oklch(0.98 0 0);                    /* Almost white text */
--card: oklch(0.12 0.02 264.53);                  /* Card backgrounds */
--muted-foreground: oklch(0.58 0.01 264.53);      /* Muted text */
--border: oklch(0.2 0.015 264.53);                /* Border color */
```

### Vibrant Accent Colors (Primary Usage)
```css
/* These are the MAIN vibrant colors - use them directly! */
.text-cyan-400        /* Cyan numbers, primary stats, icons */
.text-emerald-400     /* Success stats, green indicators */
.text-orange-400      /* Warning stats, error counts */
.text-purple-400      /* Secondary stats, special elements */
```

**Why Vibrant (400 level)?**
- `text-cyan-400`, `text-emerald-400`, `text-orange-400`, `text-purple-400` provide the best contrast and vibrancy on dark backgrounds
- These create the eye-catching, modern look you see in the File Imports page
- Numbers and icons "pop" with these vibrant shades

### Color Usage Rules (Vibrant Pattern)
- **Cyan-400**: Total counts, primary statistics, processing states, main icons
- **Emerald-400**: Success counts, completed states, positive indicators
- **Orange-400**: Failed counts, warning states, error indicators
- **Purple-400**: Special categories, secondary stats, REP01 tags
- **Foreground**: Main text content (headings, labels)
- **Muted-foreground**: Secondary text, descriptions, captions

### Background & Border Opacities
```css
/* Use lower opacities for backgrounds and borders */
.bg-cyan-500/5        /* Very subtle backgrounds */
.bg-cyan-500/10       /* Light backgrounds */
.bg-cyan-500/20       /* Medium backgrounds */
.border-cyan-500/20   /* Subtle borders */
.border-cyan-500/40   /* Medium borders (hover states) */
```

> **💡 Vibrant Style Key**: Always use `-400` variants for text and icons (vibrant!), and low opacity `/5`, `/10`, `/20` for backgrounds and borders (subtle).

> **💡 Note**: If a color from the [Old UI Colors](#old-ui-colors-request-relationships-page) section below can be reused in the current design pattern, feel free to use it and move it to this Current UI section.

---

## 📐 Layout Patterns

### Page Container
```tsx
<div className="min-h-screen bg-background">
  <Header />

  <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    {/* Page content */}
  </main>
</div>
```

**Rules:**
- Always use `max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8` for main content
- Use `bg-background` for page background (dark theme)
- Header component is separate and reusable

---

## 🎯 Component Patterns

### 1. Header (Sticky Navigation)
```tsx
<header className="sticky top-0 z-50 border-b border-cyan-500/20 bg-card/80 backdrop-blur-xl shadow-lg shadow-cyan-500/5">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
    <Link href="/" className="flex items-center gap-3 group no-underline">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/40 group-hover:shadow-cyan-500/60 transition-all duration-300">
        <span className="text-sm font-bold text-slate-950">T</span>
      </div>
      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-foreground group-hover:text-cyan-300 transition-colors duration-300">
          TisOps Hub
        </h1>
        <p className="text-xs text-muted-foreground/70">Error Categorization System</p>
      </div>
    </Link>
    <nav className="hidden md:flex items-center gap-8">
      <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-cyan-300 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-cyan-400 after:to-cyan-500 after:transition-all after:duration-300 hover:after:w-full no-underline">
        Home
      </Link>
    </nav>
  </div>
</header>
```

**Rules:**
- Always sticky with `sticky top-0 z-50`
- Backdrop blur with `backdrop-blur-xl`
- Cyan accent with low opacity borders: `border-cyan-500/20`
- Logo has gradient cyan background
- Hover effects with scale and shadow
- Navigation links have underline animation on hover

### 2. Page Title Section
```tsx
<div className="mb-12">
  <h1 className="text-4xl font-bold text-foreground">Error Categorization</h1>
  <p className="mt-3 text-base text-muted-foreground/90">Categorized Error Reports Management</p>
</div>
```

**Rules:**
- Title: `text-4xl font-bold text-foreground`
- Description: `text-base text-muted-foreground/90 mt-3`
- Spacing: `mb-12` after title section

### 3. Upload/Action Section Card (Vibrant Style)
```tsx
<div className="mb-12 rounded-xl border border-border/60 bg-card p-8 shadow-xl">
  <div className="mb-8">
    <h2 className="text-2xl font-bold text-foreground">Upload Error Categorization Report</h2>
    <p className="mt-2 text-sm text-muted-foreground/80">
      Upload an Excel file (REPORT PARA ETIQUETAR) to parse and categorize error reports
    </p>
  </div>

  {/* Status indicators with vibrant gradient backgrounds */}
  <div className="space-y-3 mb-8">
    <div className="flex items-center gap-4 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/15 to-cyan-600/5 p-4 hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 group backdrop-blur-sm">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
        <span className="text-sm font-bold text-cyan-400">✓</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">Current Data Source</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Data uploaded - 25 records</p>
      </div>
    </div>

    <div className="flex items-center gap-4 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-amber-600/5 p-4 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 group backdrop-blur-sm">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
        <span className="text-sm font-bold text-orange-400">!</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">UPSERT Mode</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Existing records will be updated, new ones will be created</p>
      </div>
    </div>
  </div>

  {/* File selection with vibrant accents */}
  <div className="space-y-4 mb-8">
    <label className="block text-sm font-semibold text-foreground">Select Excel File</label>
    <div className="flex gap-3">
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-lg text-cyan-400 font-medium transition-all duration-200">
          📁 Browse Files
        </div>
      </label>
      <div className="flex-1 flex items-center rounded-lg border-2 border-dashed border-cyan-500/20 bg-cyan-500/5 px-4 py-3 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-all duration-200">
        <p className="text-sm text-muted-foreground">No file selected</p>
      </div>
    </div>
  </div>

  {/* Primary action button */}
  <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white gap-2 h-12 font-semibold shadow-lg transition-all duration-200">
    📤 Upload and Parse →
  </Button>
</div>
```

**Vibrant Upload Section Rules:**
- Main card: Simple `bg-card border border-border/60 rounded-xl`
- Status indicators: Gradient backgrounds `bg-gradient-to-r from-cyan-500/15 to-cyan-600/5`
- Info banner-style borders: `border-cyan-500/40` (cyan) or `border-amber-500/40` (orange)
- Vibrant icons: `text-cyan-400`, `text-orange-400` (NOT cyan-200 or amber-200!)
- Text: `text-foreground` for labels, `text-muted-foreground/70` for descriptions
- Browse button: Vibrant cyan with `bg-cyan-500/10 text-cyan-400`
- Primary button: Solid `bg-cyan-500` (no gradient!)
- Keep emoji for visual clarity (✓, !, 📁, 📤, etc.)

### 4. Statistics Grid (Vibrant Style)
```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
  {/* Cyan stat */}
  <div className="bg-card border border-border/60 rounded-xl p-6 shadow-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Total Imports</p>
        <p className="text-4xl font-bold text-cyan-400">3</p>
      </div>
      <svg className="h-10 w-10 text-cyan-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  </div>

  {/* Emerald stat */}
  <div className="bg-card border border-border/60 rounded-xl p-6 shadow-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Successful</p>
        <p className="text-4xl font-bold text-emerald-400">3</p>
      </div>
      <svg className="h-10 w-10 text-emerald-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  </div>

  {/* Orange stat */}
  <div className="bg-card border border-border/60 rounded-xl p-6 shadow-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Failed</p>
        <p className="text-4xl font-bold text-orange-400">0</p>
      </div>
      <svg className="h-10 w-10 text-orange-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  </div>
</div>
```

**Vibrant Stats Rules:**
- Clean card backgrounds: `bg-card border border-border/60 rounded-xl`
- NO gradients in card backgrounds - keep it simple!
- Vibrant numbers: `text-4xl font-bold text-cyan-400` (or emerald-400, orange-400, purple-400)
- Icons with 50% opacity: `text-cyan-400/50`
- Labels: `text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider`
- Simple shadow: `shadow-xl` (no colored shadows)
- Layout: Two-column flex with number on left, icon on right

### 5. Info Banners
```tsx
<div className="mb-12 space-y-4">
  {/* Info Banner (Blue) */}
  <div className="flex gap-4 rounded-xl border border-blue-500/40 bg-gradient-to-r from-blue-500/15 to-blue-600/5 p-6 hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group backdrop-blur-sm">
    <div className="text-2xl flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300">ℹ️</div>
    <div className="min-w-0 flex-1">
      <h4 className="text-sm font-bold text-blue-100 group-hover:text-blue-50 transition-colors duration-300">
        Column Types Legend
      </h4>
      <p className="mt-2 text-xs text-blue-100/70 leading-relaxed">
        <span className="font-semibold text-blue-100">Stored Columns:</span> Data saved directly in the database.
        Fast to retrieve, always available.
      </p>
    </div>
  </div>

  {/* Warning Banner (Amber) */}
  <div className="flex gap-4 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-amber-600/5 p-6 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 group backdrop-blur-sm">
    <div className="text-2xl flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300">⚠️</div>
    <div className="min-w-0 flex-1">
      <h4 className="text-sm font-bold text-amber-100 group-hover:text-amber-50 transition-colors duration-300">
        About the 'Missing ID' Column
      </h4>
      <p className="mt-2 text-xs text-amber-100/70 leading-relaxed">
        The "Missing ID" column shows Request ID that exists...
      </p>
    </div>
  </div>
</div>
```

**Rules:**
- Use `rounded-xl` (not rounded-2xl)
- Emoji scales on hover: `group-hover:scale-110`
- Color-coded by type (blue=info, amber=warning)
- Backdrop blur: `backdrop-blur-sm`
- Text colors match banner color scheme

### 6. Data Tables
```tsx
<div className="rounded-2xl border border-cyan-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-cyan-500/10 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300">
  {/* Table Header */}
  <div className="px-6 py-6 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-purple-500/5">
    <h3 className="text-sm font-bold text-foreground">
      Error Classification Records
      <span className="ml-3 text-xs font-normal text-muted-foreground/70">
        Showing {count} total records
      </span>
    </h3>
  </div>

  {/* Table */}
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-cyan-500/10 hover:bg-transparent">
          <th className="h-12 text-xs font-bold text-cyan-100 bg-cyan-500/5 uppercase tracking-wider text-left py-4 px-2">
            #
          </th>
          <th className="h-12 text-xs font-bold text-cyan-100 bg-cyan-500/5 uppercase tracking-wider text-left py-4 px-2">
            CATEGORY
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-cyan-500/10 hover:bg-cyan-500/10 transition-all duration-300 group">
          <td className="py-4 px-2 text-center text-cyan-100/70 font-mono text-xs font-medium">1</td>
          <td className="py-4 px-2">
            <Badge variant="outline" className="bg-cyan-500/20 text-cyan-100 border-cyan-500/40">
              Category
            </Badge>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

**Rules:**
- Container: `rounded-2xl border-cyan-500/20 bg-card/60`
- Header: Gradient `from-cyan-500/10 to-purple-500/5`
- Column headers: `text-cyan-100 bg-cyan-500/5 uppercase tracking-wider`
- Row hover: `hover:bg-cyan-500/10`
- Text colors: `text-cyan-100/70` for cells
- Borders: `border-cyan-500/10` between rows
- Group hover effects for badges and interactive elements

### 7. Badges

#### Category Badges (Colored by Type)
```tsx
// Error de Alcance (Cyan)
<Badge
  variant="outline"
  className="bg-cyan-500/20 text-cyan-100 border-cyan-500/40 hover:bg-cyan-500/30 border font-medium transition-all duration-300"
>
  Error de Alcance
</Badge>

// Error de codificación (Bug) (Orange)
<Badge
  variant="outline"
  className="bg-orange-500/20 text-orange-100 border-orange-500/40 hover:bg-orange-500/30 border font-medium transition-all duration-300"
>
  Error de codificación (Bug)
</Badge>

// Error de datos (Data Source) (Emerald)
<Badge
  variant="outline"
  className="bg-emerald-500/20 text-emerald-100 border-emerald-500/40 hover:bg-emerald-500/30 border font-medium transition-all duration-300"
>
  Error de datos (Data Source)
</Badge>
```

#### Request ID Badges (with Links)
```tsx
{/* With link - icon inside badge */}
<a href={link} target="_blank" rel="noopener noreferrer" className="no-underline">
  <Badge
    variant="secondary"
    className="font-mono text-xs bg-cyan-500/15 text-cyan-100 border border-cyan-500/30 group-hover:bg-cyan-500/25 transition-all duration-300 inline-flex items-center gap-1"
  >
    134979
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  </Badge>
</a>

{/* Without link */}
<Badge
  variant="secondary"
  className="font-mono text-xs bg-cyan-500/15 text-cyan-100 border border-cyan-500/30 group-hover:bg-cyan-500/25 transition-all duration-300"
>
  134979
</Badge>
```

#### Interactive Badges (Clickable)
```tsx
// Additional Info badges
<Badge
  variant="outline"
  onClick={handleClick}
  className="bg-cyan-500/20 text-cyan-100 border-cyan-500/40 hover:bg-cyan-500/30 font-medium transition-all duration-300 cursor-pointer"
>
  Additional Info
</Badge>

// Tag Categorization badges
<Badge
  variant="outline"
  onClick={handleClick}
  className="bg-purple-500/20 text-purple-100 border-purple-500/40 hover:bg-purple-500/30 font-medium transition-all duration-300 cursor-pointer"
>
  Tag Categorization
</Badge>

// Missing IDs badges
<Badge
  variant="outline"
  onClick={handleClick}
  className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-100 border-orange-500/40 hover:bg-orange-500/30 font-medium transition-all duration-300 cursor-pointer"
>
  <span>⚠️</span>
  <span>Check Missing IDs</span>
</Badge>
```

**Badge Rules:**
- All use `variant="outline"` for consistent styling
- Background: 15-20% opacity of accent color
- Border: 30-40% opacity of accent color
- Hover: Increase background opacity by 10%
- Text: 100% color intensity (cyan-100, orange-100, purple-100, emerald-100)
- Icons inside badge: `w-3 h-3` with same color as text
- External link icons must be INSIDE the badge, not outside
- Font: `font-medium` for labels, `font-mono` for IDs
- Transitions: `transition-all duration-300`
- Clickable badges: Add `cursor-pointer`

### 8. Buttons (Vibrant Style)

#### Primary Button (Solid Cyan)
```tsx
<Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white gap-2 h-12 font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
  📤 Upload and Parse →
</Button>
```

#### Secondary/Browse Button (Vibrant Cyan Accent)
```tsx
<div className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-lg text-cyan-400 font-medium transition-all duration-200">
  📁 Browse Files
</div>
```

**Vibrant Button Rules:**
- Primary: Solid `bg-cyan-500` (NOT gradient!), white text
- Secondary: Vibrant accent with `bg-cyan-500/10 text-cyan-400`
- All buttons: Add emoji icons for visual clarity
- NO scale effects - keep simple
- Simple shadow: `shadow-lg` (no colored shadows)
- Transitions: `transition-all duration-200`
- Disabled state: `disabled:opacity-50 disabled:cursor-not-allowed`

### 9. Form Inputs (Vibrant Focus States)
```tsx
{/* Search Input */}
<input
  type="text"
  className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
/>

{/* Select Dropdown */}
<select
  className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
>
  <option>All Modules</option>
</select>
```

**Form Input Rules:**
- Background: `bg-background` (not bg-card)
- Border: `border border-border/60`
- Vibrant focus ring: `focus:ring-2 focus:ring-cyan-500/50`
- Vibrant focus border: `focus:border-cyan-500/50`
- Text: `text-foreground` with `placeholder-muted-foreground/60`
- Border radius: `rounded-lg`

---

## 🎭 Typography Scale

### Headings
```tsx
// Page Title (H1)
<h1 className="text-4xl font-bold text-foreground">

// Section Title (H2)
<h2 className="text-2xl font-bold text-foreground">

// Card/Table Title (H3)
<h3 className="text-sm font-bold text-foreground">

// Stat Card Label (Small Caps)
<h3 className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest">
```

### Body Text
```tsx
// Primary text
<p className="text-base text-foreground">

// Secondary text (descriptions)
<p className="text-sm text-muted-foreground/90">

// Tertiary text (labels, captions)
<p className="text-xs text-muted-foreground/70">

// Table cell text
<td className="text-xs text-cyan-100/70">

// Emphasized text in colored sections
<p className="text-sm text-cyan-100">
```

### Accent Text
```tsx
// Cyan highlight
<span className="text-cyan-100">

// Purple highlight
<span className="text-purple-100">

// Orange highlight
<span className="text-orange-100">

// Emerald highlight
<span className="text-emerald-100">
```

**Typography Rules:**
- Default text: `text-foreground` or `text-muted-foreground`
- Headings: Always `font-bold`
- Accent colors: Only for emphasis, numbers, or category-specific text
- Use opacity variants (`/70`, `/80`, `/90`) for text hierarchy
- Colored section text uses matching color (cyan sections use cyan-100 text)

---

## 🎬 Animation & Transitions

### Standard Transitions
```tsx
className="transition-all duration-300"        // Default for most elements
className="transition-colors duration-300"     // For color-only changes
className="transition-transform duration-300"  // For scale/transform only
```

### Hover Effects
```tsx
// Scale effects
hover:scale-105   // Cards, buttons
hover:scale-110   // Icons, emoji

// Opacity changes
hover:bg-cyan-500/30        // Increase background opacity
hover:text-cyan-100         // Brighten text
hover:border-cyan-500/50    // Brighten border

// Shadows
hover:shadow-xl hover:shadow-cyan-500/20  // Enhance glow
hover:shadow-cyan-500/60                   // Brighten existing shadow
```

### Group Hover Effects
```tsx
<div className="group">
  <div className="group-hover:bg-cyan-500/40 transition-colors" />
  <p className="group-hover:text-cyan-100 transition-colors" />
  <div className="group-hover:scale-110 transition-transform" />
</div>
```

### Active States
```tsx
active:scale-95   // Buttons pressed state
```

---

## 📦 Spacing Standards

### Container Spacing
```tsx
p-8         // Action cards, upload sections
p-6         // Data cards, stat cards, banners
p-4         // Status indicators, small containers
px-3 py-1   // Badges
px-4 py-4   // Form inputs
```

### Margins
```tsx
mb-12       // Between major sections
mb-8        // Between related sections (inside cards)
mb-4        // Between smaller elements
mb-3        // Between inline elements (status indicators)
mt-2        // Between label and small description
mt-3        // Between page title and description
mt-4        // Between content and large numbers
```

### Grid Gaps
```tsx
gap-4       // Statistics cards grid, major grids
gap-3       // Status indicators, form elements
gap-2       // Inline badges, small element groups
gap-1       // Badge icon + text
```

---

## 🎨 Effects & Shadows

### Box Shadows
```tsx
// Standard shadow
shadow-lg

// Glowing effect (cards, sections)
shadow-xl shadow-cyan-500/10       // Default state
shadow-2xl shadow-cyan-500/10      // Tables, major sections

// Enhanced hover glow
hover:shadow-xl hover:shadow-cyan-500/20
hover:shadow-cyan-500/60
```

### Backdrop Effects
```tsx
backdrop-blur-xl    // Header (strong blur)
backdrop-blur-sm    // Cards, banners (subtle blur)
```

### Border Radius
```tsx
rounded-2xl     // Cards, tables, major sections
rounded-xl      // Info banners, status indicators, inner containers
rounded-lg      // Buttons, inputs, icon containers
rounded-full    // Badges, decorative circles
```

---

## ✅ Design Checklist

When creating new components, ensure:
- [ ] Background uses `bg-background` for pages, `bg-card` for components
- [ ] Text uses `text-foreground` or `text-muted-foreground` with opacity variants
- [ ] Accent colors: cyan (primary), orange (bugs), purple (specific categories), emerald (data/success)
- [ ] Cards use `rounded-2xl` with cyan borders (`border-cyan-500/20` to `border-cyan-500/50`)
- [ ] Gradients use `from-cyan-500/10 via-card to-purple-500/5` pattern
- [ ] Badges use `rounded-full` with 15-20% background opacity
- [ ] All badges have color-matched text (cyan-100, orange-100, purple-100, emerald-100)
- [ ] External link icons are INSIDE badges, not outside
- [ ] Buttons have gradient backgrounds and scale effects (`hover:scale-105 active:scale-95`)
- [ ] Emoji icons included where appropriate (✓, !, 📁, 📤, ⚠️, 🔄, ℹ️, →)
- [ ] Hover states enhance colors/shadows by 10-20%
- [ ] Transitions are smooth (`transition-all duration-300`)
- [ ] Spacing follows standard patterns (p-8, p-6, mb-12, gap-4, etc.)
- [ ] Tables have cyan-themed headers with gradients
- [ ] All interactive elements have hover/active states
- [ ] Group hover effects used for related elements

---

## 🚫 Deprecated Patterns (DO NOT USE)

### ❌ Avoid These:
```tsx
// Wrong - Hardcoded colors
className="bg-[#32E6C7]"

// Wrong - No opacity on backgrounds
className="bg-cyan-500"  // Use bg-cyan-500/20 instead

// Wrong - Wrong border radius
className="rounded-md"  // Use rounded-xl or rounded-2xl

// Wrong - No transitions
<button> without transition classes

// Wrong - Icon outside badge
<Badge>134979</Badge> <svg />  // Icon should be INSIDE

// Wrong - Inconsistent text colors in badges
className="text-white"  // Use text-cyan-100, text-purple-100, etc.

// Wrong - Old border styles
className="border"  // Use border border-cyan-500/30

// Wrong - No hover effects
<div className="cursor-pointer">  // Add hover effects
```

### ✅ Use These Instead:
```tsx
// Correct
className="bg-cyan-500/20"
className="border border-cyan-500/30"
className="rounded-2xl"
className="transition-all duration-300"
<Badge className="inline-flex items-center gap-1">
  134979
  <svg className="w-3 h-3" />
</Badge>
className="text-cyan-100"
className="hover:bg-cyan-500/30"
```

---

## 🔄 Migration from Old UI

To convert existing pages from the old design system:

1. **Update colors**: Replace hardcoded JPC colors with OKLCH-based colors
2. **Update border radius**: Use `rounded-2xl` for cards, `rounded-xl` for banners
3. **Add gradients**: Use `bg-gradient-to-r` or `bg-gradient-to-br` for cards
4. **Update badges**: Use Badge component with color-matched text (not gold)
5. **Move icons inside badges**: External link icons must be inside badges
6. **Add emoji**: Include emoji icons for visual enhancement
7. **Update shadows**: Use `shadow-xl shadow-cyan-500/10` for glow effects
8. **Add transitions**: `transition-all duration-300` to all interactive elements
9. **Update tables**: Use cyan-themed table styling with gradients
10. **Add scale effects**: `hover:scale-105` for cards and buttons

---

## 📝 Old UI Colors (Request Relationships Page)

> **💡 Note**: The following colors were used in the previous design system (Request Relationships page). If any of these colors fit well with the current Error Categorization design pattern, feel free to use them in the new UI and move them to the [Current UI Color Palette](#current-ui-color-palette) section above.

### Old Primary Colors
```css
--color-jpc-400: #32E6C7        /* Primary Cyan/Teal - Main accent */
--color-jpc-purple-500: #A43FD9 /* Primary Purple - Badges, cards */
--color-jpc-orange-500: #E54302 /* Primary Orange - Warnings, alerts */
--color-jpc-gold-500: #E9D8A5  /* Primary Gold - Text, labels */
```

### Old Background Colors
```css
--color-jpc-bg-900: #000813     /* Very dark blue - Main background */
--color-jpc-bg-500: #001a2e     /* Mid-dark blue - Gradient accent */
--color-jpc-900: #007260        /* Dark teal - Overlays */
--color-jpc-purple-900: #2F0B43 /* Dark purple - Table headers */
```

### Old Color Usage Rules
- **Cyan (`jpc-400`)**: Primary actions, highlights, statistics
- **Purple (`jpc-purple-500`)**: Badges, cards, secondary elements
- **Orange (`jpc-orange-500`)**: Warnings, alerts, tertiary actions
- **Gold (`jpc-gold-500`)**: All text content, labels, descriptions
- **Dark Blue (`jpc-bg-900`)**: Main page background
- **Dark Purple (`jpc-purple-900`)**: Section headers, table headers

### Old Badge Patterns
```tsx
// Old purple badge with gold text
<a className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-jpc-purple-500/50 text-jpc-gold-500 hover:bg-jpc-purple-500/70 transition-all duration-200 no-underline border border-jpc-purple-500/50">
  {id}
  <svg className="w-3 h-3 text-jpc-gold-500" />
</a>

// Old cyan badge with gold text
<a className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-jpc-400/30 text-jpc-gold-500 hover:bg-jpc-400/50 transition-all duration-200 no-underline border border-jpc-400/50">
  {id}
  <svg className="w-3 h-3 text-jpc-gold-500" />
</a>
```

### Key Differences from Current UI
| Aspect | Old UI (Request Relationships) | Current UI (Error Categorization) |
|--------|-------------------------------|-----------------------------------|
| **Text Color** | Gold (`#E9D8A5`) for all text | `foreground` / `muted-foreground` with OKLCH |
| **Badge Text** | Gold text in all badges | Color-matched text (cyan-100, orange-100, etc.) |
| **Table Headers** | Dark purple (`jpc-purple-900`) | Cyan-themed with gradient |
| **Backgrounds** | Solid dark blue | Card backgrounds with gradients |
| **Border Radius** | `rounded-xl` | `rounded-2xl` for major elements |
| **Link Icons** | Sometimes outside badges | Always INSIDE badges |
| **Emoji** | Not used | Heavily used for visual clarity |
| **Hover Effects** | Opacity only | Scale + opacity + shadow |

---

## 📚 Example Reference

Complete vibrant style implementation can be found in:
- **Primary Reference**: `apps/web/app/imports/page.tsx` - The VIBRANT standard!
- **Secondary Pages**:
  - `apps/web/app/rep01-tags/page.tsx`
  - `apps/web/app/error-categorization/page.tsx`
  - `apps/web/app/error-logs/page.tsx`
  - `apps/web/app/tasks/page.tsx`
- **Components**:
  - `apps/web/components/stats-grid.tsx`
  - `apps/web/components/upload-section-dynamic.tsx`
  - `apps/web/components/info-banners.tsx`
  - `apps/web/components/header.tsx`

**Old UI Reference**: `apps/web/app/request-relationships/page.tsx`

---

**Remember**: The File Imports page (`http://localhost:3001/imports`) is the PRIMARY source of truth for the vibrant design system. Use vibrant `-400` colors for text/icons, clean `bg-card` backgrounds, and subtle gradient accents for info banners!
