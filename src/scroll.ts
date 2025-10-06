/**
 * Retrieves the total screen height (in pixels).
 * Note: This is typically the screen resolution height, not the viewport height.
 * @returns The screen height.
 */
export const getScreenHeight = (): number => {
  return window.screen.height;
};

/**
 * Retrieves the total scrollable height of the document body.
 * @returns The scrollable height in pixels.
 */
export const getScrollHeight = (): number => {
  // Use document.documentElement.scrollHeight for the most accurate total height, including content outside the viewport.
  return document.documentElement.scrollHeight || document.body.scrollHeight;
};

/**
 * Retrieves the current horizontal scroll position.
 * @returns The horizontal scroll offset in pixels.
 */
export const getCurrentScrollX = (): number => {
  return window.scrollX;
};

/**
 * Retrieves the current vertical scroll position.
 * @returns The vertical scroll offset in pixels.
 */
export const getCurrentScrollY = (): number => {
  return window.scrollY;
};

/**
 * Scrolls the document to the specified coordinates.
 * @param x The horizontal coordinate (default 0).
 * @param y The vertical coordinate (default 0).
 */
export const scrollTo = (x: number = 0, y: number = 0): void => {
  // Use scroll() for modern compatibility, which accepts the same arguments as scrollTo()
  window.scroll(x, y);
};
// Assume the random utility (inclusive max) is available. If not, you need to define it.
const getRandomIntInclusive = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};


/**
 * Scrolls to a random vertical position within a specified range, keeping the horizontal position fixed.
 * @param x The horizontal coordinate (default 0).
 * @param min The minimum scroll Y value (inclusive, defaults to 0).
 * @param max The maximum scroll Y value (inclusive, defaults to full document height).
 */
export const scrollRandomScreen = (x: number = 0, min: number = 0, max?: number): void => {
  const maxLimit = max !== undefined ? max : getScrollHeight();

  // Ensure the min/max range is sane
  const safeMin = Math.max(0, Math.floor(min));
  const safeMax = Math.max(safeMin, Math.floor(maxLimit));

  const rdHeight = getRandomIntInclusive(safeMin, safeMax);
  scrollTo(x, rdHeight);
};

// Interface for args used in automation functions
interface ScrollArgs {
  heightMin: number;
  heightMax?: number;
  el?: string;
}

/**
 * Calculates a random scroll amount based on min/max heights and applies it as an increment to the current position.
 * NOTE: Your original implementation used 'i' as a multiplier, which is not a typical random scroll.
 * This version uses the calculated random height as the absolute scroll target, like scrollRandomScreen.
 * * To match the original logic (which multiplies a random height by an index 'i'), 
 * I will retain the multiplication but warn against this pattern.
 *
 * @param type A descriptive string for logging.
 * @param i An index multiplier (e.g., in a loop).
 * @param args Configuration object with heightMin and optional heightMax.
 * @param timeout The delay before resolving the promise (optional).
 * @returns A Promise that resolves true after the scroll (and optional timeout).
 */
export const scrollRandomY = (
  type: string,
  i: number = 1,
  args: ScrollArgs,
  timeout: number = 0
): Promise<boolean> => {
  return new Promise(resolve => {
    try {
      // Set heightMax fallback to screen height if not provided
      const heightMax = args.heightMax ?? window.screen.height;
      const heightMin = args.heightMin;

      const safeMin = Math.floor(heightMin);
      const safeMax = Math.floor(heightMax);

      const rdHeight = getRandomIntInclusive(safeMin, safeMax);

      // WARNING: Multiplying a random height by an index 'i' (your original logic)
      // often leads to erratic/uncontrolled scrolling far beyond the document height.
      // A more common approach is setting the target scroll height directly.
      const scrollToHeight = i * rdHeight;

      // Apply the scroll
      window.scrollTo(0, scrollToHeight);

      console.log(`${type}: height ${scrollToHeight} - timeout: ${Math.floor(timeout / 1000)}s`);

      // Resolve after an optional timeout
      if (timeout > 0) {
        setTimeout(() => resolve(true), timeout);
      } else {
        resolve(true);
      }

    } catch (e) {
      console.error('Error in scrollRandomY:', e);
      resolve(false);
    }
  });
};

/**
 * Scrolls a specific element into the viewport after a delay.
 * @param type A descriptive string for logging.
 * @param args Configuration object with the CSS selector 'el'.
 * @param index The index of the element in the NodeList to scroll to.
 * @param timeout The delay in milliseconds before scrolling.
 * @returns A Promise that resolves true after the element is scrolled into view (and timeout completes).
 */
export const scrollElement = (
  type: string,
  args: ScrollArgs,
  index: number,
  timeout: number
): Promise<boolean> => {
  return new Promise(resolve => {
    try {
      const selector = args.el;
      if (!selector) {
        console.warn(`[${type}] Selector 'el' is missing in arguments.`);
        return resolve(false);
      }

      const els = document.querySelectorAll(selector);

      if (els.length === 0) {
        console.log(`[${type}] Can't find any element matching selector: ${selector}`);
        return resolve(true);
      }

      if (index < 0 || index >= els.length) {
        console.warn(`[${type}] Index ${index} is out of bounds (0 to ${els.length - 1}).`);
        return resolve(false);
      }

      const targetElement = els[index] as HTMLElement;

      // Use a named function for setTimeout for clearer cleanup
      const timeoutId = setTimeout(() => {
        // Scroll the element into view with smooth behavior (optional)
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        clearTimeout(timeoutId);

        console.log(`[${timeoutId}] Moved ${type}: ${index} of ${els.length} - timeout: ${Math.floor(timeout / 1000)}s`);
        resolve(true);
      }, timeout);

    } catch (e) {
      console.error(`Error in scrollElement [${type}]:`, e);
      resolve(false);
    }
  });
};
export { };