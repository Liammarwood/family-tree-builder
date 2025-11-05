// Maximum image size in bytes (500KB) to be mindful of storage
export const MAX_IMAGE_SIZE = 500 * 1024;

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
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        let quality = 0.9;
        let width = img.width;
        let height = img.height;

        // Scale down if image is too large (max 1200px on longest side)
        const MAX_DIMENSION = 1200;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = (height / width) * MAX_DIMENSION;
            width = MAX_DIMENSION;
          } else {
            width = (width / height) * MAX_DIMENSION;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const tryCompress = () => {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          // Calculate approximate size in bytes from base64 string
          const base64Length = dataUrl.split(',')[1].length;
          const size = (base64Length * 3) / 4;

          if (size <= maxSizeBytes || quality <= 0.1) {
            resolve(dataUrl);
          } else {
            quality -= 0.1;
            tryCompress();
          }
        };

        tryCompress();
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
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      let quality = 0.9;
      let width = img.width;
      let height = img.height;

      // Scale down if image is too large (max 1200px on longest side)
      const MAX_DIMENSION = 1200;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = (height / width) * MAX_DIMENSION;
          width = MAX_DIMENSION;
        } else {
          width = (width / height) * MAX_DIMENSION;
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const tryCompress = () => {
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        // Calculate approximate size in bytes from base64 string
        const base64Length = compressedDataUrl.split(',')[1].length;
        const size = (base64Length * 3) / 4;

        if (size <= maxSizeBytes || quality <= 0.1) {
          resolve(compressedDataUrl);
        } else {
          quality -= 0.1;
          tryCompress();
        }
      };

      tryCompress();
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}
