import type { Grid } from "../types";

interface Props {
  grid: Grid;
  onToggleCell: (row: number, col: number) => void;
  cursor?: [number, number];
}

export default function GridView({ grid, onToggleCell, cursor }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${grid.length}, 30px)` }}>
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const isCursor = cursor != null && cursor[0] === r && cursor[1] === c;
          return (
            <div
              key={`${r}-${c}`}
              onClick={() => onToggleCell(r, c)}
              style={{
                width: 30,
                height: 30,
                boxSizing: "border-box",
                border: isCursor ? "3px solid #2196f3" : "1px solid black",
                backgroundColor: cell ? "black" : isCursor ? "#e3f2fd" : "white",
                cursor: "pointer",
                zIndex: isCursor ? 1 : undefined,
                position: "relative"
              }}
            />
          );
        })
      )}
    </div>
  );
}
