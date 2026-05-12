/* ============ BENTO OS · COMPONENT SHEET + DARK MODE ============ */

/* Light tokens */
const bs = {
  bg: '#FAFAF7', ink: '#1B1B1F', dim: '#6B6B73', card: '#FFFFFF',
  border: '#EDEDE6', soft: '#F2F0EA',
  green: '#1F8A5B', red: '#FF6B5B', amber: '#D58F00', blue: '#2E5BFF',
  font: '"Geist", "Inter", system-ui, sans-serif',
  mono: '"Geist Mono", ui-monospace, monospace',
};
/* Dark tokens (paired) */
const bd = {
  bg: '#101013', ink: '#F5F5F2', dim: '#8B8B92', card: '#1A1A1E',
  border: '#26262B', soft: '#1F1F23',
  green: '#3DCD8A', red: '#FF8678', amber: '#F0B33A', blue: '#7C9AFF',
  font: '"Geist", "Inter", system-ui, sans-serif',
  mono: '"Geist Mono", ui-monospace, monospace',
};

/* ---------- COMPONENT SHEET ---------- */
function BentoOSComponentSheet() {
  const card = {
    background: bs.card, border: '1px solid ' + bs.border, borderRadius: 12, padding: 14,
  };
  const sectionTitle = { fontSize: 10, color: bs.dim, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, marginBottom: 10 };
  const row = { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' };

  // Reusable atoms
  const Btn = ({ variant = 'primary', children, size = 'md' }) => {
    const base = {
      borderRadius: 8, fontWeight: 500, cursor: 'pointer', fontFamily: bs.font,
      padding: size === 'sm' ? '6px 10px' : '8px 14px',
      fontSize: size === 'sm' ? 12 : 13,
      border: 'none',
    };
    const v = {
      primary: { background: bs.ink, color: '#fff' },
      secondary: { background: bs.card, color: bs.ink, border: '1px solid ' + bs.border },
      ghost: { background: 'transparent', color: bs.dim },
      danger: { background: bs.red, color: '#fff' },
    }[variant];
    return <button style={{ ...base, ...v }}>{children}</button>;
  };
  const Toggle = ({ on }) => (
    <div style={{ width: 32, height: 18, borderRadius: 999, background: on ? bs.green : '#D8D8D2', position: 'relative', flexShrink: 0 }}>
      <div style={{ width: 14, height: 14, borderRadius: 999, background: '#fff', position: 'absolute', top: 2, left: on ? 16 : 2, boxShadow: '0 1px 2px rgba(0,0,0,.2)' }}/>
    </div>
  );
  const Badge = ({ color, children }) => (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 999,
      background: color + '15', color, display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: color }}/>
      {children}
    </span>
  );
  const Chip = ({ active, children }) => (
    <button style={{
      padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
      background: active ? bs.card : 'transparent', color: active ? bs.ink : bs.dim,
      border: 'none', cursor: 'pointer', boxShadow: active ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
    }}>{children}</button>
  );

  return (
    <div style={{
      width: 900, height: 520, boxSizing: 'border-box', background: bs.bg, color: bs.ink,
      fontFamily: bs.font, padding: 18, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: bs.dim, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Bento OS · Component sheet</div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-.01em', marginTop: 2 }}>Foundation atoms</div>
        </div>
        <div style={{ fontSize: 11, color: bs.dim, fontFamily: bs.mono }}>v0.1 · light · 14px base</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 10, height: 'calc(100% - 50px)' }}>
        {/* Colors */}
        <div style={card}>
          <div style={sectionTitle}>Color</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {[['ink', bs.ink], ['dim', bs.dim], ['border', bs.border], ['soft', bs.soft],
              ['green', bs.green], ['amber', bs.amber], ['red', bs.red], ['blue', bs.blue]].map(([n, c]) => (
              <div key={n}>
                <div style={{ height: 36, borderRadius: 6, background: c, border: '1px solid ' + bs.border }}/>
                <div style={{ fontSize: 9, fontFamily: bs.mono, color: bs.dim, marginTop: 4 }}>{n}</div>
                <div style={{ fontSize: 9, fontFamily: bs.mono, color: bs.dim }}>{c}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Type */}
        <div style={card}>
          <div style={sectionTitle}>Type</div>
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-.02em' }}>Display tank</div>
          <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4 }}>Section heading · medium</div>
          <div style={{ fontSize: 13, color: bs.dim, marginTop: 4 }}>Body text · stays readable at distance.</div>
          <div style={{ fontFamily: bs.mono, fontSize: 11, color: bs.dim, marginTop: 6, letterSpacing: '.04em' }}>MONO · 78.4°F · 192.168.1.40</div>
          <div style={{ fontSize: 10, color: bs.dim, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, marginTop: 8 }}>LABEL · MICRO</div>
        </div>
        {/* Buttons */}
        <div style={card}>
          <div style={sectionTitle}>Buttons</div>
          <div style={{ ...row, marginBottom: 8 }}>
            <Btn variant="primary">Save</Btn>
            <Btn variant="secondary">Cancel</Btn>
            <Btn variant="ghost">Skip</Btn>
          </div>
          <div style={row}>
            <Btn variant="danger" size="sm">Delete</Btn>
            <Btn variant="primary" size="sm">+ Add</Btn>
            <Btn variant="secondary" size="sm">···</Btn>
          </div>
        </div>
        {/* Controls */}
        <div style={card}>
          <div style={sectionTitle}>Controls</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <Toggle on={true}/>
            <Toggle on={false}/>
            <span style={{ fontSize: 11, color: bs.dim, fontFamily: bs.mono }}>on / off</span>
          </div>
          <div style={{ display: 'flex', gap: 2, background: bs.soft, borderRadius: 999, padding: 3, marginBottom: 10, width: 'fit-content' }}>
            <Chip active={true}>24H</Chip>
            <Chip>7D</Chip>
            <Chip>30D</Chip>
          </div>
          <input style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: '1px solid ' + bs.border, borderRadius: 8, fontSize: 12, fontFamily: bs.mono, background: bs.card, color: bs.ink }} defaultValue="reef-pi.local"/>
        </div>
        {/* Status badges */}
        <div style={card}>
          <div style={sectionTitle}>Status</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
            <Badge color={bs.green}>nominal</Badge>
            <Badge color={bs.amber}>warning</Badge>
            <Badge color={bs.red}>critical</Badge>
            <Badge color={bs.dim}>scheduled</Badge>
          </div>
        </div>
        {/* Tile + KPI */}
        <div style={card}>
          <div style={sectionTitle}>Tile · KPI</div>
          <div style={{ background: bs.bg, border: '1px solid ' + bs.border, borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 10, color: bs.dim, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 500 }}>Temperature</div>
            <div style={{ fontFamily: bs.mono, fontSize: 28, fontWeight: 500, marginTop: 4, letterSpacing: '-.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>78.4<span style={{ fontSize: 13, color: bs.dim, marginLeft: 3 }}>°F</span></div>
            <svg width="100%" height="28" viewBox="0 0 220 28" style={{ marginTop: 8 }}>
              <polyline fill="none" stroke={bs.green} strokeWidth="1.5"
                points="0,14 22,12 44,16 66,18 88,12 110,15 132,10 154,8 176,12 198,14 220,12"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
window.BentoOSComponentSheet = BentoOSComponentSheet;

/* ---------- DARK MODE · DASHBOARD ---------- */
function BentoOSDarkDashboard() {
  // 24 hourly samples
  const data = [78.2,78.1,78.0,78.0,78.1,78.3,78.5,78.6,78.7,78.6,78.5,78.5,78.6,78.7,78.6,78.5,78.4,78.3,78.4,78.5,78.6,78.5,78.4,78.4];
  const W = 480, H = 120, pad = 8;
  const min = 76, max = 80;
  const x = (i) => pad + (i / (data.length - 1)) * (W - pad * 2);
  const y = (v) => pad + (1 - (v - min) / (max - min)) * (H - pad * 2);
  const path = data.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = path + ` L${x(data.length - 1)},${H - pad} L${x(0)},${H - pad} Z`;

  const card = {
    background: bd.card, border: '1px solid ' + bd.border, borderRadius: 14,
    padding: 14, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.03), 0 1px 0 rgba(0,0,0,.5)',
  };
  const label = { fontSize: 11, color: bd.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 };
  const numBig = { fontFamily: bd.mono, fontSize: 30, fontWeight: 500, letterSpacing: '-.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 };

  return (
    <div style={{
      width: 900, height: 520, boxSizing: 'border-box', background: bd.bg, color: bd.ink,
      fontFamily: bd.font, padding: 22, overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-.01em' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: bd.green, marginRight: 8, verticalAlign: 1, boxShadow: '0 0 8px ' + bd.green }}/>
            reef-pi · Display tank
          </div>
          <div style={{ display: 'flex', gap: 2, background: bd.soft, borderRadius: 999, padding: 3 }}>
            {['Dashboard','Equipment','Probes','Schedules','Alerts'].map((t, i) => (
              <button key={t} style={{
                padding: '8px 14px', fontSize: 13, fontWeight: 500, borderRadius: 999,
                background: i === 0 ? bd.ink : 'transparent', color: i === 0 ? bd.bg : bd.dim,
                cursor: 'pointer', border: 'none',
              }}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12, color: bd.dim }}>
          <div style={{ padding: '4px 10px', borderRadius: 999, background: bd.soft, border: '1px solid ' + bd.border, fontSize: 11, color: bd.ink, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: bd.green }}/>All nominal
          </div>
          <span>9:42 PM</span>
        </div>
      </div>
      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 10, height: 'calc(100% - 60px)' }}>
        {/* Hero temp · span 2 rows */}
        <div style={{ ...card, gridRow: 'span 2', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div style={label}>Temperature</div>
              <div style={{ ...numBig, fontSize: 52, marginTop: 8 }}>78.4<span style={{ fontSize: 18, color: bd.dim, marginLeft: 4 }}>°F</span></div>
              <div style={{ fontSize: 12, color: bd.green, marginTop: 8 }}>● within target · 76—80°F</div>
            </div>
            <div style={{ display: 'flex', gap: 2, padding: 3, background: bd.soft, borderRadius: 999 }}>
              {['24H','7D','30D'].map((r, i) => (
                <button key={r} style={{
                  padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                  background: i === 0 ? bd.bg : 'transparent', color: i === 0 ? bd.ink : bd.dim,
                  border: i === 0 ? '1px solid ' + bd.border : 'none', cursor: 'pointer',
                }}>{r}</button>
              ))}
            </div>
          </div>
          <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ marginTop: 16, flex: 1 }}>
            <defs>
              <linearGradient id="bd-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={bd.green} stopOpacity=".35"/>
                <stop offset="100%" stopColor={bd.green} stopOpacity="0"/>
              </linearGradient>
            </defs>
            <line x1="0" y1={y(80)} x2={W} y2={y(80)} stroke={bd.green} strokeDasharray="3 3" opacity=".3"/>
            <line x1="0" y1={y(76)} x2={W} y2={y(76)} stroke={bd.green} strokeDasharray="3 3" opacity=".3"/>
            <path d={area} fill="url(#bd-area)"/>
            <path d={path} fill="none" stroke={bd.green} strokeWidth="2"/>
            <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r="4" fill={bd.green}/>
            <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r="10" fill={bd.green} opacity=".25"/>
          </svg>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 8 }}>
            {[['Min','78.0'],['Max','78.7'],['Mean','78.4'],['σ','0.18']].map(([l,v]) => (
              <div key={l}>
                <div style={{ fontSize: 10, color: bd.dim, textTransform: 'uppercase', letterSpacing: '.06em' }}>{l}</div>
                <div style={{ fontFamily: bd.mono, fontSize: 14, fontWeight: 500, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        {/* pH */}
        <div style={card}>
          <div style={label}>pH · probe B</div>
          <div style={{ ...numBig, marginTop: 8 }}>8.21</div>
          <div style={{ fontSize: 11, color: bd.dim, marginTop: 6 }}>steady · 8.10–8.40</div>
        </div>
        {/* Salinity */}
        <div style={card}>
          <div style={label}>Salinity</div>
          <div style={{ ...numBig, marginTop: 8 }}>1.026</div>
          <div style={{ fontSize: 11, color: bd.dim, marginTop: 6 }}>nominal</div>
        </div>
        {/* ATO */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={label}>ATO reservoir</div>
            <div style={{ fontFamily: bd.mono, fontSize: 18, fontWeight: 500 }}>62%</div>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: bd.soft, marginTop: 12, overflow: 'hidden' }}>
            <div style={{ width: '62%', height: '100%', background: bd.blue, boxShadow: '0 0 12px ' + bd.blue }}/>
          </div>
          <div style={{ fontSize: 11, color: bd.dim, marginTop: 8 }}>refill ~3 days</div>
        </div>
        {/* Equipment */}
        <div style={card}>
          <div style={label}>Equipment</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8 }}>
            <div style={{ fontFamily: bd.mono, fontSize: 22, fontWeight: 500 }}>4<span style={{ color: bd.dim, fontSize: 13 }}> / 5 on</span></div>
            <span style={{ fontSize: 11, color: bd.amber, fontWeight: 500, padding: '3px 8px', borderRadius: 999, background: 'rgba(240,179,58,.12)' }}>UV scheduled</span>
          </div>
          <div style={{ fontSize: 11, color: bd.dim, marginTop: 8 }}>next: UV on · 11:00 PM</div>
        </div>
      </div>
    </div>
  );
}
window.BentoOSDarkDashboard = BentoOSDarkDashboard;
