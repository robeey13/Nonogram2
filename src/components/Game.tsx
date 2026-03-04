import { useState, useEffect } from "react";
import type { LevelData } from "../types";
import FileLoader from "./FileLoader";

type PlayerCell = 0 | 1 | 2; 
type PlayerGrid = PlayerCell[][];

export default function Game() {
  const [level, setLevel] = useState<LevelData | null>(null);
  const [playerGrid, setPlayerGrid] = useState<PlayerGrid>([]);
  const [lives, setLives] = useState(3);
  const [gameWon, setGameWon] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const handleLevelLoad = (loadedLevel: LevelData) => {
    setLevel(loadedLevel);
    const emptyGrid: PlayerGrid = Array.from(
      { length: loadedLevel.size },
      () => Array(loadedLevel.size).fill(0)
    );
    setPlayerGrid(emptyGrid);
    setLives(3);
    setGameWon(false);
    setElapsedSeconds(0);
    setTimerActive(true);
  };

  const resetGame = () => {
    setLevel(null);
    setPlayerGrid([]);
    setLives(3);
    setGameWon(false);
    setElapsedSeconds(0);
    setTimerActive(false);
  };

  useEffect(() => {
    if (!level) return;
    if (!timerActive || lives === 0 || gameWon) return;

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [level, timerActive, lives, gameWon]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (!level) {
    return <FileLoader onLoad={handleLevelLoad} />;
  }

  const updateCell = (row: number, col: number, value: PlayerCell) => {
    setPlayerGrid((prev) =>
      prev.map((r, rIndex) =>
        r.map((c, cIndex) =>
          rIndex === row && cIndex === col ? value : c
        )
      )
    );
  };

  const handleLeftClick = (row: number, col: number) => {
    if (!level || lives === 0 || gameWon) return;
    
    const current = playerGrid[row][col];
    const solution = level.grid[row][col];
    
    if (current === 2) return;
    
    if (solution === 1) {
      updateCell(row, col, current === 1 ? 0 : 1);
    }

    else if (solution === 0) {
      updateCell(row, col, 2);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setTimerActive(false);
      }
    }
  };

  const handleRightClick = (
    e: React.MouseEvent,
    row: number,
    col: number
  ) => {
    e.preventDefault();
    if (!level || lives === 0 || gameWon) return;
    const current = playerGrid[row][col];
    updateCell(row, col, current === 2 ? 0 : 2);
  };

  const checkWin = () => {
    if (!level) return;

    for (let r = 0; r < level.size; r++) {
      for (let c = 0; c < level.size; c++) {
        const solution = level.grid[r][c];
        const player = playerGrid[r][c];

        if (
          (solution === 1 && player !== 1) ||
          (solution === 0 && player === 1)
        ) {
          alert("Még nem jó!");
          return;
        }
      }
    }

    setGameWon(true);
    setTimerActive(false);
  };

  const cellSize = 32;
  const maxHintLen = Math.ceil(level.size / 2);
  const hintWidth = maxHintLen * cellSize;
  const hintHeight = maxHintLen * cellSize;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          maxWidth: 900,
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: lives === 0 ? "red" : gameWon ? "green" : "black",
            }}
          >
            Életek: {lives}
          </div>
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>
            Idő: {formatTime(elapsedSeconds)}
          </div>
          <button
            onClick={checkWin}
            disabled={lives === 0 || gameWon}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              backgroundColor: lives === 0 || gameWon ? "#ccc" : "#1976d2",
              color: "white",
              cursor: lives === 0 || gameWon ? "default" : "pointer",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            Ellenőrzés
          </button>
          {(lives === 0 || gameWon) && (
            <button
              onClick={resetGame}
              style={{
                padding: "10px 18px",
                borderRadius: 8,
                border: "none",
                backgroundColor: "#388e3c",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              Új játék
            </button>
          )}
        </div>
      </div>

      {lives === 0 && (
        <div style={{ color: "red", fontWeight: "bold" }}>Játék vége!</div>
      )}
      {gameWon && (
        <div style={{ color: "green", fontWeight: "bold" }}>Nyertél! 🎉</div>
      )}

      <div
        style={{
          display: "grid",
          justifyContent: "center",
          gridTemplateColumns: `${hintWidth}px ${level.size * cellSize}px`,
          gridTemplateRows: `${level.size * cellSize}px ${hintHeight}px`,
          marginTop: 8,
          marginInline: "auto",
        }}
      >
          {/* Row hints (left side) */}
          <div
            style={{
              width: hintWidth,
              height: level.size * cellSize,
              display: "flex",
              flexDirection: "column"
            }}
          >
            {level.rowHints.map((h, i) => (
              <div
                key={i}
                style={{
                  height: cellSize,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: 4
                }}
              >
                {Array.from({ length: maxHintLen }).map((_, idx) => {
                  const valueIndex = idx - (maxHintLen - h.length);
                  const val = valueIndex >= 0 ? h[valueIndex] : null;
                  return (
                    <div
                      key={idx}
                      style={{ width: cellSize, textAlign: "center" }}
                    >
                      {val ?? ""}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Main grid (top-right) */}
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${level.size}, ${cellSize}px)`
              }}
            >
              {playerGrid.map((row, rIndex) =>
                row.map((cell, cIndex) => (
                  <div
                    key={`${rIndex}-${cIndex}`}
                    onClick={() => handleLeftClick(rIndex, cIndex)}
                    onContextMenu={(e) =>
                      handleRightClick(e, rIndex, cIndex)
                    }
                    style={{
                      width: cellSize,
                      height: cellSize,
                      boxSizing: "border-box",
                      border: "1px solid black",
                      backgroundColor:
                        cell === 1
                          ? "black"
                          : cell === 2
                          ? "#ddd"
                          : "white",
                      cursor: "pointer",
                      position: "relative"
                    }}
                  >
                    {cell === 2 && (
                      <span
                        style={{
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          color: "red",
                          fontWeight: "bold",
                          fontSize: "18px"
                        }}
                      >
                        ×
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ width: hintWidth, height: hintHeight }} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${level.size}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${maxHintLen}, ${cellSize}px)`
            }}
          >
            {Array.from({ length: maxHintLen }).map((_, r) =>
              level.columnHints.map((col, c) => {
                const val = r < col.length ? col[r] : null;
                return (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
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
  );
}
