/* ============ BENTO OS · EXTRA SCREENS ============ */
const bento = {
  bg: '#FAFAF7', ink: '#1B1B1F', dim: '#6B6B73', card: '#FFFFFF',
  border: '#EDEDE6', soft: '#F2F0EA',
  green: '#1F8A5B', red: '#FF6B5B', amber: '#D58F00', blue: '#2E5BFF',
  font: '"Geist", "Inter", system-ui, sans-serif',
  mono: '"Geist Mono", ui-monospace, monospace',
};
const bentoCard = {
  width: 900, height: 520, boxSizing: 'border-box', background: bento.bg,
  color: bento.ink, fontFamily: bento.font, padding: 22, position: 'relative', overflow: 'hidden',
};
const bentoTopbar = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 };
const bentoBrand = { fontWeight: 600, fontSize: 15, letterSpacing: '-.01em' };
const bentoDot = { display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: bento.green, marginRight: 8, verticalAlign: 1 };
const bentoPill = { padding: '4px 10px', borderRadius: 999, background: bento.card, border: '1px solid ' + bento.border, fontSize: 11, color: bento.ink, display: 'flex', alignItems: 'center', gap: 6 };
const bentoTile = {
  background: bento.card, border: '1px solid ' + bento.border, borderRadius: 14,
  padding: 14, boxShadow: '0 1px 0 rgba(20,20,40,.02), 0 1px 3px rgba(20,20,40,.03)',
};
const bentoTabs = (active) => ({
  padding: '8px 14px', fontSize: 13, fontWeight: 500, borderRadius: 999,
  background: active ? bento.ink : 'transparent', color: active ? '#fff' : bento.dim,
  cursor: 'pointer', border: 'none',
});
function BentoNav({ active }) {
  const tabs = ['Dashboard','Equipment','Probes','Schedules','Alerts'];
  return (
    <div style={bentoTopbar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={bentoBrand}><span style={bentoDot}/>reef-pi · Display tank</div>
        <div style={{ display: 'flex', gap: 2, background: bento.soft, borderRadius: 999, padding: 3 }}>
          {tabs.map((t) => <button key={t} style={bentoTabs(t === active)}>{t}</button>)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12, color: bento.dim }}>
        <div style={bentoPill}><span style={{ width: 6, height: 6, borderRadius: 999, background: bento.green }}/>All nominal</div>
        <span>up 4d</span><span>9:42 PM</span>
      </div>
    </div>
  );
}

/* ---------- Equipment ---------- */
function BentoOSEquipment() {
  const rows = [
    { name: 'Heater',          type: 'heater.01',    state: true,  watts: 150, since: '04h 12m', sched: 'Auto · target 78.5°F' },
    { name: 'Protein skimmer', type: 'skimmer.01',   state: true,  watts: 12,  since: '4d 06h',  sched: '24/7' },
    { name: 'Return pump',     type: 'return.01',    state: true,  watts: 38,  since: '4d 06h',  sched: '24/7' },
    { name: 'Powerhead',       type: 'powerhead.01', state: true,  watts: 14,  since: '4d 06h',  sched: 'Pulse · 10s/10s' },
    { name: 'UV',              type: 'uv.01',        state: false, watts: 0,   since: '2d 14h',  sched: 'Daily · 23:00 — 03:00' },
    { name: 'ATO pump',        type: 'ato.01',       state: 'idle',watts: 0,   since: '36h',     sched: 'Float-triggered' },
  ];
  const Toggle = ({ on }) => {
    const isOn = on === true;
    const isIdle = on === 'idle';
    const bg = isOn ? bento.green : isIdle ? bento.amber : '#D8D8D2';
    return (
      <div style={{ width: 32, height: 18, borderRadius: 999, background: bg, position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 14, height: 14, borderRadius: 999, background: '#fff', position: 'absolute', top: 2, left: isOn || isIdle ? 16 : 2, boxShadow: '0 1px 2px rgba(0,0,0,.2)' }}/>
      </div>
    );
  };
  return (
    <div style={bentoCard}>
      <BentoNav active="Equipment"/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 12, height: 'calc(100% - 60px)' }}>
        <div style={{ ...bentoTile, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid ' + bento.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>6 devices</div>
            <button style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid ' + bento.border, background: bento.card, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>+ Add device</button>
          </div>
          {rows.map((r, i) => (
            <div key={r.name} style={{
              display: 'grid', gridTemplateColumns: '1fr 110px 70px 110px 50px',
              alignItems: 'center', padding: '14px 18px', gap: 14,
              borderBottom: i < rows.length - 1 ? '1px solid ' + bento.border : 'none',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: bento.dim, fontFamily: bento.mono, marginTop: 2 }}>{r.type}</div>
              </div>
              <div style={{ fontSize: 12, color: bento.dim }}>{r.sched}</div>
              <div style={{ fontFamily: bento.mono, fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{r.watts} W</div>
              <div style={{ fontSize: 11, color: bento.dim }}>{r.state === false ? 'off · ' : 'on · '}{r.since}</div>
              <Toggle on={r.state}/>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={bentoTile}>
            <div style={{ fontSize: 11, color: bento.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>Power draw · now</div>
            <div style={{ fontFamily: bento.mono, fontSize: 30, fontWeight: 500, marginTop: 4, letterSpacing: '-.02em' }}>214<span style={{ fontSize: 14, color: bento.dim, marginLeft: 4 }}>W</span></div>
            <div style={{ fontSize: 11, color: bento.dim, marginTop: 4 }}>≈ $0.62 / day</div>
          </div>
          <div style={bentoTile}>
            <div style={{ fontSize: 11, color: bento.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500, marginBottom: 8 }}>Up next</div>
            {[['11:00 PM','UV · ON'],['Tomorrow 6:00 AM','Lights · sunrise'],['Wed 2:00 PM','Feeding · scheduled']].map(([t,n]) => (
              <div key={t} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid ' + bento.border, fontSize: 12 }}>
                <span style={{ color: bento.dim }}>{t}</span>
                <span>{n}</span>
              </div>
            ))}
          </div>
          <div style={bentoTile}>
            <div style={{ fontSize: 11, color: bento.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>Reminder</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>ATO reservoir · refill in ~3 days</div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.BentoOSEquipment = BentoOSEquipment;

/* ---------- Temperature detail ---------- */
function BentoOSTempDetail() {
  const data = [78.2,78.1,78.0,78.0,78.1,78.3,78.5,78.6,78.7,78.6,78.5,78.5,78.6,78.7,78.6,78.5,78.4,78.3,78.4,78.5,78.6,78.5,78.4,78.4];
  const min = 76, max = 80;
  const W = 700, H = 220, pad = 10;
  const x = (i) => pad + (i / (data.length - 1)) * (W - pad * 2);
  const y = (v) => pad + (1 - (v - min) / (max - min)) * (H - pad * 2);
  const path = data.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = path + ` L${x(data.length-1)},${H-pad} L${x(0)},${H-pad} Z`;
  return (
    <div style={bentoCard}>
      <BentoNav active="Probes"/>
      <div style={{ fontSize: 12, color: bento.dim, marginBottom: 8 }}>Probes / Temperature · Probe A</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 10, height: 'calc(100% - 84px)' }}>
        <div style={{ ...bentoTile, padding: 18, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div style={{ fontSize: 11, color: bento.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>Current</div>
              <div style={{ fontFamily: bento.mono, fontSize: 52, fontWeight: 500, lineHeight: 1, letterSpacing: '-.025em', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>78.4<span style={{ fontSize: 20, color: bento.dim, marginLeft: 4 }}>°F</span></div>
              <div style={{ fontSize: 12, color: bento.green, marginTop: 6 }}>● within target · 76–80°F</div>
            </div>
            <div style={{ display: 'flex', gap: 2, padding: 3, background: bento.soft, borderRadius: 999 }}>
              {['1H','6H','24H','7D','30D'].map((r,i) => (
                <button key={r} style={{
                  padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                  background: i === 2 ? bento.card : 'transparent', color: i === 2 ? bento.ink : bento.dim,
                  border: 'none', cursor: 'pointer', boxShadow: i === 2 ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
                }}>{r}</button>
              ))}
            </div>
          </div>
          <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ marginTop: 16, flex: 1 }}>
            <defs>
              <linearGradient id="bento-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={bento.green} stopOpacity=".25"/>
                <stop offset="100%" stopColor={bento.green} stopOpacity="0"/>
              </linearGradient>
            </defs>
            <rect x="0" y={y(80)} width={W} height={y(76) - y(80)} fill={bento.green} opacity=".05"/>
            <line x1="0" y1={y(80)} x2={W} y2={y(80)} stroke={bento.green} strokeDasharray="3 3" opacity=".5"/>
            <line x1="0" y1={y(76)} x2={W} y2={y(76)} stroke={bento.green} strokeDasharray="3 3" opacity=".5"/>
            <path d={area} fill="url(#bento-area)"/>
            <path d={path} fill="none" stroke={bento.green} strokeWidth="2"/>
            <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r="4" fill={bento.green}/>
            <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r="8" fill={bento.green} opacity=".18"/>
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: bento.dim }}>
            {['00:00','06:00','12:00','18:00','24:00'].map(t => <span key={t}>{t}</span>)}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={bentoTile}>
            <div style={{ fontSize: 11, color: bento.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>Stats · 24h</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
              {[['Min','78.0'],['Max','78.7'],['Mean','78.4'],['σ','0.18']].map(([l,v]) => (
                <div key={l}>
                  <div style={{ fontSize: 11, color: bento.dim }}>{l}</div>
                  <div style={{ fontFamily: bento.mono, fontSize: 18, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={bentoTile}>
            <div style={{ fontSize: 11, color: bento.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>Bound · Heater</div>
            <div style={{ fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>
              Heater turns <b>on</b> below 78.0°F, <b>off</b> above 78.6°F.
            </div>
            <div style={{ fontSize: 11, color: bento.dim, marginTop: 8, fontFamily: bento.mono }}>7 cycles · 18% duty</div>
          </div>
          <button style={{ padding: '10px', borderRadius: 10, border: '1px solid ' + bento.border, background: bento.card, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Calibrate probe</button>
        </div>
      </div>
    </div>
  );
}
window.BentoOSTempDetail = BentoOSTempDetail;

/* ---------- Alerts ---------- */
function BentoOSAlerts() {
  const items = [
    { sev: 'crit',  ts: 'Today · 3:14 AM', src: 'Temperature · Probe A', msg: 'Hit 80.4°F — exceeded max threshold of 80.0°F', dur: '14m', state: 'resolved' },
    { sev: 'warn',  ts: 'Yesterday · 6:42 PM', src: 'ATO reservoir', msg: 'Below 25% — refill recommended within 3 days', dur: 'open 36h', state: 'open' },
    { sev: 'info',  ts: 'Yesterday · 11:00 PM', src: 'UV', msg: 'Scheduled on · daily 23:00 — 03:00', dur: '4h', state: 'ok' },
    { sev: 'info',  ts: 'Yesterday · 2:00 PM',  src: 'Feeding', msg: 'Manual feeding mode triggered', dur: '2m', state: 'ok' },
    { sev: 'crit',  ts: 'Apr 19 · 2:08 AM',  src: 'pH · Probe B', msg: '7.94 — below alarm threshold of 8.00', dur: '22m', state: 'resolved' },
    { sev: 'info',  ts: 'Apr 18 · 9:22 AM',  src: 'System', msg: 'Firmware updated to v5.2.0', dur: '—', state: 'ok' },
  ];
  const sevColor = { crit: bento.red, warn: bento.amber, info: bento.dim };
  const sevDot = (s) => ({ width: 8, height: 8, borderRadius: 999, background: sevColor[s], flexShrink: 0 });
  return (
    <div style={bentoCard}>
      <BentoNav active="Alerts"/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 10, height: 'calc(100% - 60px)' }}>
        <div style={{ ...bentoTile, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid ' + bento.border, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 2, background: bento.soft, borderRadius: 999, padding: 3 }}>
              {['All · 6','Open · 1','Resolved · 5'].map((t,i) => (
                <button key={t} style={{
                  padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                  background: i === 0 ? bento.card : 'transparent', color: i === 0 ? bento.ink : bento.dim,
                  border: 'none', cursor: 'pointer', boxShadow: i === 0 ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
                }}>{t}</button>
              ))}
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 12, color: bento.dim }}>Last 30 days</div>
          </div>
          {items.map((it, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '14px 1fr 110px 90px',
              alignItems: 'start', padding: '14px 18px', gap: 14,
              borderBottom: i < items.length - 1 ? '1px solid ' + bento.border : 'none',
            }}>
              <div style={{ ...sevDot(it.sev), marginTop: 6 }}/>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{it.src}</div>
                <div style={{ fontSize: 12, color: bento.dim, marginTop: 2, lineHeight: 1.4 }}>{it.msg}</div>
              </div>
              <div style={{ fontSize: 11, color: bento.dim }}>{it.ts}</div>
              <div style={{
                fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 999,
                background: it.state === 'open' ? '#FFF1ED' : it.state === 'resolved' ? '#EFF7F2' : bento.soft,
                color: it.state === 'open' ? bento.red : it.state === 'resolved' ? bento.green : bento.dim,
                textAlign: 'center', height: 'fit-content',
              }}>{it.state}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={bentoTile}>
            <div style={{ fontSize: 11, color: bento.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>Open · 1</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <div style={sevDot('warn')}/>
              <div style={{ fontSize: 13, fontWeight: 500 }}>ATO reservoir low</div>
            </div>
            <button style={{ marginTop: 12, width: '100%', padding: '8px', borderRadius: 8, border: 'none', background: bento.ink, color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Acknowledge</button>
          </div>
          <div style={bentoTile}>
            <div style={{ fontSize: 11, color: bento.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>Notifications</div>
            {[['Email','jules@reefkeep.com'],['Push','iPhone'],['Webhook','Discord']].map(([t,v]) => (
              <div key={t} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12, borderBottom: '1px solid ' + bento.border }}>
                <span>{t}</span><span style={{ color: bento.dim }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
window.BentoOSAlerts = BentoOSAlerts;

/* ---------- Feeding ---------- */
function BentoOSFeeding() {
  return (
    <div style={{ ...bentoCard, padding: 0 }}>
      <div style={{ position: 'absolute', inset: 0, opacity: .4 }}>
        <div style={{ ...bentoCard, position: 'static' }}><BentoNav active="Dashboard"/></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(250,250,247,.85)', backdropFilter: 'blur(3px)' }}/>
      <div style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
        width: 480, background: bento.card, borderRadius: 20, padding: 28,
        boxShadow: '0 20px 60px rgba(20,20,40,.18), 0 0 0 1px ' + bento.border,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: bento.amber, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>● Feeding mode</div>
            <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, letterSpacing: '-.02em' }}>Pumps paused</div>
          </div>
          <button style={{ width: 32, height: 32, borderRadius: 999, border: 'none', background: bento.soft, color: bento.dim, cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>
        <div style={{ position: 'relative', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="68" fill="none" stroke={bento.border} strokeWidth="6"/>
            <circle cx="80" cy="80" r="68" fill="none" stroke={bento.amber} strokeWidth="6"
              strokeDasharray="427.26" strokeDashoffset="170.9" transform="rotate(-90 80 80)" strokeLinecap="round"/>
          </svg>
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <div style={{ fontFamily: bento.mono, fontSize: 44, fontWeight: 500, letterSpacing: '-.03em', fontVariantNumeric: 'tabular-nums' }}>1:14</div>
            <div style={{ fontSize: 11, color: bento.dim, textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 2 }}>remaining</div>
          </div>
        </div>
        <div style={{ ...bentoTile, marginTop: 16, padding: 14, background: bento.soft, border: 'none' }}>
          <div style={{ fontSize: 11, color: bento.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500, marginBottom: 8 }}>Suspended</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['Return pump','Protein skimmer','Powerhead'].map((n) => (
              <div key={n} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span>{n}</span>
                <span style={{ color: bento.amber, fontWeight: 500 }}>paused</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid ' + bento.border, background: bento.card, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>+ 1 min</button>
          <button style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid ' + bento.border, background: bento.card, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Resume now</button>
          <button style={{ flex: 1.4, padding: '11px', borderRadius: 10, border: 'none', background: bento.ink, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel feeding</button>
        </div>
      </div>
    </div>
  );
}
window.BentoOSFeeding = BentoOSFeeding;
