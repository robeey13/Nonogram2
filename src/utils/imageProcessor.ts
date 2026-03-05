import type { Grid } from "../types";

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Nem sikerült a kép betöltése"));
    };
    
    img.src = url;
  });
}

export function detectOptimalGridSize(img: HTMLImageElement): number {
  const minDimension = Math.min(img.width, img.height);
  

  if (minDimension < 30) {
    return 5;
  } else if (minDimension > 300) {
    return 20;
  } else {
    return 10;  
  }
}

export function imageToGrid(img: HTMLImageElement, targetSize: number): Grid {

  const canvas = document.createElement("canvas");
  canvas.width = targetSize;
  canvas.height = targetSize;
  
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Nem sikerült a canvas context létrehozása");
  }
  

  ctx.drawImage(img, 0, 0, targetSize, targetSize);
  

  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
  const pixels = imageData.data;
  

  const grid: Grid = [];
  
  for (let y = 0; y < targetSize; y++) {
    const row: (0 | 1)[] = [];
    for (let x = 0; x < targetSize; x++) {
      const index = (y * targetSize + x) * 4;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const a = pixels[index + 3];
      
     const brightness = (0.299 * r + 0.587 * g + 0.114 * b) * (a / 255);
      
     row.push(brightness < 128 ? 1 : 0);
    }
    grid.push(row);
  }
  
  return grid;
}
