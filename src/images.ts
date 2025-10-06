import { delay } from './promise.js'; // Assuming delay utility is available

interface FileItem {
  [key: string]: any;
}

/**
 * Creates a structured DIV element containing a lazy-loaded IMG and a placeholder.
 * @param url The image URL to be loaded.
 * @param index The index of the image (for alt text).
 * @returns The container <div> element.
 */
const createImageElement = (url: string, index: number): HTMLDivElement => {
  const div = document.createElement('div');
  // Using Tailwind/utility classes: relative, aspect ratio container
  div.className = 'relative overflow-hidden aspect-w-16 aspect-h-9';

  // Image element setup
  const img = document.createElement('img');
  // Lazy-image class is used for observer selection
  img.className = 'lazy-image w-full h-auto object-cover transition-opacity duration-300 opacity-0 rounded-lg';
  img.dataset.src = url; // Store the URL in data-src
  img.alt = `Image ${index + 1}`;

  // Placeholder setup (absolute position, pulse animation)
  const placeholder = document.createElement('div');
  // Placeholder must be the direct previous sibling to be removed easily
  placeholder.className = 'image-placeholder absolute inset-0 bg-neutral-200 animate-pulse w-full h-full';

  div.appendChild(placeholder);
  div.appendChild(img);
  return div;
};

/**
 * The core IntersectionObserver logic for loading a single image.
 * @param entries IntersectionObserverEntry array.
 * @param observer The observer instance.
 */
const observerCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
  entries.forEach(async (entry) => {
    if (entry.isIntersecting) {
      // Add a small delay for a smoother visual effect (optional)
      await delay(200);

      const img = entry.target as HTMLImageElement;

      // 1. Load the image
      const srcUrl = img.dataset.src;
      if (srcUrl) {
        img.src = srcUrl;
      } else {
        // If no data-src, just unobserve and exit
        observer.unobserve(img);
        return;
      }

      // 2. Handle successful load
      img.onload = () => {
        // Remove opacity-0 to trigger the fade-in transition
        img.classList.remove('opacity-0');

        // Remove the placeholder, which is the previous sibling
        const placeholder = img.previousElementSibling;
        if (placeholder && placeholder.classList.contains('image-placeholder')) {
          placeholder.remove();
        }
      };

      // 3. Stop observing after load is initiated
      observer.unobserve(img);
    }
  });
};

interface LazyLoadOptions {
  srcKey?: string;
  isAppend?: boolean;
  rootMargin?: string;
  threshold?: number;
  imageSelector?: string; // For observing existing elements
}

/**
 * Manages lazy loading for a gallery, either by creating and appending new image elements,
 * or by observing existing elements within the gallery.
 * * @param galleryId The ID of the container element (e.g., 'drive-gallery').
 * @param files An array of file objects to create new image elements from (optional).
 * @param opts Configuration options for loading and observation.
 */
export const lazyLoadGallery = async (
  galleryId: string = 'drive-gallery',
  files?: FileItem[],
  opts: LazyLoadOptions = {}
) => {
  // Initial delay to wait for the DOM to settle (if function is called immediately)
  await delay(300);

  const {
    srcKey = 'src',
    isAppend = false,
    rootMargin = '0px',
    threshold = 0.1,
    imageSelector = 'img.lazy-image',
  } = opts;

  const gallery = document.getElementById(galleryId);

  if (!gallery) {
    console.warn(`Gallery element with ID '${galleryId}' not found.`);
    return;
  }

  // --- 1. Create and Append New Elements (if files are provided) ---
  if (files && files.length > 0) {
    if (!isAppend) gallery.innerHTML = ''; // Clear gallery if not appending

    files.forEach((file, index) => {
      // Note: If you want to attach listeners (like click), do it here
      const imageElement = createImageElement(file[srcKey], index);
      gallery.appendChild(imageElement);
    });
  }

  // --- 2. Set up Intersection Observer ---

  // Select all images to be observed (either newly created or pre-existing)
  const images = gallery.querySelectorAll(imageSelector);

  if (images.length === 0) {
    console.log(`No images found with selector '${imageSelector}' to observe.`);
    return;
  }

  const options: IntersectionObserverInit = {
    root: null, // Relative to the viewport
    rootMargin,
    threshold,
  };

  // Create the observer instance using the shared callback
  const imageObserver = new IntersectionObserver(observerCallback, options);

  // Start observing each image
  images.forEach((img) => imageObserver.observe(img));
};

// --- Export Aliases for Backwards Compatibility ---

/**
 * Alias for lazyLoadGallery, maintaining the original signature of your first function.
 * Creates and loads new elements.
 */
export const lazyLoad = (files: FileItem[], srcKey = 'src', isAppend = false) => {
  return lazyLoadGallery('drive-gallery', files, { srcKey, isAppend });
};

/**
 * Alias for lazyLoadGallery, maintaining the original signature of your second function.
 * Observes existing elements.
 */
export const lazyLoadImage = (galleryClass = 'drive-gallery', imageClass = 'img.lazy-image') => {
  // Note: The second function only observed existing images, so we pass null for files.
  // We adjust the threshold to match your original 'lazyLoadImage' (threshold: 1)
  return lazyLoadGallery(galleryClass, undefined, { imageSelector: imageClass, threshold: 1 });
};

export { };