/* ============ BENTO OS · MOBILE SCREENS ============ */

const bentoM = {
  bg: '#FAFAF7', ink: '#1B1B1F', dim: '#6B6B73', card: '#FFFFFF',
  border: '#EDEDE6', soft: '#F2F0EA',
  green: '#1F8A5B', red: '#FF6B5B', amber: '#D58F00', blue: '#2E5BFF',
  font: '"Geist", "Inter", system-ui, sans-serif',
  mono: '"Geist Mono", ui-monospace, monospace',
};
const bentoMScreen = {
  width: 390, height: 844, boxSizing: 'border-box', background: bentoM.bg, color: bentoM.ink,
  fontFamily: bentoM.font, position: 'relative', overflow: 'hidden', paddingTop: 56,
};
const bentoMHeader = { padding: '0 18px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const bentoMTile = {
  background: bentoM.card, border: '1px solid ' + bentoM.border, borderRadius: 16,
  padding: 14, boxShadow: '0 1px 0 rgba(20,20,40,.02), 0 1px 3px rgba(20,20,40,.03)',
};
const bentoMTabbar = {
  position: 'absolute', bottom: 0, left: 0, right: 0,
  paddingBottom: 28, paddingTop: 10,
  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
  background: 'rgba(250,250,247,.9)', backdropFilter: 'blur(12px)',
  borderTop: '1px solid ' + bentoM.border,
};
const bentoMTab = (active) => ({
  padding: '6px 4px', textAlign: 'center', cursor: 'pointer',
  fontSize: 11, fontWeight: 500, color: active ? bentoM.ink : bentoM.dim,
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
  fontFamily: bentoM.font,
});
const bentoMIcon = (active) => ({
  width: 22, height: 22, borderRadius: 8,
  background: active ? bentoM.ink : 'transparent',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: active ? '#fff' : bentoM.dim, fontSize: 11, fontWeight: 600,
});
function BentoMTabbar({ active }) {
  const tabs = [['Home','H'],['Equip','E'],['Alerts','A'],['More','…']];
  return (
    <div style={bentoMTabbar}>
      {tabs.map(([n, ic]) => (
        <div key={n} style={bentoMTab(n === active)}>
          <div style={bentoMIcon(n === active)}>{ic}</div>
          <span>{n}</span>
        </div>
      ))}
    </div>
  );
}

/* ---- Dashboard ---- */
function BentoOSMDash() {
  return (
    <div style={bentoMScreen}>
      <div style={bentoMHeader}>
        <div>
          <div style={{ fontSize: 11, color: bentoM.dim }}>Tuesday · 9:42 PM</div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-.01em', marginTop: 2 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: bentoM.green, marginRight: 8, verticalAlign: 2 }}/>
            Display tank
          </div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: bentoM.card, border: '1px solid ' + bentoM.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
      </div>
      <div style={{ padding: '8px 18px 100px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Hero temp */}
        <div style={bentoMTile}>
          <div style={{ fontSize: 11, color: bentoM.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>Temperature</div>
          <div style={{ fontFamily: bentoM.mono, fontSize: 44, fontWeight: 500, marginTop: 4, lineHeight: 1, letterSpacing: '-.025em', fontVariantNumeric: 'tabular-nums' }}>
            78.4<span style={{ fontSize: 18, color: bentoM.dim, marginLeft: 2 }}>°F</span>
          </div>
          <div style={{ fontSize: 11, color: bentoM.green, marginTop: 6 }}>● within target · 76—80°F</div>
          <svg width="100%" height="60" viewBox="0 0 320 60" style={{ marginTop: 10 }}>
            <defs>
              <linearGradient id="bm-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={bentoM.green} stopOpacity=".22"/>
                <stop offset="100%" stopColor={bentoM.green} stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d="M0,32 L26,28 L52,34 L78,38 L104,30 L130,36 L156,28 L182,22 L208,28 L234,32 L260,28 L286,30 L320,28 L320,60 L0,60 Z" fill="url(#bm-fill)"/>
            <polyline fill="none" stroke={bentoM.green} strokeWidth="2"
              points="0,32 26,28 52,34 78,38 104,30 130,36 156,28 182,22 208,28 234,32 260,28 286,30 320,28"/>
            <circle cx="320" cy="28" r="3.5" fill={bentoM.green}/>
          </svg>
        </div>
        {/* 2-up */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={bentoMTile}>
            <div style={{ fontSize: 11, color: bentoM.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>pH</div>
            <div style={{ fontFamily: bentoM.mono, fontSize: 24, fontWeight: 500, marginTop: 4, fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em' }}>8.21</div>
            <div style={{ fontSize: 11, color: bentoM.dim, marginTop: 4 }}>steady</div>
          </div>
          <div style={bentoMTile}>
            <div style={{ fontSize: 11, color: bentoM.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>Salinity</div>
            <div style={{ fontFamily: bentoM.mono, fontSize: 24, fontWeight: 500, marginTop: 4, fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em' }}>1.026</div>
            <div style={{ fontSize: 11, color: bentoM.dim, marginTop: 4 }}>nominal</div>
          </div>
        </div>
        {/* ATO with bar */}
        <div style={bentoMTile}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 11, color: bentoM.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>ATO reservoir</div>
            <div style={{ fontFamily: bentoM.mono, fontSize: 18, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>62%</div>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: bentoM.soft, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ width: '62%', height: '100%', background: bentoM.blue }}/>
          </div>
          <div style={{ fontSize: 11, color: bentoM.dim, marginTop: 6 }}>refill in ~3 days</div>
        </div>
        {/* Equipment summary */}
        <div style={bentoMTile}>
          <div style={{ fontSize: 11, color: bentoM.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>Equipment</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <div style={{ fontFamily: bentoM.mono, fontSize: 22, fontWeight: 500 }}>4<span style={{ color: bentoM.dim, fontSize: 13 }}> / 5 on</span></div>
            <div style={{ fontSize: 11, color: bentoM.dim }}>UV scheduled · 11 PM</div>
          </div>
        </div>
        {/* Feed CTA */}
        <button style={{
          width: '100%', padding: 14, borderRadius: 12, border: 'none',
          background: bentoM.ink, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: bentoM.font,
        }}>
          <span>Feed</span>
          <span style={{ opacity: .55, fontSize: 13 }}>2:00</span>
        </button>
      </div>
      <BentoMTabbar active="Home"/>
    </div>
  );
}
window.BentoOSMDash = BentoOSMDash;

/* ---- Equipment ---- */
function BentoOSMEquip() {
  const rows = [
    { name: 'Heater',          type: 'heater.01',    state: true,  watts: 150, sched: 'Auto · 78.5°F' },
    { name: 'Protein skimmer', type: 'skimmer.01',   state: true,  watts: 12,  sched: '24/7' },
    { name: 'Return pump',     type: 'return.01',    state: true,  watts: 38,  sched: '24/7' },
    { name: 'Powerhead',       type: 'powerhead.01', state: true,  watts: 14,  sched: 'Pulse 10/10' },
    { name: 'UV',              type: 'uv.01',        state: false, watts: 0,   sched: 'Daily 23:00' },
    { name: 'ATO pump',        type: 'ato.01',       state: 'idle',watts: 0,   sched: 'Float' },
  ];
  const Toggle = ({ on }) => {
    const isOn = on === true;
    const isIdle = on === 'idle';
    const bg = isOn ? bentoM.green : isIdle ? bentoM.amber : '#D8D8D2';
    return (
      <div style={{ width: 32, height: 18, borderRadius: 999, background: bg, position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 14, height: 14, borderRadius: 999, background: '#fff', position: 'absolute', top: 2, left: isOn || isIdle ? 16 : 2, boxShadow: '0 1px 2px rgba(0,0,0,.2)' }}/>
      </div>
    );
  };
  return (
    <div style={bentoMScreen}>
      <div style={bentoMHeader}>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.02em' }}>Equipment</div>
        <button style={{ width: 32, height: 32, borderRadius: 999, border: '1px solid ' + bentoM.border, background: bentoM.card, fontSize: 16, color: bentoM.ink }}>+</button>
      </div>
      <div style={{ padding: '10px 18px', display: 'flex', gap: 6 }}>
        {['All','On','Off','Scheduled'].map((t, i) => (
          <button key={t} style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
            background: i === 0 ? bentoM.ink : bentoM.card, color: i === 0 ? '#fff' : bentoM.dim,
            border: '1px solid ' + (i === 0 ? bentoM.ink : bentoM.border), cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>
      <div style={{ padding: '8px 18px 100px' }}>
        <div style={{ ...bentoMTile, padding: 0, overflow: 'hidden' }}>
          {rows.map((r, i) => (
            <div key={r.name} style={{
              display: 'grid', gridTemplateColumns: '1fr 60px 36px',
              alignItems: 'center', padding: '14px', gap: 10,
              borderBottom: i < rows.length - 1 ? '1px solid ' + bentoM.border : 'none',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: bentoM.dim, marginTop: 2 }}>{r.sched} · {r.watts} W</div>
              </div>
              <div style={{ fontSize: 11, color: r.state === true ? bentoM.green : r.state === 'idle' ? bentoM.amber : bentoM.dim, textAlign: 'right' }}>
                {r.state === true ? 'on' : r.state === 'idle' ? 'idle' : 'off'}
              </div>
              <Toggle on={r.state}/>
            </div>
          ))}
        </div>
      </div>
      <BentoMTabbar active="Equip"/>
    </div>
  );
}
window.BentoOSMEquip = BentoOSMEquip;

/* ---- Alerts ---- */
function BentoOSMAlerts() {
  const items = [
    { sev: 'crit', ts: 'Today · 3:14 AM',     src: 'Temperature · Probe A', msg: 'Hit 80.4°F — exceeded max', state: 'resolved' },
    { sev: 'warn', ts: 'Yesterday · 6:42 PM', src: 'ATO reservoir', msg: 'Below 25% — refill recommended', state: 'open' },
    { sev: 'info', ts: 'Yesterday · 11:00 PM',src: 'UV', msg: 'Scheduled on · daily 23:00', state: 'ok' },
    { sev: 'info', ts: 'Yesterday · 2:00 PM', src: 'Feeding', msg: 'Manual feeding mode', state: 'ok' },
    { sev: 'crit', ts: 'Apr 19 · 2:08 AM',    src: 'pH · Probe B', msg: '7.94 below alarm threshold', state: 'resolved' },
  ];
  const sevColor = { crit: bentoM.red, warn: bentoM.amber, info: bentoM.dim };
  return (
    <div style={bentoMScreen}>
      <div style={bentoMHeader}>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.02em' }}>Alerts</div>
        <div style={{ fontSize: 12, color: bentoM.dim }}>Last 30 days</div>
      </div>
      <div style={{ padding: '10px 18px', display: 'flex', gap: 6 }}>
        {['All · 6','Open · 1','Resolved · 5'].map((t, i) => (
          <button key={t} style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
            background: i === 0 ? bentoM.ink : bentoM.card, color: i === 0 ? '#fff' : bentoM.dim,
            border: '1px solid ' + (i === 0 ? bentoM.ink : bentoM.border), cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>
      <div style={{ padding: '8px 18px 100px' }}>
        {/* Pinned open */}
        <div style={{ ...bentoMTile, marginBottom: 10, padding: 14, borderColor: '#FFE2DA', background: '#FFF8F5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: 999, background: bentoM.amber }}/>
            <div style={{ fontSize: 11, color: bentoM.amber, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Open · ATO low</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, marginTop: 6 }}>Reservoir at 24% — refill within 3 days</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid ' + bentoM.border, background: bentoM.card, fontSize: 12, fontWeight: 500 }}>Snooze</button>
            <button style={{ flex: 1, padding: 8, borderRadius: 8, border: 'none', background: bentoM.ink, color: '#fff', fontSize: 12, fontWeight: 500 }}>Acknowledge</button>
          </div>
        </div>
        <div style={{ ...bentoMTile, padding: 0, overflow: 'hidden' }}>
          {items.filter(it => it.state !== 'open').map((it, i, arr) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '14px 1fr 80px',
              alignItems: 'start', padding: '14px', gap: 12,
              borderBottom: i < arr.length - 1 ? '1px solid ' + bentoM.border : 'none',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: 999, background: sevColor[it.sev], marginTop: 6 }}/>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{it.src}</div>
                <div style={{ fontSize: 12, color: bentoM.dim, marginTop: 2, lineHeight: 1.4 }}>{it.msg}</div>
                <div style={{ fontSize: 11, color: bentoM.dim, marginTop: 4 }}>{it.ts}</div>
              </div>
              <div style={{
                fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 999,
                background: it.state === 'resolved' ? '#EFF7F2' : bentoM.soft,
                color: it.state === 'resolved' ? bentoM.green : bentoM.dim,
                textAlign: 'center', height: 'fit-content',
              }}>{it.state}</div>
            </div>
          ))}
        </div>
      </div>
      <BentoMTabbar active="Alerts"/>
    </div>
  );
}
window.BentoOSMAlerts = BentoOSMAlerts;
