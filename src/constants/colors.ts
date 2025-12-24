/**
 * Centralized color palette for the POS application
 * Ensures consistent colors throughout the app
 */

export const colors = {
  // Brand Primary Colors
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c2d6b",
  },

  // Success Colors
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
  },

  // Warning Colors
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
  },

  // Error/Destructive Colors
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
  },

  // Info Colors
  info: {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
  },

  // Neutral/Gray Colors
  neutral: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },

  // Semantic colors
  white: "#ffffff",
  black: "#000000",
} as const;

/**
 * Predefined color variants for common UI components
 */
export const colorVariants = {
  primary: {
    bg: "bg-primary-600",
    bgHover: "hover:bg-primary-700",
    bgLight: "bg-primary-50",
    text: "text-primary-600",
    border: "border-primary-200",
  },
  success: {
    bg: "bg-green-600",
    bgHover: "hover:bg-green-700",
    bgLight: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
  },
  warning: {
    bg: "bg-amber-600",
    bgHover: "hover:bg-amber-700",
    bgLight: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
  },
  error: {
    bg: "bg-red-600",
    bgHover: "hover:bg-red-700",
    bgLight: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
  },
  info: {
    bg: "bg-blue-600",
    bgHover: "hover:bg-blue-700",
    bgLight: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  neutral: {
    bg: "bg-gray-600",
    bgHover: "hover:bg-gray-700",
    bgLight: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
  },
} as const;

/**
 * Get CSS variable for a color
 * Usage: `style={{ color: getCSSVariable('primary') }}`
 */
export const getCSSVariable = (colorName: keyof typeof colors): string => {
  return `var(--color-${colorName})`;
};

export type ColorVariant = keyof typeof colorVariants;
export type ColorShade = keyof typeof colors.primary;
