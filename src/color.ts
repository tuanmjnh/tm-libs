export const hexToRgba = (hex, opacity) => {
  let r = '0', g = '0', b = '0'
  if (hex.length === 4) {
    r = "0x" + hex[1] + hex[1]
    g = "0x" + hex[2] + hex[2]
    b = "0x" + hex[3] + hex[3]
  } else if (hex.length === 7) {
    r = "0x" + hex[1] + hex[2]
    g = "0x" + hex[3] + hex[4]
    b = "0x" + hex[5] + hex[6]
  }
  return `rgba(${+r},${+g},${+b},${opacity})`
}
export const rgbaToHex = (r, g, b, a = 1) => {
  // Ensure values are clamped
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  a = Math.max(0, Math.min(1, a));

  const alpha = Math.round(a * 255);
  return (
    "#" +
    [r, g, b, alpha]
      .map(x => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}