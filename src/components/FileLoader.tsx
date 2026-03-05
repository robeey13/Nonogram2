import { useEffect, useRef, useState } from "react";
import type { LevelData } from "../types";

interface Props {
  onLoad: (level: LevelData) => void;
}

export default function FileLoader({ onLoad }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const lastButtonTime = useRef(0);

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
        const aPressed = gp.buttons[0]?.pressed;
        if (aPressed && now - lastButtonTime.current > 500) {
          lastButtonTime.current = now;
          inputRef.current?.click();
        }
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const json = JSON.parse(
          event.target?.result as string
        ) as LevelData;

        if (!json.size || !json.grid) {
          alert("Hibás JSON fájl!");
          return;
        }

        onLoad(json);
      } catch {
        alert("Nem érvényes JSON!");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="arcade-file-loader">
      <div style={{ 
        textAlign: "center", 
        marginBottom: 20,
        color: "#ff00ff",
        textShadow: "0 0 10px #ff00ff"
      }}>
        <div style={{ fontSize: 24, marginBottom: 10, color: "#00ff88" }}>[LOAD]</div>
        <div className="insert-coin">Insert Level</div>
      </div>
      
      <label style={{ cursor: "pointer" }}>
        Palya Betoltese
        <input
          ref={inputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
        />
      </label>
      
      <div style={{ 
        marginTop: 20, 
        fontSize: 8, 
        color: "#666",
        textAlign: "center"
      }}>
        {gamepadConnected 
          ? "Nyomj A gombot a fájl kiválasztásához" 
          : "Válassz egy .json pálya fájlt"}
      </div>

      {gamepadConnected && (
        <div className="controller-status connected" style={{ marginTop: 15 }}>
          Kontroller csatlakozva
        </div>
      )}
    </div>
  );
}

