import { useState, useEffect, useRef, useCallback } from "react";
import type { LevelData } from "../types";
import FileLoader from "./FileLoader";

type PlayerCell = 0 | 1 | 2;
type PlayerGrid = PlayerCell[][];

export default function Game() {
  const [level, setLevel] = useState<LevelData | null>(null);
  const [playerGrid, setPlayerGrid] = useState<PlayerGrid>([]);
  const [lives, setLives] = useState(3);
  const [gameWon, setGameWon] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [hintCell, setHintCell] = useState<[number, number] | null>(null);
  const [cursor, setCursor] = useState<[number, number]>([0, 0]);
  const [gamepadConnected, setGamepadConnected] = useState(false);

  const rafRef = useRef<number | null>(null);
  const lastMoveTime = useRef(0);
  const lastButtonTime = useRef<Record<number, number>>({});
  const levelRef = useRef<LevelData | null>(null);
  const livesRef = useRef(3);
  const gameWonRef = useRef(false);
  const playerGridRef = useRef<PlayerCell[][]>([]);
  const hintsLeftRef = useRef(3);
  const cursorRef = useRef<[number, number]>([0, 0]);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { gameWonRef.current = gameWon; }, [gameWon]);
  useEffect(() => { playerGridRef.current = playerGrid; }, [playerGrid]);
  useEffect(() => { hintsLeftRef.current = hintsLeft; }, [hintsLeft]);
  useEffect(() => { cursorRef.current = cursor; }, [cursor]);

  const handleLevelLoad = (loadedLevel: LevelData) => {
    setLevel(loadedLevel);
    setPlayerGrid(Array.from({ length: loadedLevel.size }, () => Array(loadedLevel.size).fill(0)));
    setLives(3);
    setGameWon(false);
    setHintsLeft(3);
    setHintCell(null);
    setCursor([0, 0]);
  };

  const resetGame = () => {
    setLevel(null);
    setPlayerGrid([]);
    setLives(3);
    setGameWon(false);
    setHintsLeft(3);
    setHintCell(null);
    setCursor([0, 0]);
  };

  useEffect(() => {
    const onConnect = () => setGamepadConnected(true);
    const onDisconnect = () => setGamepadConnected(false);
    window.addEventListener("gamepadconnected", onConnect);
    window.addEventListener("gamepaddisconnected", onDisconnect);
    return () => {
      window.removeEventListener("gamepadconnected", onConnect);
      window.removeEventListener("gamepaddisconnected", onDisconnect);
    };
  }, []);

  const isButtonPressed = useCallback((btnIndex: number, now: number, delay = 200) => {
    const gp = navigator.getGamepads()[0];
    if (!gp) return false;
    const pressed = gp.buttons[btnIndex]?.pressed;
    if (pressed && now - (lastButtonTime.current[btnIndex] ?? 0) > delay) {
      lastButtonTime.current[btnIndex] = now;
      return true;
    }
    return false;
  }, []);

  const applyCell = useCallback((r: number, c: number) => {
    const lv = levelRef.current;
    const pg = playerGridRef.current;
    if (!lv || livesRef.current === 0 || gameWonRef.current) return;
    if (pg[r][c] === 2) return;
    if (lv.grid[r][c] === 1) {
      setPlayerGrid(prev => prev.map((row, ri) =>
        row.map((cell, ci) => ri === r && ci === c ? (cell === 1 ? 0 : 1) as PlayerCell : cell)
      ));
    } else {
      setPlayerGrid(prev => prev.map((row, ri) =>
        row.map((cell, ci) => ri === r && ci === c ? 2 : cell)
      ));
      setLives(prev => prev - 1);
    }
  }, []);

  const toggleMark = useCallback((r: number, c: number) => {
    if (livesRef.current === 0 || gameWonRef.current) return;
    setPlayerGrid(prev => prev.map((row, ri) =>
      row.map((cell, ci) =>
        ri === r && ci === c ? (cell === 2 ? 0 : 2) as PlayerCell : cell
      )
    ));
  }, []);

  useEffect(() => {
    const loop = (now: number) => {
      const gp = navigator.getGamepads()[0];
      if (gp && levelRef.current) {
        const size = levelRef.current.size;
        const moveDelay = 150;
        const axisX = gp.axes[0] ?? 0;
        const axisY = gp.axes[1] ?? 0;
        const dUp    = gp.buttons[12]?.pressed || axisY < -0.5;
        const dDown  = gp.buttons[13]?.pressed || axisY >  0.5;
        const dLeft  = gp.buttons[14]?.pressed || axisX < -0.5;
        const dRight = gp.buttons[15]?.pressed || axisX >  0.5;

        if ((dUp || dDown || dLeft || dRight) && now - lastMoveTime.current > moveDelay) {
          lastMoveTime.current = now;
          const [r, c] = cursorRef.current;
          let nr = r, nc = c;
          if (dUp)    nr = Math.max(0, r - 1);
          if (dDown)  nr = Math.min(size - 1, r + 1);
          if (dLeft)  nc = Math.max(0, c - 1);
          if (dRight) nc = Math.min(size - 1, c + 1);
          setCursor([nr, nc]);
        }

        if (isButtonPressed(0, now)) {
          const [r, c] = cursorRef.current;
          applyCell(r, c);
        }

        if (isButtonPressed(1, now)) {
          const [r, c] = cursorRef.current;
          toggleMark(r, c);
        }

        if (isButtonPressed(3, now, 400)) {
          if (hintsLeftRef.current > 0 && !gameWonRef.current && livesRef.current > 0) {
            const lv = levelRef.current;
            const pg = playerGridRef.current;
            const candidates: [number, number][] = [];
            for (let r = 0; r < lv.size; r++)
              for (let c = 0; c < lv.size; c++)
                if (lv.grid[r][c] === 1 && pg[r][c] !== 1)
                  candidates.push([r, c]);
            if (candidates.length > 0) {
              const pick = candidates[Math.floor(Math.random() * candidates.length)];
              setHintsLeft(prev => prev - 1);
              setHintCell(pick);
              setTimeout(() => setHintCell(null), 2000);
            }
          }
        }

        if (isButtonPressed(9, now, 500)) {
          const lv = levelRef.current;
          const pg = playerGridRef.current;
          let correct = true;
          outer: for (let r = 0; r < lv.size; r++)
            for (let c = 0; c < lv.size; c++)
              if ((lv.grid[r][c] === 1 && pg[r][c] !== 1) || (lv.grid[r][c] === 0 && pg[r][c] === 1)) {
                correct = false; break outer;
              }
          if (correct) setGameWon(true);
          else alert("Még nem jó!");
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isButtonPressed, applyCell, toggleMark]);

  if (!level) {
    return <FileLoader onLoad={handleLevelLoad} />;
  }

  const updateCell = (row: number, col: number, value: PlayerCell) => {
    setPlayerGrid(prev =>
      prev.map((r, ri) => r.map((c, ci) => ri === row && ci === col ? value : c))
    );
  };

  const handleLeftClick = (row: number, col: number) => {
    if (lives === 0 || gameWon) return;
    const current = playerGrid[row][col];
    const solution = level.grid[row][col];
    if (current === 2) return;
    if (solution === 1) {
      updateCell(row, col, current === 1 ? 0 : 1);
    } else {
      updateCell(row, col, 2);
      setLives(prev => prev - 1);
    }
  };

  const handleRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (lives === 0 || gameWon) return;
    updateCell(row, col, playerGrid[row][col] === 2 ? 0 : 2);
  };

  const useHint = () => {
    if (hintsLeft === 0 || gameWon || lives === 0) return;
    const candidates: [number, number][] = [];
    for (let r = 0; r < level.size; r++)
      for (let c = 0; c < level.size; c++)
        if (level.grid[r][c] === 1 && playerGrid[r][c] !== 1)
          candidates.push([r, c]);
    if (candidates.length === 0) return;
    const [r, c] = candidates[Math.floor(Math.random() * candidates.length)];
    setHintsLeft(prev => prev - 1);
    setHintCell([r, c]);
    setTimeout(() => setHintCell(null), 2000);
  };

  const checkWin = () => {
    for (let r = 0; r < level.size; r++)
      for (let c = 0; c < level.size; c++)
        if ((level.grid[r][c] === 1 && playerGrid[r][c] !== 1) ||
            (level.grid[r][c] === 0 && playerGrid[r][c] === 1)) {
          alert("Még nem jó!");
          return;
        }
    setGameWon(true);
  };

  const cellSize = 30;
  const maxHintLen = Math.ceil(level.size / 2);
  const hintWidth = maxHintLen * cellSize;
  const hintHeight = maxHintLen * cellSize;

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontSize: "18px", fontWeight: "bold", color: lives === 0 ? "red" : gameWon ? "green" : "black" }}>
          Életek: {lives}
        </div>
        <button onClick={checkWin} disabled={lives === 0 || gameWon}>Ellenőrzés</button>
        <button
          onClick={useHint}
          disabled={lives === 0 || gameWon || hintsLeft === 0}
          style={{ backgroundColor: hintsLeft === 1 ? "#ff9800" : undefined }}
        >
          💡 Tipp ({hintsLeft})
        </button>
        {lives === 0 && <div style={{ color: "red", fontWeight: "bold" }}>Játék vége!</div>}
        {gameWon && <div style={{ color: "green", fontWeight: "bold" }}>Nyertél! 🎉</div>}
        {(lives === 0 || gameWon) && (
          <button onClick={resetGame} style={{ marginLeft: "auto" }}>Új játék</button>
        )}
        <div style={{ marginLeft: "auto", fontSize: "0.85em", color: gamepadConnected ? "green" : "#aaa" }}>
          {gamepadConnected ? "🎮 Kontroller csatlakozva" : "🎮 Nincs kontroller"}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `${hintWidth}px ${level.size * cellSize}px`,
          gridTemplateRows: `${level.size * cellSize}px ${hintHeight}px`
        }}
      >
        <div style={{ width: hintWidth, height: level.size * cellSize, display: "flex", flexDirection: "column" }}>
          {level.rowHints.map((h, i) => (
            <div key={i} style={{ height: cellSize, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 4 }}>
              {Array.from({ length: maxHintLen }).map((_, idx) => {
                const valueIndex = idx - (maxHintLen - h.length);
                const val = valueIndex >= 0 ? h[valueIndex] : null;
                return <div key={idx} style={{ width: cellSize, textAlign: "center" }}>{val ?? ""}</div>;
              })}
            </div>
          ))}
        </div>

        <div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${level.size}, ${cellSize}px)` }}>
            {playerGrid.map((row, rIndex) =>
              row.map((cell, cIndex) => {
                const isCursor = gamepadConnected && cursor[0] === rIndex && cursor[1] === cIndex;
                const isHint = hintCell?.[0] === rIndex && hintCell?.[1] === cIndex;
                return (
                  <div
                    key={`${rIndex}-${cIndex}`}
                    onClick={() => handleLeftClick(rIndex, cIndex)}
                    onContextMenu={(e) => handleRightClick(e, rIndex, cIndex)}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      boxSizing: "border-box",
                      border: isCursor ? "2px solid #2196f3" : isHint ? "2px solid #ff9800" : "1px solid black",
                      backgroundColor: isHint ? "#fff3cd" : cell === 1 ? "black" : cell === 2 ? "#ddd" : "white",
                      cursor: "pointer",
                      position: "relative"
                    }}
                  >
                    {cell === 2 && (
                      <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", color: "red", fontWeight: "bold", fontSize: "18px" }}>×</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={{ width: hintWidth, height: hintHeight }} />

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${level.size}, ${cellSize}px)`, gridTemplateRows: `repeat(${maxHintLen}, ${cellSize}px)` }}>
          {Array.from({ length: maxHintLen }).map((_, r) =>
            level.columnHints.map((col, c) => {
              const val = r < col.length ? col[r] : null;
              return (
                <div key={`${r}-${c}`} style={{ width: cellSize, height: cellSize, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {val ?? ""}
                </div>
              );
            })
          )}
        </div>
      </div>

      {gamepadConnected && (
        <div style={{ marginTop: 16, fontSize: "0.85em", color: "#555", display: "flex", gap: 20, flexWrap: "wrap" }}>
          <span>🕹️ <b>D-pad / bal kar</b> – mozgás</span>
          <span>🔵 <b>A</b> – cella kitöltése</span>
          <span>🔴 <b>B</b> – X jelölés</span>
          <span>🟡 <b>Y</b> – tipp</span>
          <span>▶ <b>Start</b> – ellenőrzés</span>
          <span>⬛ <b>Select</b> – vissza a főoldalra</span>
        </div>
      )}
    </div>
  );
}

