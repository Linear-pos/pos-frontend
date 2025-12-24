# Color System Quick Reference

## Quick Start

### 1. Use Tailwind Classes (Most Common)

```tsx
<button className="bg-primary-600 hover:bg-primary-700 text-white">Save</button>
<div className="bg-success-50 text-success-700 border border-success-200">✓ Success</div>
<div className="bg-error-50 text-error-700 border border-error-200">✗ Error</div>
```

### 2. Use Color Utilities

```tsx
import { getColorClasses } from "@/lib/colorUtils";

const variant = getColorClasses("success");
<button className={variant.bg}>Save</button>;
```

### 3. Use CSS Variables (Dark Mode)

```tsx
<div style={{ color: "var(--color-primary)" }}>Dynamic color</div>
```

## Available Colors

### Primary (Brand)

- **primary-50** to **primary-900** - All shades
- **primary-600** - Main brand color (#0284c7)

### Status

- **green** (success) - bg-green-600, bg-green-50
- **amber** (warning) - bg-amber-600, bg-amber-50
- **red** (error) - bg-red-600, bg-red-50
- **blue** (info) - bg-blue-600, bg-blue-50

### Neutral

- **gray-50** to **gray-900** - Text, backgrounds, borders

## CSS Variables

```css
--color-primary              /* #0284c7 */
--color-success              /* #10b981 */
--color-warning              /* #f59e0b */
--color-error                /* #ef4444 */
--color-text-primary         /* Adapts to dark mode */
--color-bg-primary           /* Adapts to dark mode */
--color-border               /* Adapts to dark mode */
```

## Color Variants

| Variant | Background     | Light BG      | Text             | Border             |
| ------- | -------------- | ------------- | ---------------- | ------------------ |
| primary | bg-primary-600 | bg-primary-50 | text-primary-600 | border-primary-200 |
| success | bg-green-600   | bg-green-50   | text-green-600   | border-green-200   |
| warning | bg-amber-600   | bg-amber-50   | text-amber-600   | border-amber-200   |
| error   | bg-red-600     | bg-red-50     | text-red-600     | border-red-200     |
| info    | bg-blue-600    | bg-blue-50    | text-blue-600    | border-blue-200    |

## Common Patterns

### Primary Button

```tsx
className = "bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded";
```

### Success Alert

```tsx
className = "bg-green-50 border border-green-200 text-green-700 p-4 rounded";
```

### Error Alert

```tsx
className = "bg-red-50 border border-red-200 text-red-700 p-4 rounded";
```

### Disabled State

```tsx
className = "bg-gray-200 text-gray-600 cursor-not-allowed";
```

## Files

- **Import colors:** `import { colors } from '@/constants/colors'`
- **Import utilities:** `import { getColorClasses } from '@/lib/colorUtils'`
- **Full docs:** See `COLOR_SYSTEM.md`

## Dark Mode

Automatically activated by browser preference or `.dark` class

- CSS variables adapt automatically
- No additional code needed!

---

For complete documentation, see [COLOR_SYSTEM.md](./COLOR_SYSTEM.md)
