// Maximum image size in bytes (500KB) to be mindful of storage
export const MAX_IMAGE_SIZE = 500 * 1024;

// Maximum dimension for longest side of image
const MAX_DIMENSION = 1200;

/**
 * Calculate scaled dimensions for an image
 * @param width - Original width
 * @param height - Original height
 * @param maxDimension - Maximum allowed dimension
 * @returns Object with scaled width and height
 */
function calculateScaledDimensions(
  width: number,
  height: number,
  maxDimension: number = MAX_DIMENSION
): { width: number; height: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  if (width > height) {
    return {
      width: maxDimension,
      height: (height / width) * maxDimension,
    };
  } else {
    return {
      width: (width / height) * maxDimension,
      height: maxDimension,
    };
  }
}

/**
 * Compress an image using canvas and iterative quality reduction
 * @param img - Image element to compress
 * @param maxSizeBytes - Maximum size in bytes
 * @returns Promise<string> - Compressed image as base64 data URL
 */
function compressImageOnCanvas(
  img: HTMLImageElement,
  maxSizeBytes: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const { width, height } = calculateScaledDimensions(img.width, img.height);
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    // Use iterative approach instead of recursion to avoid stack overflow
    let quality = 0.9;
    while (quality >= 0.1) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      // Calculate approximate size in bytes from base64 string
      const base64Length = dataUrl.split(',')[1].length;
      const size = (base64Length * 3) / 4;

      if (size <= maxSizeBytes) {
        resolve(dataUrl);
        return;
      }

      quality -= 0.1;
    }

    // If we get here, even minimum quality is too large, return it anyway
    resolve(canvas.toDataURL('image/jpeg', 0.1));
  });
}

/**
 * Compress an image to ensure it's under the specified size limit
 * @param file - The image file or blob
 * @param maxSizeBytes - Maximum size in bytes (default: 500KB)
 * @returns Promise<string> - Compressed image as base64 data URL
 */
export async function compressImageFile(
  file: File | Blob,
  maxSizeBytes: number = MAX_IMAGE_SIZE
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const compressed = await compressImageOnCanvas(img, maxSizeBytes);
          resolve(compressed);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress an image from a base64 data URL
 * @param dataUrl - Base64 data URL of the image
 * @param maxSizeBytes - Maximum size in bytes (default: 500KB)
 * @returns Promise<string> - Compressed image as base64 data URL
 */
export async function compressImageDataUrl(
  dataUrl: string,
  maxSizeBytes: number = MAX_IMAGE_SIZE
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        const compressed = await compressImageOnCanvas(img, maxSizeBytes);
        resolve(compressed);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}
