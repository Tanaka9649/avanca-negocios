/**
 * Rede de conexões do hero de Eventos. Em repouso: pontos e ligações soltas (pessoas e empresas).
 * Ao rolar, cada ponto viaja até um ponto do contorno do símbolo A e as ligações dão lugar ao triângulo.
 * Renderizado no servidor; os deslocamentos ficam em data-dx/data-dy para a cena de rolagem.
 */
const NODES: [number, number, number][] = [
  // x, y, raio
  [118, 132, 6], [236, 64, 5], [392, 96, 7], [512, 168, 5], [560, 300, 6], [470, 392, 8],
  [330, 236, 9], [196, 286, 6], [72, 352, 5], [168, 458, 7], [318, 498, 5], [444, 506, 6],
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 5],
  [6, 2], [6, 1], [7, 0], [6, 10], [7, 9], [6, 4],
];

// Contorno do A: triângulo externo e contra-forma interna
const APEX: [number, number] = [300, 96];
const LEFT: [number, number] = [96, 476];
const RIGHT: [number, number] = [504, 476];
const INNER = { apex: [300, 300] as [number, number], left: [246, 392] as [number, number], right: [354, 392] as [number, number] };

const lerp = (a: [number, number], b: [number, number], t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

const TARGETS: [number, number][] = [
  lerp(APEX, LEFT, 0.42), APEX, lerp(APEX, RIGHT, 0.2), lerp(APEX, RIGHT, 0.5), lerp(APEX, RIGHT, 0.8), RIGHT,
  INNER.apex, INNER.left, lerp(APEX, LEFT, 0.78), LEFT, lerp(LEFT, RIGHT, 0.42), INNER.right,
];

export function NetworkArt() {
  return (
    <svg viewBox="0 0 640 560" className="net" aria-hidden="true" data-net-art>
      <defs>
        <linearGradient id="net-grad" gradientUnits="userSpaceOnUse" x1="80" y1="80" x2="560" y2="500">
          <stop offset="0" stopColor="#e39282" />
          <stop offset="0.38" stopColor="#bc33f2" />
          <stop offset="0.62" stopColor="#862cd4" />
          <stop offset="1" stopColor="#021b8d" />
        </linearGradient>
      </defs>
      <g className="net__edges">
        {EDGES.map(([a, b], i) => (
          <line key={i} data-net-edge pathLength={1} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} style={{ animationDelay: `${0.5 + i * 0.045}s` }} />
        ))}
      </g>
      <g className="net__a" fill="none" stroke="url(#net-grad)" strokeWidth="2.4" strokeLinejoin="round">
        <path data-net-a pathLength={1} d={`M${LEFT} L${APEX} L${RIGHT} Z`} />
        <path data-net-a pathLength={1} d={`M${INNER.left} L${INNER.apex} L${INNER.right} Z`} />
      </g>
      <g className="net__nodes">
        {NODES.map(([x, y, r], i) => (
          // O grupo recebe o deslocamento da rolagem; o círculo guarda a animação de entrada.
          <g key={i} data-net-node data-dx={TARGETS[i][0] - x} data-dy={TARGETS[i][1] - y}>
            <circle cx={x} cy={y} r={r} style={{ animationDelay: `${0.35 + i * 0.05}s` }} />
          </g>
        ))}
      </g>
    </svg>
  );
}
