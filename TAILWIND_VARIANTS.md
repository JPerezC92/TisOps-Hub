# Tailwind Variants Setup

Tailwind Variants has been successfully configured in your monorepo! 🎉

## Installation

The following packages have been installed:
- `tailwind-variants` - The main library
- `tailwind-merge` - For automatic conflict resolution

Installed in:
- ✅ `apps/web`
- ✅ `packages/ui`

## Configuration

### VSCode IntelliSense
Auto-completion for Tailwind classes in `tv()` functions is enabled via `.vscode/settings.json`.

### Custom Config
A shared TV configuration is available at `packages/ui/src/tv.config.ts` for consistent settings across components.

## Usage Examples

### 1. Button Component (Simple Variants)

```tsx
import { tv, type VariantProps } from 'tailwind-variants';

const button = tv({
  base: 'font-medium rounded-lg transition-colors',
  variants: {
    variant: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    },
    size: {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

// Use with TypeScript
interface ButtonProps extends VariantProps<typeof button> {
  children: React.ReactNode;
}

export const Button = ({ variant, size, children }: ButtonProps) => (
  <button className={button({ variant, size })}>
    {children}
  </button>
);
```

### 2. Card Component (Using Slots)

```tsx
import { tv } from 'tailwind-variants';

const card = tv({
  slots: {
    base: 'rounded-lg border bg-white shadow-sm',
    header: 'border-b px-6 py-4',
    body: 'px-6 py-4',
    footer: 'border-t px-6 py-4 bg-gray-50',
  },
  variants: {
    variant: {
      default: {
        base: 'border-gray-200',
        header: 'border-gray-200',
        footer: 'border-gray-200',
      },
      success: {
        base: 'border-green-200 bg-green-50',
        header: 'border-green-200 bg-green-100',
        footer: 'border-green-200 bg-green-100',
      },
    },
  },
});

export const Card = ({ variant = 'default' }) => {
  const styles = card({ variant });
  
  return (
    <div className={styles.base()}>
      <div className={styles.header()}>Header</div>
      <div className={styles.body()}>Body</div>
      <div className={styles.footer()}>Footer</div>
    </div>
  );
};
```

### 3. Responsive Variants

```tsx
const container = tv({
  base: 'mx-auto px-4',
  variants: {
    size: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      full: 'max-w-full',
    },
  },
});

// Use with responsive variants
<div className={container({ 
  size: { initial: 'sm', md: 'md', lg: 'lg' } 
})} />
```

### 4. Compound Variants

```tsx
const badge = tv({
  base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  variants: {
    variant: {
      default: 'bg-gray-100 text-gray-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
    },
    size: {
      sm: 'text-xs',
      md: 'text-sm',
    },
  },
  compoundVariants: [
    {
      variant: 'error',
      size: 'md',
      class: 'font-bold',
    },
  ],
});
```

### 5. Component Composition

```tsx
import { tv } from 'tailwind-variants';

const baseButton = tv({
  base: 'rounded px-4 py-2 font-medium transition-colors',
  variants: {
    size: {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    },
  },
});

// Extend the base button
const primaryButton = tv({
  extend: baseButton,
  base: 'bg-blue-600 text-white hover:bg-blue-700',
});

const dangerButton = tv({
  extend: baseButton,
  base: 'bg-red-600 text-white hover:bg-red-700',
});
```

## Updated Components

The following components have been updated to use tailwind-variants:

### Button (`packages/ui/src/button.tsx`)
- Added `variant` prop: `default`, `secondary`, `outline`, `ghost`, `destructive`
- Added `size` prop: `sm`, `md`, `lg`

Usage:
```tsx
<Button variant="secondary" size="lg" appName="web">
  Click me
</Button>
```

### Card (`packages/ui/src/card.tsx`)
- Added `variant` prop: `default`, `outlined`
- Added `padding` prop: `sm`, `md`, `lg`
- Uses slots for better control over internal elements

Usage:
```tsx
<Card 
  variant="outlined" 
  padding="lg"
  title="My Card"
  href="https://example.com"
>
  Card content
</Card>
```

## Benefits

✅ **Type-safe variants** - Full TypeScript support with `VariantProps`
✅ **Automatic conflict resolution** - `tailwind-merge` prevents class conflicts
✅ **Responsive variants** - Built-in support for responsive design
✅ **Slots** - Organize complex component styles
✅ **Composition** - Extend and compose variants
✅ **IntelliSense** - Auto-completion in VSCode

## Documentation

Full documentation: https://www.tailwind-variants.org/docs/introduction

## Notes

- The configuration uses `twMerge: true` for automatic conflict resolution
- All components should import from `tailwind-variants` directly
- For manual class merging, use the `cn` utility from `tailwind-variants`
