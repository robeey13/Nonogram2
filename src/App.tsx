import { useState, useEffect, useRef } from "react";
import Editor from "./components/Editor";
import Game from "./components/Game";
import SolutionViewer from "./components/SolutionViewer";

type Screen = "menu" | "editor" | "game" | "solution";

const MENU_ITEMS: { screen: Screen; label: string }[] = [
  { screen: "editor", label: "Pálya készítés" },
  { screen: "game", label: "Játék indítása" },
  { screen: "solution", label: "Megoldás megtekintése" },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [menuIndex, setMenuIndex] = useState(0);
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const lastButtonTime = useRef<Record<number, number>>({});
  const lastMoveTime = useRef(0);

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

  useEffect(() => {
    if (screen !== "menu") return;

    let rafId: number;

    const loop = (now: number) => {
      const gp = navigator.getGamepads()[0];
      if (gp) {
        const axisY = gp.axes[1] ?? 0;
        const dUp   = gp.buttons[12]?.pressed || axisY < -0.5;
        const dDown = gp.buttons[13]?.pressed || axisY >  0.5;

        if ((dUp || dDown) && now - lastMoveTime.current > 200) {
          lastMoveTime.current = now;
          setMenuIndex(prev => {
            if (dUp) return Math.max(0, prev - 1);
            return Math.min(MENU_ITEMS.length - 1, prev + 1);
          });
        }

        const aPressed = gp.buttons[0]?.pressed;
        if (aPressed && now - (lastButtonTime.current[0] ?? 0) > 400) {
          lastButtonTime.current[0] = now;
          setScreen(MENU_ITEMS[menuIndex].screen);
        }
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [screen, menuIndex]);

  useEffect(() => {
    if (screen === "menu") return;

    let rafId: number;
    const backButtonTime = { val: 0 };

    const loop = (now: number) => {
      const gp = navigator.getGamepads()[0];
      if (gp) {
        const selectPressed = gp.buttons[8]?.pressed;
        const bPressed = (screen === "editor" || screen === "solution") && gp.buttons[1]?.pressed;
        if ((selectPressed || bPressed) && now - backButtonTime.val > 500) {
          backButtonTime.val = now;
          setScreen("menu");
        }
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [screen]);

  if (screen === "editor") {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={() => setScreen("menu")}>Vissza a főoldalra</button>
        <h1>Picross pályaszerkesztő</h1>
        <Editor />
      </div>
    );
  }

  if (screen === "game") {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={() => setScreen("menu")}>Vissza a főoldalra</button>
        <h1>Picross játék</h1>
        <Game />
      </div>
    );
  }

  if (screen === "solution") {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={() => setScreen("menu")}>Vissza a főoldalra</button>
        <h1>Megoldás megtekintése</h1>
        <SolutionViewer />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "flex-start"
      }}
    >
      <h1>Picross</h1>
      <p>Válaszd ki, mit szeretnél csinálni:</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {MENU_ITEMS.map((item, i) => (
          <button
            key={item.screen}
            onClick={() => setScreen(item.screen)}
            style={{
              outline: gamepadConnected && i === menuIndex ? "3px solid #2196f3" : undefined,
              outlineOffset: 2,
              background: gamepadConnected && i === menuIndex ? "#e3f2fd" : undefined,
              fontWeight: gamepadConnected && i === menuIndex ? "bold" : undefined,
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
