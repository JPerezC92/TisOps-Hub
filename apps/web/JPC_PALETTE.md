# JPC Color Palette

Custom Tailwind CSS color palette for Juan Perez Castro's personal design system.

## Available Color Scales

### 1. jpc (Cyan/Teal) - Primary Accent
The main brand color for buttons, links, and highlights.

```tsx
// Usage examples:
className="bg-jpc-400 text-white"           // Primary button
className="text-jpc-400"                     // Accent text
className="border-jpc-400"                   // Borders
className="bg-jpc-400/20"                    // Semi-transparent background
className="hover:bg-jpc-500"                 // Hover state
```

**Color Reference:**
- `jpc-50` to `jpc-100`: Very light tints
- `jpc-400`: **#32E6C7** - Primary cyan/teal
- `jpc-900`: **#007260** - Dark teal
- `jpc-950`: Darkest shade

---

### 2. jpc Purple - Badges & Cards
Used for badges, cards, and secondary accents.

```tsx
// Usage examples:
className="bg-jpc-purple-500 text-white"    // Purple badge
className="bg-jpc-purple-900"                // Dark purple header
className="bg-jpc-purple-500/50"             // Semi-transparent badge
className="hover:bg-jpc-purple-600"          // Hover effect
```

**Color Reference:**
- `jpc-purple-500`: **#A43FD9** - Primary purple
- `jpc-purple-900`: **#2F0B43** - Dark purple (table headers)

---

### 3. jpc Orange - Warnings & Secondary
Used for warnings, secondary actions, and attention-grabbing elements.

```tsx
// Usage examples:
className="bg-jpc-orange-500 text-white"    // Orange button
className="text-jpc-orange-500"              // Warning text
className="border-jpc-orange-500"            // Warning border
className="bg-jpc-orange-500/30"             // Semi-transparent badge
```

**Color Reference:**
- `jpc-orange-500`: **#E54302** - Primary orange/red

---

### 4. jpc Background - Dark Theme
Dark blue gradient backgrounds for the jpc theme.

```tsx
// Usage examples:
className="bg-jpc-bg-900"                    // Very dark background
className="bg-jpc-bg-500"                    // Mid-dark background
className="from-jpc-bg-900 to-jpc-bg-500" // Gradient
```

**Color Reference:**
- `jpc-bg-900`: **#000813** - Very dark blue background
- `jpc-bg-500`: **#001a2e** - Mid-dark background

---

### 5. jpc Gold - Text & Accents
Gold/sepia colors for text and subtle accents.

```tsx
// Usage examples:
className="text-jpc-gold-500"                // Gold text
className="bg-jpc-gold-500/10"               // Subtle gold tint
```

**Color Reference:**
- `jpc-gold-500`: **#E9D8A5** - Primary gold/sepia

---

## Complete Example: JPC-Style Card

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
      text-white 
      px-3 py-1 
      rounded-full
      border 
      border-jpc-purple-500/50
    ">
      Badge 1
    </span>
    
    <span className="
      bg-jpc-orange-500/30 
      text-white 
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

## Updating Existing Components

### Before (Hardcoded Colors):
```tsx
className="bg-[#32E6C7]/30 text-white border border-[#32E6C7]/50"
```

### After (Using Custom Palette):
```tsx
className="bg-jpc-400/30 text-white border border-jpc-400/50"
```

### Benefits:
- ✅ Easier to maintain and update
- ✅ Consistent naming across the application
- ✅ Better autocomplete in your IDE
- ✅ Semantic meaning (jpc-purple vs #A43FD9)
- ✅ All color shades available (50-950)

---

## Color Matrix

| Color Name | Primary Value | Use Case |
|------------|---------------|----------|
| `jpc-400` | #32E6C7 | Primary buttons, links, accents |
| `jpc-purple-500` | #A43FD9 | Badges, cards |
| `jpc-purple-900` | #2F0B43 | Table headers, dark sections |
| `jpc-orange-500` | #E54302 | Warnings, secondary actions |
| `jpc-bg-900` | #000813 | Main dark background |
| `jpc-bg-500` | #001a2e | Secondary dark background |
| `jpc-gold-500` | #E9D8A5 | Subtle text accents |

---

## Usage Reference

Example implementation can be found in `/request-relationships` page.

1. Replace `bg-[#32E6C7]` → `bg-jpc-400`
2. Replace `bg-[#A43FD9]` → `bg-jpc-purple-500`
3. Replace `bg-[#E54302]` → `bg-jpc-orange-500`
4. Replace `bg-[#000813]` → `bg-jpc-bg-900`
5. Replace `bg-[#2F0B43]` → `bg-jpc-purple-900`
6. Replace `text-[#E9D8A5]` → `text-jpc-gold-500`

The palette is now available globally across your entire Next.js application!


