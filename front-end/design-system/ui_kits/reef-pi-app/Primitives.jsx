// Primitives — Toggle, Confirm modal, Sparkline, BarChart
function ToggleSwitch({ on, onChange, label }) {
  return (
    <label style={{display:'inline-flex', alignItems:'center', gap:10, cursor:'pointer'}}>
      <button
        type="button"
        className={'switch' + (on ? ' on' : '')}
        onClick={() => onChange(!on)}
        aria-pressed={on}
        aria-label={label}
      />
      {label && <span style={{fontSize: 14}}>{label}</span>}
    </label>
  );
}

function Confirm({ open, title, description, confirmLabel = 'Delete', onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        <div className="modal-body">{description}</div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ points, stroke = '#27a822', height = 60 }) {
  const max = Math.max(...points), min = Math.min(...points);
  const range = (max - min) || 1;
  const w = 200;
  const path = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = height - ((p - min) / range) * (height - 8) - 4;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none"
         style={{width: '100%', height: '100%', flex: 1, minHeight: 0}}>
      <path d={path} fill="none" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

function BarChart({ values, color = '#1c7e19', height = 60 }) {
  const max = Math.max(...values) || 1;
  const w = 200;
  const bw = w / values.length - 2;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none"
         style={{width: '100%', height: '100%', flex: 1, minHeight: 0}}>
      {values.map((v, i) => {
        const h = (v / max) * (height - 6);
        return <rect key={i} x={i * (bw + 2) + 1} y={height - h} width={bw} height={h} fill={color} rx={1.5} />;
      })}
    </svg>
  );
}

Object.assign(window, { ToggleSwitch, Confirm, Sparkline, BarChart });
