import { useState } from "react";
import type { LevelData } from "../types";
import FileLoader from "./FileLoader";

export default function SolutionViewer() {
  const [level, setLevel] = useState<LevelData | null>(null);

  const handleLevelLoad = (loadedLevel: LevelData) => {
    setLevel(loadedLevel);
  };

  const reset = () => {
    setLevel(null);
  };

  if (!level) {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#ff00ff", marginBottom: 20 }}>
          Válassz egy picross JSON fájlt a megoldás megtekintéséhez:
        </p>
        <FileLoader onLoad={handleLevelLoad} />
      </div>
    );
  }

  const cellSize = level.size <= 10 ? 24 : level.size <= 15 ? 20 : 16;

  return (
    <div>
      <div style={{ 
        marginBottom: 20, 
        display: "flex", 
        gap: 15, 
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        <button onClick={reset} className="btn-magenta">
          Masik fajl
        </button>
        <div style={{ 
          padding: "8px 16px", 
          background: "#1a1a2e", 
          borderRadius: 6,
          border: "1px solid #2a2a4a",
          color: "#ffff00",
          fontSize: 10
        }}>
          📐 Méret: {level.size}×{level.size}
        </div>
      </div>

      <h3 style={{ 
        color: "#00fff7", 
        textShadow: "0 0 10px #00fff7",
        marginBottom: 15,
        fontSize: 12
      }}>
        Az eredeti kep:
      </h3>
      
      <div className="arcade-grid-container" style={{ width: "fit-content" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${level.size}, ${cellSize}px)`,
            gap: 1
          }}
        >
          {level.grid.map((row, r) =>
            row.map((cell, c) => {
              const borderRight = (c + 1) % 5 === 0 && c !== level.size - 1 ? "2px solid #3a3a5a" : "1px solid #2a2a4a";
              const borderBottom = (r + 1) % 5 === 0 && r !== level.size - 1 ? "2px solid #3a3a5a" : "1px solid #2a2a4a";
              
              return (
                <div
                  key={`${r}-${c}`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    background: cell === 1 
                      ? "linear-gradient(145deg, #00fff7, #008888)" 
                      : "linear-gradient(145deg, #1a1a2e, #12121a)",
                    boxShadow: cell === 1 
                      ? "inset 0 -2px 4px rgba(0, 0, 0, 0.3), 0 0 5px rgba(0, 255, 247, 0.3)"
                      : undefined,
                    borderRight,
                    borderBottom,
                    borderTop: r === 0 ? "1px solid #2a2a4a" : undefined,
                    borderLeft: c === 0 ? "1px solid #2a2a4a" : undefined,
                  }}
                />
              );
            })
          )}
        </div>
      </div>

      <div style={{ 
        marginTop: 24,
        padding: "15px 20px",
        background: "#1a1a2e",
        borderRadius: 10,
        border: "2px solid #2a2a4a"
      }}>
        <h4 style={{ 
          color: "#ff00ff", 
          marginBottom: 15,
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 2
        }}>
          📊 Statisztikák
        </h4>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "auto 1fr", 
          gap: "10px 20px",
          fontSize: 10
        }}>
          <span style={{ color: "#ff00ff" }}>Sorok:</span>
          <span style={{ color: "#00fff7" }}>{level.rowHints.length}</span>
          
          <span style={{ color: "#ff00ff" }}>Oszlopok:</span>
          <span style={{ color: "#00fff7" }}>{level.columnHints.length}</span>
          
          <span style={{ color: "#ff00ff" }}>Kitöltött cellák:</span>
          <span style={{ color: "#ffff00" }}>
            {level.grid.flat().filter(cell => cell === 1).length} / {level.size * level.size}
          </span>
        </div>
      </div>
    </div>
  );
}
