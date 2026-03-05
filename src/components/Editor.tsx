import { useState, useEffect, useRef } from "react";
import type { Grid, LevelData } from "../types";
import GridView from "./GridView";
import Controls from "./Controls";
import ImageLoader from "./ImageLoader";
import { calculateRowHints, calculateColumnHints } from "../utils/hints";

function createEmptyGrid(size: number): Grid {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 0)
  );
}

export default function Editor() {
  const [size, setSize] = useState(5);
  const [grid, setGrid] = useState<Grid>(() => createEmptyGrid(5));
  const [cursor, setCursor] = useState<[number, number]>([0, 0]);
  const [gamepadConnected, setGamepadConnected] = useState(false);

  const cursorRef = useRef<[number, number]>([0, 0]);
  const sizeRef = useRef(5);
  const gridRef = useRef<Grid>(createEmptyGrid(5));
  const lastMoveTime = useRef(0);
  const lastButtonTime = useRef<Record<number, number>>({});

  useEffect(() => { cursorRef.current = cursor; }, [cursor]);
  useEffect(() => { sizeRef.current = size; }, [size]);
  useEffect(() => { gridRef.current = grid; }, [grid]);

  const rowHints = calculateRowHints(grid);
  const columnHints = calculateColumnHints(grid);

  function toggleCell(row: number, col: number) {
    setGrid(prev =>
      prev.map((r, ri) =>
        r.map((c, ci) =>
          ri === row && ci === col ? (c === 1 ? 0 : 1) : c
        )
      )
    );
  }

  function resize(newSize: number) {
    setSize(newSize);
    setGrid(createEmptyGrid(newSize));
    setCursor([0, 0]);
  }

  function randomize() {
    setGrid(
      Array.from({ length: size }, () =>
        Array.from({ length: size }, () => (Math.random() > 0.5 ? 1 : 0))
      )
    );
  }

  function save() {
    const data: LevelData = {
      size,
      grid,
      rowHints,
      columnHints
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "picross-level.json";
    a.click();
  }

  function handleImageLoad(loadedGrid: Grid, loadedSize: number) {
    setSize(loadedSize);
    setGrid(loadedGrid);
    setCursor([0, 0]);
  }

  useEffect(() => {
    const checkGamepad = () => {
      const gp = navigator.getGamepads()[0];
      setGamepadConnected(!!gp);
    };
    const onConnect = () => setGamepadConnected(true);
    const onDisconnect = () => setGamepadConnected(false);
    window.addEventListener("gamepadconnected", onConnect);
    window.addEventListener("gamepaddisconnected", onDisconnect);
    checkGamepad();
    return () => {
      window.removeEventListener("gamepadconnected", onConnect);
      window.removeEventListener("gamepaddisconnected", onDisconnect);
    };
  }, []);

  useEffect(() => {
    let rafId: number;

    const loop = (now: number) => {
      const gp = navigator.getGamepads()[0];
      if (gp) {
        const s = sizeRef.current;
        const axisX = gp.axes[0] ?? 0;
        const axisY = gp.axes[1] ?? 0;
        const dLeft  = gp.buttons[14]?.pressed || axisX < -0.5;
        const dRight = gp.buttons[15]?.pressed || axisX >  0.5;
        const dUp    = gp.buttons[12]?.pressed || axisY < -0.5;
        const dDown  = gp.buttons[13]?.pressed || axisY >  0.5;

        if ((dLeft || dRight || dUp || dDown) && now - lastMoveTime.current > 150) {
          lastMoveTime.current = now;
          setCursor(([r, c]) => {
            if (dLeft)  return [r, Math.max(0, c - 1)];
            if (dRight) return [r, Math.min(s - 1, c + 1)];
            if (dUp)    return [Math.max(0, r - 1), c];
            return [Math.min(s - 1, r + 1), c];
          });
        }

        const isPressed = (btn: number, delay = 300) => {
          const p = gp.buttons[btn]?.pressed;
          if (p && now - (lastButtonTime.current[btn] ?? 0) > delay) {
            lastButtonTime.current[btn] = now;
            return true;
          }
          return false;
        };

        if (isPressed(0)) {
          const [r, c] = cursorRef.current;
          setGrid(prev =>
            prev.map((row, ri) =>
              row.map((cell, ci) =>
                ri === r && ci === c ? (cell === 1 ? 0 : 1) : cell
              )
            )
          );
        }

        if (isPressed(3)) {
          setGrid(
            Array.from({ length: sizeRef.current }, () =>
              Array.from({ length: sizeRef.current }, () => (Math.random() > 0.5 ? 1 : 0))
            )
          );
        }

        if (isPressed(9, 500)) {
          const s = sizeRef.current;
          const g = gridRef.current;
          const rh = calculateRowHints(g);
          const ch = calculateColumnHints(g);
          const data: LevelData = { size: s, grid: g, rowHints: rh, columnHints: ch };
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "picross-level.json";
          a.click();
        }
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const cellSize = grid.length <= 10 ? 32 : grid.length <= 15 ? 26 : 22;
  const maxHintLen = Math.ceil(grid.length / 2);
  const hintWidth = maxHintLen * cellSize;
  const hintHeight = maxHintLen * cellSize;

  return (
    <>
      <ImageLoader onLoad={handleImageLoad} />

      {gamepadConnected && (
        <div className="controller-help" style={{ marginBottom: 15 }}>
          <div className="controller-help-item">
            <span className="key">D-pad</span>
            <span>Mozgas</span>
          </div>
          <div className="controller-help-item">
            <span className="key" style={{ color: "#00ff88" }}>A</span>
            <span>Rajzolás</span>
          </div>
          <div className="controller-help-item">
            <span className="key" style={{ color: "#ffff00" }}>Y</span>
            <span>Véletlen</span>
          </div>
          <div className="controller-help-item">
            <span className="key" style={{ color: "#ff3366" }}>B</span>
            <span>Vissza</span>
          </div>
        </div>
      )}
      
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12
        }}
      >
        <Controls onResize={resize} onRandom={randomize} onSave={save} />

        <div className="arcade-grid-container" style={{ overflow: "auto", maxWidth: "100%" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `${hintWidth}px ${grid.length * cellSize}px`,
              gridTemplateRows: `${grid.length * cellSize}px ${hintHeight}px`,
              gap: 2
            }}
          >
            <div style={{ width: hintWidth, height: grid.length * cellSize, display: "flex", flexDirection: "column" }}>
              {rowHints.map((h, i) => (
                <div
                  key={i}
                  style={{
                    height: cellSize,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: 4,
                    borderBottom: (i + 1) % 5 === 0 ? "2px solid #2a2a4a" : undefined
                  }}
                >
                  {Array.from({ length: maxHintLen }).map((_, idx) => {
                    const valueIndex = idx - (maxHintLen - h.length);
                    const val = valueIndex >= 0 ? h[valueIndex] : null;
                    return (
                      <div 
                        key={idx} 
                        className="hint-number"
                        style={{ 
                          width: cellSize, 
                          textAlign: "center",
                          fontSize: cellSize <= 22 ? 8 : 10,
                          color: val ? "#ff00ff" : "transparent"
                        }}
                      >
                        {val ?? ""}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div>
              <GridView grid={grid} onToggleCell={toggleCell} cursor={gamepadConnected ? cursor : undefined} cellSize={cellSize} />
            </div>

            <div style={{ width: hintWidth, height: hintHeight }} />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${grid.length}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${maxHintLen}, ${cellSize}px)`
              }}
            >
              {Array.from({ length: maxHintLen }).map((_, r) =>
                columnHints.map((col, c) => {
                  const val = r < col.length ? col[r] : null;
                  return (
                    <div
                      key={`${r}-${c}`}
                      className="hint-number"
                      style={{
                        width: cellSize,
                        height: cellSize,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: cellSize <= 22 ? 8 : 10,
                        borderRight: (c + 1) % 5 === 0 && c !== grid.length - 1 ? "2px solid #2a2a4a" : undefined,
                        color: val ? "#ff00ff" : "transparent"
                      }}
                    >
                      {val ?? ""}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
