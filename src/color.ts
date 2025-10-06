/**
 * Helper function to safely clean and parse a hex color string.
 * It removes the leading '#' and pads shorthands.
 * @param hex The hex string (e.g., "#336699" or "369").
 * @returns The cleaned 6-digit hex string or null if invalid.
 */
const cleanHex = (hex) => {
  // 1. Remove optional '#'
  const h = hex.startsWith('#') ? hex.slice(1) : hex;

  // 2. Validate length
  if (h.length !== 3 && h.length !== 6) {
    return null;
  }

  // 3. Expand shorthand (3-digit to 6-digit)
  if (h.length === 3) {
    return h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }

  return h;
};

/**
 * Converts a hex color string (e.g., "#RRGGBB" or "#RGB") to an RGBA string.
 * @param hex The hex color string.
 * @param opacity The alpha transparency value (0 to 1). Defaults to 1.
 * @returns An RGBA color string (e.g., "rgba(51,102,153,0.5)") or null if hex is invalid.
 */
export const hexToRgba = (hex, opacity = 1) => {
  const cleaned = cleanHex(hex);

  if (!cleaned) {
    console.error(`Invalid hex color format: ${hex}`);
    return null;
  }

  // Parse R, G, B components from the 6-digit string
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);

  // Ensure opacity is clamped between 0 and 1
  const clampedOpacity = Math.max(0, Math.min(1, opacity));

  return `rgba(${r},${g},${b},${clampedOpacity})`;
};

/**
 * Converts RGBA color components to an 8-digit hex color string (with alpha).
 * @param r Red component (0-255).
 * @param g Green component (0-255).
 * @param b Blue component (0-255).
 * @param a Alpha component (0-1). Defaults to 1.
 * @returns An 8-digit hex color string (e.g., "#336699FF").
 */
export const rgbaToHex = (r, g, b, a = 1) => {
  // Ensure R, G, B values are clamped between 0 and 255
  r = Math.round(Math.max(0, Math.min(255, r)));
  g = Math.round(Math.max(0, Math.min(255, g)));
  b = Math.round(Math.max(0, Math.min(255, b)));

  // Ensure A value is clamped between 0 and 1
  a = Math.max(0, Math.min(1, a));

  // Convert alpha (0-1) to an integer (0-255)
  const alpha = Math.round(a * 255);

  // Map components to a 2-digit hex string, padding with '0' if needed
  return (
    "#" +
    [r, g, b, alpha]
      .map(x => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase() // Convert to uppercase for standard hex notation
  );
};

export { };