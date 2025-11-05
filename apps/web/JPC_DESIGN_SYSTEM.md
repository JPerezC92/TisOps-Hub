<!-- markdownlint-disable -->
<!-- @ts-nocheck -->
# JPC Design System
**Official Design Pattern for TisOps Hub**

This document defines the complete design system used in `/request-relationships`. All future pages and components must follow these patterns.

---

## 🎨 Color Palette

### Primary Colors
```css
--color-jpc-400: #32E6C7        /* Primary Cyan/Teal - Main accent */
--color-jpc-purple-500: #A43FD9 /* Primary Purple - Badges, cards */
--color-jpc-orange-500: #E54302 /* Primary Orange - Warnings, alerts */
--color-jpc-gold-500: #E9D8A5  /* Primary Gold - Text, labels */
```

### Background Colors
```css
--color-jpc-bg-900: #000813     /* Very dark blue - Main background */
--color-jpc-bg-500: #001a2e     /* Mid-dark blue - Gradient accent */
--color-jpc-900: #007260        /* Dark teal - Overlays */
--color-jpc-purple-900: #2F0B43 /* Dark purple - Table headers */
```

### Color Usage Rules
- **Cyan (`jpc-400`)**: Primary actions, highlights, statistics
- **Purple (`jpc-purple-500`)**: Badges, cards, secondary elements
- **Orange (`jpc-orange-500`)**: Warnings, alerts, tertiary actions
- **Gold (`jpc-gold-500`)**: All text content, labels, descriptions
- **Dark Blue (`jpc-bg-900`)**: Main page background
- **Dark Purple (`jpc-purple-900`)**: Section headers, table headers

---

## 📐 Layout Patterns

### Page Container
```tsx
<div className="min-h-screen bg-jpc-bg-900 relative overflow-hidden">
  {/* Background layers */}
  <div className="fixed inset-0 bg-linear-to-br from-jpc-bg-900 via-jpc-bg-500 to-jpc-bg-900 -z-10"></div>
  <div className="fixed inset-0 backdrop-blur-sm bg-jpc-900/10 -z-10"></div>
  
  {/* Content */}
  <main className="max-w-7xl mx-auto px-6 py-8">
    {/* Page content */}
  </main>
</div>
```

**Rules:**
- Always use `max-w-7xl mx-auto px-6 py-8` for main content
- Always include gradient background with blur overlay
- Dark blue base with teal gradient accents

---

## 🎯 Component Patterns

### 1. Page Header (Sticky)
```tsx
<header className="bg-jpc-900/20 backdrop-blur-2xl border-b border-jpc-400/30 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-6 py-4">
    <h1 className="text-3xl font-bold text-jpc-gold-500">PAGE TITLE</h1>
    <p className="text-jpc-400 mt-1">Subtitle or description</p>
  </div>
</header>
```

**Rules:**
- Title: `text-3xl font-bold text-jpc-gold-500`
- Subtitle: `text-jpc-400 mt-1`
- Always sticky with backdrop blur
- Dark teal background with cyan border

### 2. Section Card
```tsx
<div className="bg-jpc-400/10 border border-jpc-400/50 rounded-xl shadow-[0_0_9px_2px] shadow-jpc-400/30 mb-8 overflow-hidden">
  <div className="p-6">
    {/* Content */}
  </div>
</div>
```

**Variants:**
- **Cyan accent**: `bg-jpc-400/10 border-jpc-400/50 shadow-jpc-400/30`
- **Purple accent**: `bg-jpc-purple-500/10 border-jpc-purple-500/50 shadow-jpc-purple-500/30`
- **Orange accent**: `bg-jpc-orange-500/10 border-jpc-orange-500/50 shadow-jpc-orange-500/30`

**Rules:**
- Background: 10% opacity of accent color
- Border: 50% opacity of accent color
- Shadow: Glowing effect with 30% opacity
- Always use `rounded-xl` and `overflow-hidden`

### 3. Statistics Cards
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  {/* Cyan Card */}
  <div className="bg-jpc-400/10 border border-jpc-400/50 rounded-xl p-6 shadow-[0_0_9px_2px] shadow-jpc-400/30">
    <h3 className="text-xs font-semibold text-jpc-gold-500/70 uppercase tracking-wider mb-2">LABEL</h3>
    <p className="text-4xl font-bold text-jpc-400">7,228</p>
  </div>
  
  {/* Purple Card */}
  <div className="bg-jpc-purple-500/10 border border-jpc-purple-500/50 rounded-xl p-6 shadow-[0_0_9px_2px] shadow-jpc-purple-500/30">
    <h3 className="text-xs font-semibold text-jpc-gold-500/70 uppercase tracking-wider mb-2">LABEL</h3>
    <p className="text-4xl font-bold text-jpc-purple-500">2,850</p>
  </div>
  
  {/* Orange Card */}
  <div className="bg-jpc-orange-500/10 border border-jpc-orange-500/50 rounded-xl p-6 shadow-[0_0_9px_2px] shadow-jpc-orange-500/30">
    <h3 className="text-xs font-semibold text-jpc-gold-500/70 uppercase tracking-wider mb-2">LABEL</h3>
    <p className="text-4xl font-bold text-jpc-orange-500">2.54</p>
  </div>
</div>
```

**Rules:**
- Label: `text-xs font-semibold text-jpc-gold-500/70 uppercase tracking-wider`
- Value: `text-4xl font-bold` with accent color
- Always use 3-column grid on desktop, single column on mobile
- Each card has matching background, border, and shadow colors

### 4. Buttons

#### Primary Button (Cyan)
```tsx
<button className="bg-jpc-400 hover:bg-jpc-400/80 disabled:bg-jpc-400/30 text-jpc-bg-900 font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:cursor-not-allowed">
  <svg className="h-5 w-5" />
  <span>Button Text</span>
</button>
```

#### Secondary Button (Smaller)
```tsx
<button className="bg-jpc-400 hover:bg-jpc-400/80 disabled:bg-jpc-400/30 text-jpc-bg-900 font-semibold px-6 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg transition-all duration-200">
  <svg className="h-4 w-4" />
  Refresh Data
</button>
```

**Rules:**
- Background: Full cyan (`jpc-400`)
- Text: Dark background color (`text-jpc-bg-900`)
- Hover: 80% opacity
- Disabled: 30% opacity with `cursor-not-allowed`
- Always include transition and shadow

### 5. Info/Warning Boxes

#### Info Box (Cyan)
```tsx
<div className="bg-jpc-900/20 border border-jpc-400/30 rounded-lg px-4 py-3 mb-4">
  <div className="flex items-center gap-2">
    <svg className="h-4 w-4 text-jpc-400 shrink-0" />
    <span className="text-sm text-jpc-gold-500">
      <span className="font-semibold">Label:</span> Content
    </span>
  </div>
</div>
```

#### Warning Box (Orange)
```tsx
<div className="bg-jpc-orange-500/10 border border-jpc-orange-500/30 rounded-lg px-4 py-3 mb-4">
  <div className="flex items-center gap-2">
    <svg className="h-4 w-4 text-jpc-orange-500 shrink-0" />
    <span className="text-sm text-jpc-gold-500">
      <span className="font-semibold">Warning:</span> Content
    </span>
  </div>
</div>
```

**Rules:**
- Icon: Accent color, 4×4, `shrink-0`
- Text: `text-sm text-jpc-gold-500`
- Label: `font-semibold` within text
- Background: 10-20% opacity of accent color

### 6. Tables

#### Table Container
```tsx
<div className="bg-jpc-400/10 border border-jpc-400/50 rounded-xl shadow-[0_0_9px_2px] shadow-jpc-400/30 overflow-hidden">
  {/* Table header section */}
  <div className="px-6 py-4 bg-jpc-purple-900 border-b border-jpc-400/30">
    <h3 className="text-xl font-bold text-jpc-gold-500">Table Title</h3>
    <p className="text-jpc-gold-500/70 mt-1">Description</p>
  </div>
  
  {/* Table */}
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-jpc-400/20">
      {/* Table content */}
    </table>
  </div>
</div>
```

#### Table Header
```tsx
<thead className="bg-jpc-900/20">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-semibold text-jpc-gold-500 uppercase tracking-wider">
      COLUMN NAME
    </th>
  </tr>
</thead>
```

#### Table Body
```tsx
<tbody className="divide-y divide-jpc-400/10">
  <tr className="hover:bg-jpc-400/5 transition-colors">
    <td className="px-6 py-4 whitespace-nowrap text-sm text-jpc-gold-500/70">
      Content
    </td>
  </tr>
</tbody>
```

**Rules:**
- Container: Cyan accent with glow
- Header section: Dark purple background (`jpc-purple-900`)
- Table title: `text-xl font-bold text-jpc-gold-500`
- Column headers: `text-xs font-semibold text-jpc-gold-500 uppercase tracking-wider`
- Row text: `text-sm text-jpc-gold-500/70`
- Row hover: `hover:bg-jpc-400/5 transition-colors`
- Dividers: 10-20% opacity of accent color

### 7. Badges

#### Purple Badge (Top 10 IDs)
```tsx
{/* Linked */}
<a
  href={link}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-jpc-purple-500/50 text-jpc-gold-500 hover:bg-jpc-purple-500/70 transition-all duration-200 no-underline border border-jpc-purple-500/50"
>
  {id}
  <svg className="w-3 h-3 text-jpc-gold-500" />
</a>

{/* Non-linked */}
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-jpc-purple-500/50 text-jpc-gold-500 border border-jpc-purple-500/50">
  {id}
</span>
```

#### Cyan Badge (Child Request IDs)
```tsx
<a className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-jpc-400/30 text-jpc-gold-500 hover:bg-jpc-400/50 transition-all duration-200 no-underline border border-jpc-400/50">
  {id}
  <svg className="w-3 h-3 text-jpc-gold-500" />
</a>
```

#### Orange Badge (Parent Request IDs)
```tsx
<a className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-jpc-orange-500/30 text-jpc-gold-500 hover:bg-jpc-orange-500/50 transition-all duration-200 no-underline border border-jpc-orange-500/50">
  {id}
  <svg className="w-3 h-3 text-jpc-gold-500" />
</a>
```

**Rules:**
- **All badges use gold text**: `text-jpc-gold-500`
- Background: 30-50% opacity of accent color
- Border: 50% opacity matching background
- Hover: Increase opacity by 20%
- Size: `text-xs font-semibold px-3 py-1`
- Icon: 3×3, same gold color as text
- Always `rounded-full` and `inline-flex items-center`
- Always `no-underline` for links

### 8. File Input
```tsx
<input
  type="file"
  className="block w-full text-sm text-jpc-gold-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-jpc-400 file:text-jpc-bg-900 hover:file:bg-jpc-400/80 file:cursor-pointer cursor-pointer bg-jpc-900/20 border border-jpc-400/30 rounded-lg"
/>
```

**Rules:**
- Main text: `text-jpc-gold-500`
- File button: Cyan background with dark text
- Container: Dark teal background with cyan border

---

## 🎭 Typography Scale

### Headings
```tsx
// Page Title (H1)
<h1 className="text-3xl font-bold text-jpc-gold-500">

// Section Title (H2)
<h2 className="text-2xl font-bold text-jpc-gold-500">

// Table/Card Title (H3)
<h3 className="text-xl font-bold text-jpc-gold-500">

// Stat Card Label (Small Caps)
<h3 className="text-xs font-semibold text-jpc-gold-500/70 uppercase tracking-wider">
```

### Body Text
```tsx
// Primary text
<p className="text-jpc-gold-500">

// Secondary text (70% opacity)
<p className="text-jpc-gold-500/70">

// Table cell text
<td className="text-sm text-jpc-gold-500/70">

// Small text
<span className="text-sm text-jpc-gold-500">
```

### Accent Text
```tsx
// Cyan highlight
<span className="text-jpc-400">

// Purple highlight  
<span className="text-jpc-purple-500">

// Orange highlight (warnings)
<span className="text-jpc-orange-500">
```

**Rules:**
- **Default text color**: Always `text-jpc-gold-500`
- **Headings**: Always gold, bold weight
- **Labels**: Gold with 70% opacity + uppercase
- **Accent colors**: Only for numbers, highlights, or emphasis
- **Never use pure white text** except in special cases

---

## 🎬 Animation & Transitions

### Standard Transitions
```tsx
className="transition-all duration-200"  // Default for most interactive elements
className="transition-colors"            // For hover effects on table rows
```

### Hover Effects
```tsx
// Button hover
hover:bg-jpc-400/80

// Badge hover
hover:bg-jpc-purple-500/70

// Table row hover
hover:bg-jpc-400/5
```

### Loading Spinner
```tsx
<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-jpc-bg-900"></div>
```

**Rules:**
- Always use `transition-all duration-200` for interactive elements
- Hover states: Increase/decrease opacity by 10-20%
- Loading spinners: Use dark background color for border

---

## 📦 Spacing Standards

### Container Spacing
```tsx
px-6 py-8    // Main content container
px-6 py-4    // Section headers, cards
px-4 py-3    // Info boxes, small containers
px-3 py-1    // Badges
```

### Margins
```tsx
mb-8         // Between major sections
mb-6         // Between related elements
mb-4         // Between smaller elements
mb-2         // Between labels and content
mt-1         // Between title and subtitle
```

### Grid Gaps
```tsx
gap-6        // Statistics cards grid
gap-2        // Inline elements (icon + text)
gap-1        // Badge icon + text
```

---

## 🎨 Effects & Shadows

### Box Shadows
```tsx
// Standard shadow
shadow-lg

// Glowing effect (cards, tables)
shadow-[0_0_9px_2px] shadow-jpc-400/30
shadow-[0_0_9px_2px] shadow-jpc-purple-500/30
shadow-[0_0_9px_2px] shadow-jpc-orange-500/30
```

### Backdrop Effects
```tsx
backdrop-blur-2xl    // Header
backdrop-blur-sm     // Background overlay
```

### Border Radius
```tsx
rounded-xl      // Cards, tables, sections
rounded-lg      // Buttons, inputs, info boxes
rounded-full    // Badges
```

---

## ✅ Design Checklist

When creating new components, ensure:
- [ ] Background uses `jpc-bg-900` or gradient
- [ ] Text uses `jpc-gold-500` (or 70% opacity variant)
- [ ] Accent colors match: cyan/purple/orange
- [ ] Cards have 10% background + 50% border + glow shadow
- [ ] Badges have semi-transparent backgrounds (30-50%)
- [ ] All badges use gold text (`text-jpc-gold-500`)
- [ ] Buttons use solid cyan background
- [ ] Hover states increase/decrease opacity
- [ ] Transitions are smooth (200ms)
- [ ] Spacing follows px-6/py-4 or px-4/py-3 pattern
- [ ] Tables have dark purple headers
- [ ] All interactive elements have proper states

---

## 🚫 Deprecated Patterns (DO NOT USE)

### ❌ Avoid These:
```tsx
// Wrong - Pure white text (except in specific badge cases)
className="text-white"

// Wrong - Hardcoded hex colors
className="bg-[#32E6C7]"

// Wrong - Black text on dark backgrounds
className="text-black"

// Wrong - No opacity on backgrounds
className="bg-jpc-purple-500"

// Wrong - Thin borders
className="border"

// Wrong - No transitions
<button> without transition classes

// Wrong - Random spacing
className="p-3 m-5"
```

### ✅ Use These Instead:
```tsx
// Correct
className="text-jpc-gold-500"
className="bg-jpc-400/30"
className="text-jpc-bg-900" // For buttons only
className="bg-jpc-purple-500/50"
className="border border-jpc-400/50"
className="transition-all duration-200"
className="px-6 py-4"
```

---

## 📝 Implementation Notes

1. **Color Consistency**: Every page must use the jpc color palette
2. **No Inline Styles**: All styling through Tailwind classes
3. **Responsive**: Mobile-first approach, test all breakpoints
4. **Accessibility**: Maintain gold text contrast on dark backgrounds
5. **Performance**: Use opacity for hover, not color changes
6. **Dark Theme Only**: No light mode variants needed

---

## 🔄 Migration Guide

To convert existing pages to this design system:

1. Replace background: `bg-jpc-bg-900` with gradient overlay
2. Replace all text: `text-jpc-gold-500` or `/70` variant
3. Replace cards: Use section card pattern with proper accent
4. Replace buttons: Use cyan primary button pattern
5. Replace tables: Use table pattern with purple headers
6. Replace badges: Use badge patterns with gold text
7. Add transitions: `transition-all duration-200` to interactive elements
8. Add glows: Use shadow pattern on cards and sections

---

**Last Updated**: November 4, 2025  
**Source**: `/request-relationships` page  
**Status**: Official Design System ✅


