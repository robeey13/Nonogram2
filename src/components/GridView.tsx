import type { Grid } from "../types";

interface Props {
  grid: Grid;
  onToggleCell: (row: number, col: number) => void;
  cursor?: [number, number];
  cellSize?: number;
}

export default function GridView({ grid, onToggleCell, cursor, cellSize = 32 }: Props) {
  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: `repeat(${grid.length}, ${cellSize}px)` 
    }}>
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const isCursor = cursor != null && cursor[0] === r && cursor[1] === c;
          const isFilled = cell === 1;
          
          const borderRight = (c + 1) % 5 === 0 && c !== grid.length - 1 ? "2px solid #3a3a5a" : "1px solid #2a2a4a";
          const borderBottom = (r + 1) % 5 === 0 && r !== grid.length - 1 ? "2px solid #3a3a5a" : "1px solid #2a2a4a";
          
          return (
            <div
              key={`${r}-${c}`}
              onClick={() => onToggleCell(r, c)}
              className={`arcade-cell ${isFilled ? 'filled' : ''} ${isCursor ? 'cursor' : ''}`}
              style={{
                width: cellSize,
                height: cellSize,
                boxSizing: "border-box",
                borderRight,
                borderBottom,
                borderTop: r === 0 ? "1px solid #2a2a4a" : "1px solid transparent",
                borderLeft: c === 0 ? "1px solid #2a2a4a" : "1px solid transparent",
                cursor: "pointer",
                zIndex: isCursor ? 10 : undefined,
                position: "relative",
                outline: isCursor ? "3px solid #ffff00" : undefined,
                outlineOffset: "-3px",
                background: isFilled 
                  ? "linear-gradient(145deg, #00fff7, #008888)" 
                  : "linear-gradient(145deg, #1a1a2e, #12121a)",
                boxShadow: isCursor 
                  ? "0 0 15px rgba(255, 255, 0, 0.5), inset 0 0 10px rgba(255, 255, 0, 0.2)"
                  : isFilled 
                    ? "inset 0 -2px 4px rgba(0, 0, 0, 0.3), 0 0 10px rgba(0, 255, 247, 0.5)"
                    : undefined,
                transition: "all 0.1s ease"
              }}
            />
          );
        })
      )}
    </div>
  );
}
