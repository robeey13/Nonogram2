import { useState, useEffect, useRef } from "react";
import Editor from "./components/Editor";
import Game from "./components/Game";
import SolutionViewer from "./components/SolutionViewer";

type Screen = "menu" | "editor" | "game" | "solution";

const MENU_ITEMS: { screen: Screen; label: string; icon: string }[] = [
  { screen: "editor", label: "Palya keszites", icon: "" },
  { screen: "game", label: "Jatek inditasa", icon: "" },
  { screen: "solution", label: "Megoldas megtekintese", icon: "" },
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

  const renderBackButton = () => (
    <button 
      onClick={() => setScreen("menu")}
      className="btn-magenta"
      style={{ marginBottom: 20 }}
    >
      ◀ Vissza
    </button>
  );

  if (screen === "editor") {
    return (
      <div className="arcade-frame" style={{ maxWidth: 900, width: "100%" }}>
        {renderBackButton()}
        <h1>Palya Keszito</h1>
        <Editor />
      </div>
    );
  }

  if (screen === "game") {
    return (
      <div className="arcade-frame" style={{ maxWidth: 900, width: "100%" }}>
        {renderBackButton()}
        <h1>Picross Arcade</h1>
        <Game />
      </div>
    );
  }

  if (screen === "solution") {
    return (
      <div className="arcade-frame" style={{ maxWidth: 900, width: "100%" }}>
        {renderBackButton()}
        <h1>Megoldas</h1>
        <SolutionViewer />
      </div>
    );
  }

  return (
    <div className="arcade-frame" style={{ minWidth: 400 }}>
      <div className="arcade-bolt" style={{ top: 15, left: 15 }} />
      <div className="arcade-bolt" style={{ top: 15, right: 15 }} />
      <div className="arcade-bolt" style={{ bottom: 15, left: 15 }} />
      <div className="arcade-bolt" style={{ bottom: 15, right: 15 }} />
      
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1 style={{ marginBottom: 10 }}>PICROSS</h1>
        <div style={{ 
          fontSize: 10, 
          color: "#ff00ff", 
          textShadow: "0 0 10px #ff00ff",
          letterSpacing: 3
        }}>
          ★ ARCADE EDITION ★
        </div>
      </div>
      
      <div className="arcade-menu">
        {MENU_ITEMS.map((item, i) => {
          const isSelected = gamepadConnected && i === menuIndex;
          return (
            <div 
              key={item.screen} 
              className={`menu-item ${isSelected ? "selected" : ""}`}
            >
              <button
                onClick={() => setScreen(item.screen)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  justifyContent: "center",
                  borderColor: isSelected ? "#ffff00" : undefined,
                  color: isSelected ? "#ffff00" : undefined,
                  boxShadow: isSelected 
                    ? "0 4px 0 #0a0a0f, 0 0 25px rgba(255, 255, 0, 0.5), inset 0 -2px 10px rgba(0, 0, 0, 0.3)"
                    : undefined
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span>{item.label}</span>
                {isSelected && <span style={{ marginLeft: "auto" }}>◀</span>}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: 30 }}>
        <div className="insert-coin">
          {gamepadConnected ? "Nyomd meg az A gombot" : "Kattints a valasztashoz"}
        </div>
      </div>

      <div style={{ 
        marginTop: 20, 
        textAlign: "center" 
      }}>
        <div className={`controller-status ${gamepadConnected ? "connected" : "disconnected"}`}>
          {gamepadConnected ? "Kontroller csatlakozva" : "Nincs kontroller"}
        </div>
      </div>

      <div style={{ 
        marginTop: 30, 
        textAlign: "center",
        fontSize: 8,
        color: "#666",
        letterSpacing: 1
      }}>
        Csuka Róbert Kristóf, Mideczki Ádám, <br></br> Bődi Zoltán (Főnök) - 2026
      </div>
    </div>
  );
}
