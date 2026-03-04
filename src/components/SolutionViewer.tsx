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
      <div>
        <p>Válassz egy picross JSON fájlt a megoldás megtekintéséhez:</p>
        <FileLoader onLoad={handleLevelLoad} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={reset}>Másik fájl betöltése</button>
        <span style={{ color: "#666" }}>Méret: {level.size}×{level.size}</span>
      </div>

      <h3>Az eredeti kép rekonstrukciója:</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${level.size}, 30px)`,
          border: "2px solid #333",
          width: "fit-content",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}
      >
        {level.grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              style={{
                width: 30,
                height: 30,
                backgroundColor: cell === 1 ? "black" : "white",
                border: "1px solid #eee"
              }}
            />
          ))
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <h4>További információk:</h4>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px" }}>
          <strong>Sorok tippjei:</strong>
          <span>{level.rowHints.length} sor</span>
          <strong>Oszlopok tippjei:</strong>
          <span>{level.columnHints.length} oszlop</span>
          <strong>Összes kitöltött cella:</strong>
          <span>
            {level.grid.flat().filter(cell => cell === 1).length} / {level.size * level.size}
          </span>
        </div>
      </div>
    </div>
  );
}
