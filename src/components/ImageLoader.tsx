import { useState } from "react";
import type { Grid } from "../types";
import { loadImageFromFile, imageToGrid, detectOptimalGridSize } from "../utils/imageProcessor";

interface Props {
  onLoad: (grid: Grid, size: number) => void;
}

export default function ImageLoader({ onLoad }: Props) {
  const [loading, setLoading] = useState(false);
  const [detectedSize, setDetectedSize] = useState<number | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      alert("Kérlek, csak képfájlt válassz (jpg, png, stb.)!");
      return;
    }

    setLoading(true);
    
    try {
      const img = await loadImageFromFile(file);
      const optimalSize = detectOptimalGridSize(img);
      setDetectedSize(optimalSize);
      
      const grid = imageToGrid(img, optimalSize);
      onLoad(grid, optimalSize);
    } catch (error) {
      alert("Hiba történt a kép feldolgozása során: " + (error as Error).message);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
      <label htmlFor="image-upload">Kép beolvasása:</label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={loading}
      />
      {loading && <span>Feldolgozás...</span>}
      {detectedSize && !loading && (
        <span style={{ color: "green", fontWeight: "bold" }}>
          ✓ {detectedSize}×{detectedSize}
        </span>
      )}
    </div>
  );
}
