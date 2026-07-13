interface ConstellationProps {
  className?: string;
  opacity?: number;
}

/** Faint constellation of connected nodes — a network-of-people motif. */
const NODES: ReadonlyArray<{ x: number; y: number; gold?: boolean }> = [
  { x: 40, y: 64 },
  { x: 128, y: 28 },
  { x: 214, y: 86, gold: true },
  { x: 312, y: 44 },
  { x: 372, y: 128 },
  { x: 286, y: 168 },
  { x: 188, y: 214 },
  { x: 86, y: 156 },
  { x: 150, y: 122, gold: true },
  { x: 344, y: 232 },
];

const EDGES: ReadonlyArray<[number, number]> = [
  [0, 1],
  [1, 8],
  [8, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 0],
  [8, 5],
  [5, 9],
  [2, 6],
];

export default function Constellation({ className = '', opacity = 0.55 }: ConstellationProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 280"
      className={`pointer-events-none ${className}`}
      style={{ opacity }}
    >
      {EDGES.map(([a, b]) => {
        const from = NODES[a];
        const to = NODES[b];
        if (!from || !to) return null;
        return (
          <line
            key={`${a}-${b}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="rgba(255,255,255,0.16)"
            strokeWidth={1}
          />
        );
      })}
      {NODES.map((node, index) => (
        <circle
          key={index}
          cx={node.x}
          cy={node.y}
          r={node.gold ? 5 : 3.5}
          fill={node.gold ? '#d4a843' : 'rgba(255,255,255,0.55)'}
        />
      ))}
    </svg>
  );
}
