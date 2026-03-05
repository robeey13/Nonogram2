interface Props {
  onResize: (size: number) => void;
  onRandom: () => void;
  onSave: () => void;
}

export default function Controls({ onResize, onRandom, onSave }: Props) {
  return (
    <div style={{ 
      marginBottom: 16, 
      display: "flex", 
      gap: 10, 
      flexWrap: "wrap",
      padding: "15px 20px",
      background: "#1a1a2e",
      borderRadius: 10,
      border: "2px solid #2a2a4a"
    }}>
      <div style={{ 
        display: "flex", 
        gap: 8,
        padding: "8px 12px",
        background: "#12121a",
        borderRadius: 6,
        border: "1px solid #2a2a4a"
      }}>
        <span style={{ 
          color: "#ff00ff", 
          fontSize: 8, 
          alignSelf: "center",
          marginRight: 8
        }}>
          MÉRET:
        </span>
        {[5, 10, 15, 20].map(size => (
          <button 
            key={size} 
            onClick={() => onResize(size)}
            style={{ padding: "8px 12px", fontSize: 9 }}
          >
            {size}×{size}
          </button>
        ))}
      </div>

      <button onClick={onRandom} className="btn-yellow">
        Random
      </button>
      <button onClick={onSave} className="btn-green">
        Mentes
      </button>
    </div>
  );
}
