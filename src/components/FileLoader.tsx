import type { LevelData } from "../types";

interface Props {
  onLoad: (level: LevelData) => void;
}

export default function FileLoader({ onLoad }: Props) {
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24
      }}
    >
      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px 18px",
          borderRadius: 8,
          backgroundColor: "#1976d2",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)"
        }}
      >
        Pálya betöltése
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
}

