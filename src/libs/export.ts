// src/utils/export.ts
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";

/**
 * Export a given element to PNG.
 */
export async function exportToPNG(element: HTMLElement): Promise<string> {
  const controls = element.querySelector('.react-flow__controls') as HTMLElement | null;
  if (controls) controls.style.display = 'none';

  return htmlToImage.toPng(element, {
    cacheBust: true,
    backgroundColor: "#fff",
    pixelRatio: 2, // Balance quality and performance (reduced from 5)
  });
}

/**
 * Export the given element to PDF (using PNG snapshot).
 */
export async function exportToPDF(element: HTMLElement): Promise<Blob> {
  const pngDataUrl = await exportToPNG(element);
  const img = new Image();
  img.src = pngDataUrl;

  // Avoid implicit `any` on the promise resolve handler by typing the
  // Promise as `void` and using an explicit callback.
  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
  });

  const pdf = new jsPDF({
    orientation: img.width > img.height ? "landscape" : "portrait",
    unit: "px",
    format: [img.width, img.height],
  });

  pdf.addImage(pngDataUrl, "PNG", 0, 0, img.width, img.height);

  const pdfBlob = pdf.output("blob");
  return pdfBlob;
}

/**
 * Trigger download of a data URL or Blob.
 */
export function triggerDownload(data: string | Blob, filename: string) {
  const a = document.createElement("a");

  if (typeof data === "string") {
    a.href = data;
  } else {
    a.href = URL.createObjectURL(data);
  }

  a.download = filename;
  a.click();

  if (typeof data !== "string") {
    URL.revokeObjectURL(a.href);
  }
}
