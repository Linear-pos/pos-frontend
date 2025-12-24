# Color System Documentation

## Overview

The POS application uses a centralized color system to ensure consistency throughout the app. This system provides multiple ways to apply colors depending on your use case.

## Files

- **`src/constants/colors.ts`** - Color palette definitions and variants
- **`src/styles/colors.css`** - CSS variables for dynamic theming
- **`src/lib/colorUtils.ts`** - Utility functions for working with colors
- **`src/components/ColorReferenceComponent.tsx`** - Visual reference component

## Color Palette

### Primary Colors

- Used for main brand colors and primary actions
- Shades: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- Primary-600 (#0284c7) is the main brand color

### Status Colors

- **Success** (Green #10b981) - Success messages, completed actions
- **Warning** (Amber #f59e0b) - Warnings, pending actions
- **Error** (Red #ef4444) - Errors, destructive actions
- **Info** (Blue #3b82f6) - Information, neutral actions

### Neutral/Gray Colors

- Used for text, backgrounds, borders
- Shades: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- Supports automatic dark mode switching

## Usage Methods

### Method 1: Tailwind Classes (Recommended)

Use standard Tailwind utility classes:

```tsx
<button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded">
  Click me
</button>

<div className="bg-success-50 border border-success-200 text-success-700 p-4">
  Success!
</div>
```

**Advantages:**

- Native Tailwind integration
- Type-safe in TypeScript
- Works with all Tailwind plugins
- Smallest bundle size

### Method 2: Color Utilities

Use helper functions for programmatic access:

```tsx
import { getColorClasses, combineColorClasses } from "@/lib/colorUtils";

const successClasses = getColorClasses("success");
<button className={`${successClasses.bg} ${successClasses.bgHover}`}>
  Save
</button>;

// Or combine with additional classes
const buttonClass = combineColorClasses("error", "px-4 py-2 rounded");
<button className={buttonClass}>Delete</button>;
```

**Advantages:**

- Dynamic color selection
- Reduces code duplication
- Easy to switch variants

### Method 3: CSS Variables

Use CSS custom properties for runtime color changes:

```tsx
<div style={{ color: 'var(--color-primary)' }}>
  Themed text
</div>

<button style={{ backgroundColor: 'var(--color-success)' }}>
  Save
</button>
```

**Advantages:**

- Full dynamic theming support
- Works with dark mode automatically
- Can be changed at runtime
- Good for theme switching UI

### Method 4: Direct Color Values

Import and use color values directly:

```tsx
import { colors, getColor } from "@/constants/colors";

const primaryColor = colors.primary[600];
const warningColor = getColor("warning", 600);

// Use in canvas, charts, or dynamic styling
canvas.fillStyle = primaryColor;
chart.setColor(warningColor);
```

**Advantages:**

- Full control over color values
- Good for canvas/SVG elements
- Works with non-CSS contexts

## Color Variants

Predefined color variants for common UI patterns:

```tsx
interface ColorVariant {
  bg: string; // Background class
  bgHover: string; // Hover background class
  bgLight: string; // Light background class
  text: string; // Text color class
  border: string; // Border color class
}
```

**Available variants:**

- `primary` - Primary brand color
- `success` - Success/positive actions
- `warning` - Warnings/caution
- `error` - Errors/destructive actions
- `info` - Information/neutral
- `neutral` - Neutral gray

## Dark Mode

The color system automatically supports dark mode:

- CSS variables update based on `prefers-color-scheme: dark`
- Add `.dark` class to enable dark mode explicitly
- All colors have appropriate contrast in both modes

### Manual Dark Mode Toggle

```tsx
// Enable dark mode
document.documentElement.classList.add("dark");

// Disable dark mode
document.documentElement.classList.remove("dark");
```

## Best Practices

1. **Use Tailwind classes by default** - Most consistent and performant
2. **Use CSS variables for theming** - When you need runtime color changes
3. **Use color utilities for variants** - When selecting colors dynamically
4. **Avoid hardcoding colors** - Always reference from the color system
5. **Maintain contrast ratios** - Ensure accessibility in all color pairs
6. **Test in dark mode** - Verify colors work in both light and dark modes

## Examples

### Button Component

```tsx
import { getColorClasses } from "@/lib/colorUtils";

interface ButtonProps {
  variant: "primary" | "success" | "error";
  children: React.ReactNode;
}

export function Button({ variant, children }: ButtonProps) {
  const classes = getColorClasses(variant);
  return (
    <button
      className={`${classes.bg} ${classes.bgHover} text-white px-4 py-2 rounded transition-colors`}
    >
      {children}
    </button>
  );
}
```

### Alert Component

```tsx
export function Alert({ variant, title, message }) {
  const classes = getColorClasses(variant);
  return (
    <div className={`${classes.bgLight} border ${classes.border} rounded p-4`}>
      <h3 className={`${classes.text} font-bold`}>{title}</h3>
      <p className={`${classes.text} text-sm opacity-80`}>{message}</p>
    </div>
  );
}
```

### Dynamic Theme Switching

```tsx
export function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    if (newIsDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setIsDark(newIsDark);
  };

  return <button onClick={toggleTheme}>Toggle Theme</button>;
}
```

## Adding New Colors

To add new colors to the system:

1. **Add to `src/constants/colors.ts`**

```tsx
export const colors = {
  // ... existing colors
  myColor: {
    50: "#...",
    100: "#...",
    // ... other shades
  },
};
```

2. **Add to `src/styles/colors.css`**

```css
--color-my-color: #...;
--color-my-color-light: #...;
```

3. **Add variant if needed**

```tsx
export const colorVariants = {
  // ... existing variants
  myColor: {
    bg: "bg-my-color-600",
    // ... other classes
  },
};
```

4. **Use the Tailwind color name in your utility classes** (no additional config needed if using standard color names like `primary`, `success`, etc.)

## Troubleshooting

### Colors not applying

- Check that `src/styles/colors.css` is imported in `src/index.css`
- Verify Tailwind is configured correctly in your build

### Dark mode not working

- Ensure `prefers-color-scheme` is set or `.dark` class is applied
- Check CSS variable definitions in `src/styles/colors.css`

### Type errors with color utils

- Import types: `import { ColorVariant } from '@/constants/colors'`
- Ensure colors.ts is properly exported from constants/index.ts

## References

- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Color Contrast Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
