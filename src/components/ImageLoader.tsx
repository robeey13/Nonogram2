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
    <div style={{ 
      display: "flex", 
      gap: 12, 
      alignItems: "center", 
      marginBottom: 16,
      padding: "12px 16px",
      background: "#1a1a2e",
      borderRadius: 8,
      border: "1px solid #2a2a4a"
    }}>
      <label 
        htmlFor="image-upload"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          background: "linear-gradient(180deg, #2a2a4a 0%, #1a1a2e 100%)",
          border: "2px solid #ff8800",
          borderRadius: 6,
          color: "#ff8800",
          fontSize: 10,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.5 : 1,
          boxShadow: "0 2px 0 #0a0a0f, 0 0 10px rgba(255, 136, 0, 0.3)",
          transition: "all 0.2s ease"
        }}
      >
        Kep betoltese
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={loading}
          style={{ display: "none" }}
        />
      </label>
      
      {loading && (
        <span style={{ 
          color: "#ffff00", 
          fontSize: 10,
          animation: "blink 1s step-end infinite"
        }}>
          ⏳ Feldolgozás...
        </span>
      )}
      
      {detectedSize && !loading && (
        <span style={{ 
          color: "#00ff88", 
          fontSize: 10,
          textShadow: "0 0 10px #00ff88"
        }}>
          ✓ {detectedSize}×{detectedSize}
        </span>
      )}
    </div>
  );
}
