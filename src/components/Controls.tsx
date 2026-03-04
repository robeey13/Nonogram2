interface Props {
  onResize: (size: number) => void;
  onRandom: () => void;
  onSave: () => void;
}

export default function Controls({ onResize, onRandom, onSave }: Props) {
  return (
    <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
      {[5, 10, 15, 20].map(size => (
        <button key={size} onClick={() => onResize(size)}>
          {size}x{size}
        </button>
      ))}

      <button onClick={onRandom} style={{ backgroundColor: "green", color: "white" }}>Random</button>
      <button onClick={onSave} style={{ backgroundColor: "green", color: "white" }}>Mentés</button>
    </div>
  );
}
