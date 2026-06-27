import { imageToContainer } from '../utils/viewportCoords.js';

function MeasurementLine({ start, end, label, color, viewportSize, zoom, pan, rotation, dashed }) {
  const p1 = imageToContainer(start.x, start.y, viewportSize, zoom, pan, rotation);
  const p2 = imageToContainer(end.x, end.y, viewportSize, zoom, pan, rotation);
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;

  return (
    <g>
      <line
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        stroke={color}
        strokeWidth="2"
        strokeDasharray={dashed ? '6 4' : undefined}
      />
      <circle cx={p1.x} cy={p1.y} r="4" fill={color} stroke="#0f172a" strokeWidth="1.5" />
      <circle cx={p2.x} cy={p2.y} r="4" fill={color} stroke="#0f172a" strokeWidth="1.5" />
      {label && (
        <g transform={`translate(${midX}, ${midY - 10})`}>
          <rect
            x={-36}
            y={-12}
            width={72}
            height={20}
            rx={4}
            fill="rgba(15, 23, 42, 0.88)"
            stroke={color}
            strokeWidth="1"
          />
          <text
            x={0}
            y={2}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="11"
            fontWeight="600"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

export default function MeasurementOverlay({
  measurements = [],
  draft = null,
  viewportSize,
  zoom,
  pan,
  rotation,
}) {
  if (!viewportSize.cw) return null;

  return (
    <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible">
      {measurements.map((item) => (
        <MeasurementLine
          key={item.id}
          start={item.start}
          end={item.end}
          label={item.label}
          color="#38bdf8"
          viewportSize={viewportSize}
          zoom={zoom}
          pan={pan}
          rotation={rotation}
        />
      ))}
      {draft?.start && draft?.end && (
        <MeasurementLine
          start={draft.start}
          end={draft.end}
          label={draft.label}
          color="#fbbf24"
          viewportSize={viewportSize}
          zoom={zoom}
          pan={pan}
          rotation={rotation}
          dashed
        />
      )}
    </svg>
  );
}
