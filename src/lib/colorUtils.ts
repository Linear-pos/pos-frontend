/**
 * Color utilities for components
 * Provides functions to use colors consistently across the app
 */

import { colors, colorVariants, type ColorVariant } from "@/constants/colors";

/**
 * Get Tailwind color classes for a variant
 * @example
 * const classes = getColorClasses('success');
 * <button className={classes.bg}>Save</button>
 */
export function getColorClasses(variant: ColorVariant) {
  return colorVariants[variant];
}

/**
 * Get a specific color value
 * @example
 * const primaryColor = getColor('primary', 600);
 */
export function getColor(
  colorName: keyof typeof colors,
  shade?: keyof typeof colors.primary
): string {
  const color = colors[colorName];
  if (shade && typeof color === "object" && shade in color) {
    return (color as any)[shade];
  }
  return color as string;
}

/**
 * Combine color variant classes with additional classes
 * @example
 * const buttonClasses = combineColorClasses('primary', 'px-4 py-2');
 */
export function combineColorClasses(
  variant: ColorVariant,
  additional?: string
): string {
  const variantClasses = colorVariants[variant];
  const combined = `${variantClasses.bg} ${variantClasses.bgHover} ${variantClasses.text}`;
  return additional ? `${combined} ${additional}` : combined;
}
